import * as React from "react";
import { ArrowLeft, Eye, EyeOff, RefreshCw, Trash2, Upload } from "lucide-react";
import { deleteSail, getSail, listBoats, listEvents, processGpx, processStoredGpx, refreshWind, replaceGpx, updateSail, type SailPatch } from "@/lib/admin-api";
import { EVENT_META, describeEvent, summarizeLog, type EventRow } from "@/lib/events";
import { POINT_OF_SAIL_LABEL, type PointOfSail } from "@/lib/analysis";
import { SECTION_TITLES } from "@/lib/sections";
import { SAIL_ROLES, type BoatRow, type SailRow } from "@/lib/types";
import { beaufort, compass, formatDuration, formatKn, formatNm } from "@/lib/units";
import { url } from "@/lib/url";
import { DeployContext } from "./AdminApp";
import MediaManager from "./MediaManager";
import TrackPreview from "./TrackPreview";
import { Button, Card, DropZone, Field, Input, MarkdownField, Notice, SaveState, Select, Spinner, TagInput, navigate, useAutosave } from "./ui";

const SECTION_FIELDS = [
  { key: "how_it_went", title: SECTION_TITLES.howItWent, placeholder: "Conditions, who came along, highlights and the not-so-great bits…" },
  { key: "what_i_practised", title: SECTION_TITLES.whatIPractised, placeholder: "- Tacking in the puffs\n- Man overboard drill" },
  { key: "learnings", title: SECTION_TITLES.learnings, placeholder: "- Ease the main early when a gust hits" },
  { key: "notes", title: SECTION_TITLES.notes, placeholder: "Anything else: gear, repairs, plans for next time…" },
] as const;

export default function SailEditor({ id }: { id: string }) {
  const { deploy } = React.useContext(DeployContext);
  const [sail, setSail] = React.useState<SailRow | null>(null);
  const [boats, setBoats] = React.useState<BoatRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<null | "publish" | "gpx" | "wind" | "delete">(null);
  const [notice, setNotice] = React.useState<{ tone: "ok" | "error" | "warn"; text: string } | null>(null);

  const [events, setEvents] = React.useState<EventRow[]>([]);

  React.useEffect(() => {
    let active = true;
    Promise.all([getSail(id), listBoats(), listEvents(id).catch(() => [] as EventRow[])])
      .then(async ([s, b, ev]) => {
        if (!active) return;
        setSail(s);
        setBoats(b);
        setEvents(ev);
        // A sail from the app has only its GPX file: compute stats, wind and the analysis once.
        if (s.gpx_path && !s.stats) {
          setBusy("gpx");
          setNotice({ tone: "ok", text: "Processing the track from the Sail Tracker app…" });
          try {
            const { sail: processed, windError } = await processStoredGpx(s);
            if (!active) return;
            setSail(processed);
            setNotice(windError ? { tone: "warn", text: `Track processed, but wind failed: ${windError}` } : { tone: "ok", text: "Track from the Sail Tracker app processed. Review the story and publish." });
          } catch (e) {
            if (active) setNotice({ tone: "error", text: `Could not process the app track: ${(e as Error).message}` });
          } finally {
            if (active) setBusy(null);
          }
        }
      })
      .catch((e: Error) => setError(e.message));
    return () => {
      active = false;
    };
  }, [id]);

  const save = useAutosave<SailRow>(async (patch) => {
    const updated = await updateSail(id, patch as SailPatch);
    setSail((s) => (s ? { ...s, updated_at: updated.updated_at, slug: updated.slug } : updated));
  });

  const set = <K extends keyof SailRow>(key: K, value: SailRow[K]) => {
    setSail((s) => (s ? { ...s, [key]: value } : s));
    save.queue({ [key]: value } as Partial<SailRow>);
  };

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!sail) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        <Spinner />
      </div>
    );
  }

  const published = sail.status === "published";

  const togglePublish = async () => {
    setBusy("publish");
    setNotice(null);
    try {
      await save.flush();
      if (!published && !sail.gpx_path) throw new Error("Add a GPX track before publishing.");
      const updated = await updateSail(id, { status: published ? "draft" : "published" });
      setSail((s) => (s ? { ...s, status: updated.status, published_at: updated.published_at } : s));
      await deploy();
      setNotice({ tone: "ok", text: published ? "Unpublished. The site is rebuilding without this sail." : "Published! The site is rebuilding; the sail goes live in about 2 minutes." });
    } catch (e) {
      setNotice({ tone: "error", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const onGpx = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    if (!confirm("Replace the track? Stats, wind and the manoeuvre analysis will be recalculated.")) return;
    setBusy("gpx");
    setNotice(null);
    try {
      const gpx = await processGpx(file);
      const updated = await replaceGpx(id, gpx);
      setSail((s) => (s ? { ...s, ...updated } : updated));
      setNotice({ tone: gpx.windError ? "warn" : "ok", text: gpx.windError ? `Track replaced, but wind failed: ${gpx.windError}` : "Track replaced." });
    } catch (e) {
      setNotice({ tone: "error", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const onRefreshWind = async () => {
    setBusy("wind");
    setNotice(null);
    try {
      const updated = await refreshWind(sail);
      setSail((s) => (s ? { ...s, wind: updated.wind, analysis: updated.analysis } : s));
      setNotice({ tone: "ok", text: "Wind and analysis updated." });
    } catch (e) {
      setNotice({ tone: "error", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const onDelete = async () => {
    if (!confirm(`Delete “${sail.title}” with its track and all media? This cannot be undone.`)) return;
    setBusy("delete");
    try {
      await deleteSail(id);
      if (published) await deploy().catch(() => {});
      navigate("#/sails");
    } catch (e) {
      setNotice({ tone: "error", text: (e as Error).message });
      setBusy(null);
    }
  };

  const stats = sail.stats;
  const pos = sail.analysis?.pointsOfSail;
  const posTotal = pos ? Object.values(pos).reduce((a, b) => a + b, 0) || 1 : 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("#/sails")} aria-label="Back to sails">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="min-w-0 flex-1 truncate text-2xl font-semibold tracking-tight">{sail.title || "Untitled sail"}</h1>
        {sail.source === "app" && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">From the app</span>}
        <SaveState state={save.state} error={save.error} />
        {published && (
          <a href={url(`/logbook/${sail.slug}`)} target="_blank" rel="noopener" className="text-xs text-primary hover:underline">
            View live
          </a>
        )}
        <Button variant={published ? "secondary" : "primary"} onClick={() => void togglePublish()} disabled={busy !== null}>
          {busy === "publish" ? <Spinner className="h-3.5 w-3.5" /> : published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {published ? "Unpublish" : "Publish"}
        </Button>
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">
        {published ? "Published · edits go live after the next deploy (button above)." : "Draft · only you can see it until you publish."}
      </p>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

      <Card title="Basics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Title" className="sm:col-span-2">
            <Input value={sail.title} onChange={(e) => set("title", e.currentTarget.value)} />
          </Field>
          <Field label="Date">
            <Input type="date" value={sail.date} onChange={(e) => set("date", e.currentTarget.value)} />
          </Field>
          <Field label="Location">
            <Input value={sail.location} onChange={(e) => set("location", e.currentTarget.value)} />
          </Field>
          <Field label="Boat">
            <Select value={sail.boat_id ?? ""} onChange={(e) => set("boat_id", e.currentTarget.value || null)}>
              <option value="">No boat</option>
              {boats.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="My role">
            <Select value={sail.role} onChange={(e) => set("role", e.currentTarget.value as SailRow["role"])}>
              {SAIL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r[0]!.toUpperCase() + r.slice(1)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Summary" className="sm:col-span-2 lg:col-span-3" hint="One line, shown on cards and in link previews.">
            <Input value={sail.summary} onChange={(e) => set("summary", e.currentTarget.value)} placeholder="A gusty morning practising tacks…" />
          </Field>
          <Field label="Crew" hint="Comma separated">
            <TagInput value={sail.crew} onChange={(v) => set("crew", v)} placeholder="Ayşe, Can" />
          </Field>
          <Field label="Sails">
            <Input value={sail.sails_used ?? ""} onChange={(e) => set("sails_used", e.currentTarget.value || null)} placeholder="Main + jib" />
          </Field>
          <Field label="Tags" hint="Comma separated">
            <TagInput value={sail.tags} onChange={(v) => set("tags", v)} placeholder="gusty, reefing" />
          </Field>
          <Field label="Rating">
            <div className="flex h-[38px] items-center gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={sail.rating === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onClick={() => set("rating", n)}
                  className={`text-2xl leading-none ${n <= sail.rating ? "text-amber-500" : "text-muted-foreground/30"} hover:scale-110`}
                >
                  ★
                </button>
              ))}
            </div>
          </Field>
          <Field label="Reef">
            <label className="flex h-[38px] items-center gap-2 text-sm">
              <input type="checkbox" checked={sail.reef} onChange={(e) => set("reef", e.currentTarget.checked)} className="h-4 w-4 accent-[var(--primary)]" />
              Sailed with a reef
            </label>
          </Field>
        </div>
      </Card>

      <Card title="Story">
        <div className="grid gap-6 lg:grid-cols-2">
          {SECTION_FIELDS.map((f) => (
            <MarkdownField key={f.key} label={f.title} value={sail[f.key]} placeholder={f.placeholder} onChange={(v) => set(f.key, v)} />
          ))}
        </div>
      </Card>

      {events.length > 0 && <EventLog events={events} endIso={stats?.end ?? events[events.length - 1]!.at} />}

      <MediaManager sailId={sail.id} coverId={sail.cover_media_id} onCoverChange={(mediaId) => set("cover_media_id", mediaId)} />

      <Card
        title="Track"
        actions={
          <>
            <Button size="sm" onClick={() => void onRefreshWind()} disabled={busy !== null || !stats}>
              {busy === "wind" ? <Spinner className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" />} Refresh wind
            </Button>
          </>
        }
      >
        {stats && sail.track ? (
          <>
            <dl className="mb-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                ["Distance", formatNm(stats.distanceNm)],
                ["Duration", formatDuration(stats.elapsedSec)],
                ["Avg / max", `${formatKn(stats.avgSpeedKn)} / ${formatKn(stats.maxSpeedKn)}`],
                ["Wind", sail.wind ? `${sail.wind.avgKn.toFixed(0)} kn ${compass(sail.wind.dirDeg)} · Bft ${beaufort(sail.wind.avgKn).force}` : "–"],
                ["Tacks / gybes", sail.analysis ? `${sail.analysis.tacks} / ${sail.analysis.gybes}` : "–"],
                ...(pos
                  ? (Object.keys(POINT_OF_SAIL_LABEL) as PointOfSail[]).map((k) => [POINT_OF_SAIL_LABEL[k], `${Math.round((pos[k] / posTotal) * 100)}%`])
                  : []),
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-secondary px-3 py-2">
                  <dt className="text-[11px] text-muted-foreground">{k}</dt>
                  <dd className="font-medium tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <TrackPreview track={sail.track} bounds={stats.bounds} maxSpeedKn={stats.maxSpeedKn} />
          </>
        ) : (
          <Notice tone="warn">No track yet. Drop a GPX file below.</Notice>
        )}
        <div className="mt-4">
          <DropZone accept=".gpx,application/gpx+xml" onFiles={(f) => void onGpx(f)} disabled={busy !== null}>
            {busy === "gpx" ? <Spinner className="text-primary" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
            <span className="text-xs">{stats ? "Replace GPX" : "Upload GPX"}</span>
          </DropZone>
        </div>
      </Card>

      <Card title="Advanced">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="URL slug" hint={published ? "Changing it breaks existing links to this sail." : "Part of the page address: /logbook/<slug>"}>
            <Input value={sail.slug} onChange={(e) => set("slug", e.currentTarget.value)} />
          </Field>
        </div>
        <div className="mt-5 border-t border-border pt-4">
          <Button variant="danger" onClick={() => void onDelete()} disabled={busy !== null}>
            {busy === "delete" ? <Spinner className="h-3.5 w-3.5" /> : <Trash2 className="h-4 w-4" />} Delete sail
          </Button>
        </div>
      </Card>
    </div>
  );
}

function EventLog({ events, endIso }: { events: EventRow[]; endIso: string }) {
  const log = summarizeLog(events, Date.parse(endIso));
  const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <Card title={`Event log · ${events.length}`}>
      <p className="-mt-2 mb-3 text-sm text-muted-foreground">
        Recorded on the boat. Under sail {formatDuration(log.sailingMs / 1000)} · under engine {formatDuration(log.engineMs / 1000)}.
      </p>
      <ol className="max-h-80 space-y-1 overflow-y-auto text-sm">
        {events.map((e) => (
          <li key={e.id} className="flex items-baseline gap-2">
            <span className="w-12 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{time(e.at)}</span>
            <span aria-hidden="true">{EVENT_META[e.kind]?.icon ?? "•"}</span>
            <span className={EVENT_META[e.kind]?.tone === "alert" ? "font-semibold text-rose-600" : ""}>{describeEvent(e)}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}