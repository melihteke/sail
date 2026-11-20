import * as React from "react";
import { CheckCircle2, Circle, History, Lock, Pencil, Plus, Trash2, X } from "lucide-react";
import { createEvent, deleteEvent, getPrivate, listRevisions, restoreRevision, savePrivate, updateEvent } from "@/lib/admin-api";
import { EVENT_META, describeEvent, summarizeLog, type EventRow } from "@/lib/events";
import { PASSAGE_LABEL, SEA_STATE_LABEL, VISIBILITY_LABEL, engineMinutesFromEvents, nightHours, toNumber, type CheckItem } from "@/lib/logbook";
import { PASSAGE_TYPES, SEA_STATES, VISIBILITIES, type SailPrivateRow, type SailRevision, type SailRow } from "@/lib/types";
import { formatDuration } from "@/lib/units";
import { Button, Card, Field, Input, Notice, SaveState, Select, Spinner, TextArea, formatDateTime, useAutosave } from "./ui";

type Setter = <K extends keyof SailRow>(key: K, value: SailRow[K]) => void;

export type EditorMode = "quick" | "detailed";
const MODE_KEY = "admin.editorMode";

export function useEditorMode() {
  const [mode, setMode] = React.useState<EditorMode>(() => (typeof localStorage !== "undefined" && localStorage.getItem(MODE_KEY) === "detailed" ? "detailed" : "quick"));
  const change = (m: EditorMode) => {
    setMode(m);
    localStorage.setItem(MODE_KEY, m);
  };
  return [mode, change] as const;
}

export function ModeSwitch({ mode, onChange }: { mode: EditorMode; onChange: (m: EditorMode) => void }) {
  return (
    <div className="inline-flex rounded-lg bg-muted/70 p-0.5 text-xs font-medium" role="tablist" aria-label="Editor mode">
      {(["quick", "detailed"] as const).map((m) => (
        <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => onChange(m)} className={`rounded-md px-2.5 py-1 ${mode === m ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
          {m === "quick" ? "Quick" : "Detailed"}
        </button>
      ))}
    </div>
  );
}

// --- Completeness ------------------------------------------------------------------------------

export function CompletenessPanel({ items, mode }: { items: CheckItem[]; mode: EditorMode }) {
  const shown = items.filter((i) => mode === "detailed" || !i.detailed);
  const done = shown.filter((i) => i.done).length;
  const pct = Math.round((done / (shown.length || 1)) * 100);
  return (
    <Card title="Log entry" className="lg:sticky lg:top-4">
      <div className="mb-3 flex items-center gap-2 text-sm">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Log entry complete">
          <div className={`h-full ${pct === 100 ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="tabular-nums text-muted-foreground">
          {done}/{shown.length}
        </span>
      </div>
      <ul className="space-y-1.5 text-sm">
        {shown.map((i) => (
          <li key={i.key} className="flex items-start gap-2">
            {i.done ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />}
            <span className={i.done ? "text-muted-foreground" : ""}>{i.label}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-muted-foreground">A guide only. You can publish at any time.</p>
    </Card>
  );
}

// --- Structured log fields ---------------------------------------------------------------------

export function LogbookCard({ sail, set, events, mode }: { sail: SailRow; set: Setter; events: EventRow[]; mode: EditorMode }) {
  const stats = sail.stats;
  const suggestedNight = React.useMemo(
    () => (stats ? nightHours(stats.start, stats.end, stats.startPoint.lat, stats.startPoint.lon) : null),
    [stats],
  );
  const autoEngine = stats ? engineMinutesFromEvents(events, stats.end) : null;
  const night = toNumber(sail.night_hours);
  const detailed = mode === "detailed";

  return (
    <Card title="Logbook">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Passage type">
          <Select value={sail.passage_type ?? ""} onChange={(e) => set("passage_type", (e.currentTarget.value || null) as SailRow["passage_type"])}>
            <option value="">–</option>
            {PASSAGE_TYPES.map((t) => (
              <option key={t} value={t}>
                {PASSAGE_LABEL[t]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Departure">
          <Input value={sail.departure ?? ""} onChange={(e) => set("departure", e.currentTarget.value || null)} placeholder="Marina / harbour" />
        </Field>
        <Field label="Arrival">
          <Input value={sail.arrival ?? ""} onChange={(e) => set("arrival", e.currentTarget.value || null)} placeholder="Same as departure for a round trip" />
        </Field>
        <Field label="Observed wind (Beaufort)" hint="What you saw on the water, not the model.">
          <Select value={sail.observed_bft ?? ""} onChange={(e) => set("observed_bft", e.currentTarget.value === "" ? null : Number(e.currentTarget.value))}>
            <option value="">–</option>
            {Array.from({ length: 13 }, (_, n) => (
              <option key={n} value={n}>
                Bft {n}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Sea state">
          <Select value={sail.sea_state ?? ""} onChange={(e) => set("sea_state", (e.currentTarget.value || null) as SailRow["sea_state"])}>
            <option value="">–</option>
            {SEA_STATES.map((s) => (
              <option key={s} value={s}>
                {SEA_STATE_LABEL[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tidal waters">
          <label className="flex h-[38px] items-center gap-2 text-sm">
            <input type="checkbox" checked={sail.tidal} onChange={(e) => set("tidal", e.currentTarget.checked)} className="h-4 w-4 accent-[var(--primary)]" />
            Sailed in tidal waters
          </label>
        </Field>
        {detailed && (
          <>
            <Field label="Skipper" hint={sail.role === "skipper" ? "You are the skipper (My role)." : undefined}>
              <Input value={sail.skipper ?? ""} onChange={(e) => set("skipper", e.currentTarget.value || null)} placeholder={sail.role === "skipper" ? "Me" : "Name"} />
            </Field>
            <Field label="Visibility">
              <Select value={sail.visibility ?? ""} onChange={(e) => set("visibility", (e.currentTarget.value || null) as SailRow["visibility"])}>
                <option value="">–</option>
                {VISIBILITIES.map((v) => (
                  <option key={v} value={v}>
                    {VISIBILITY_LABEL[v]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Night hours"
              hint={
                suggestedNight !== null && suggestedNight !== night ? (
                  <button type="button" className="text-primary hover:underline" onClick={() => set("night_hours", suggestedNight)}>
                    Use {suggestedNight} h (sunset → sunrise from the track)
                  </button>
                ) : (
                  "Sunset to sunrise."
                )
              }
            >
              <Input type="number" min={0} step={0.1} value={night ?? ""} onChange={(e) => set("night_hours", e.currentTarget.value === "" ? null : Number(e.currentTarget.value))} />
            </Field>
            <Field label="Engine (minutes)" hint={autoEngine !== null ? `Empty = ${autoEngine} min from the event log.` : "Leave empty if not used."}>
              <Input
                type="number"
                min={0}
                step={1}
                value={sail.engine_minutes ?? ""}
                placeholder={autoEngine !== null ? String(autoEngine) : ""}
                onChange={(e) => set("engine_minutes", e.currentTarget.value === "" ? null : Math.round(Number(e.currentTarget.value)))}
              />
            </Field>
          </>
        )}
      </div>
    </Card>
  );
}

// --- Private notes -----------------------------------------------------------------------------

export function PrivateNotesCard({ sailId }: { sailId: string }) {
  const [row, setRow] = React.useState<SailPrivateRow | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    getPrivate(sailId).then(setRow, (e: Error) => setError(e.message));
  }, [sailId]);
  const save = useAutosave<SailPrivateRow>(async (patch) => {
    await savePrivate(sailId, patch);
  });
  const set = (key: "notes" | "maintenance", value: string) => {
    setRow((r) => (r ? { ...r, [key]: value } : r));
    save.queue({ [key]: value });
  };
  return (
    <Card
      title={
        <span className="inline-flex items-center gap-1.5">
          <Lock className="h-4 w-4" /> Private notes
        </span>
      }
      actions={<SaveState state={save.state} error={save.error} />}
      className="border-amber-500/30"
    >
      <p className="-mt-2 mb-3 text-xs text-muted-foreground">Only you can read these. They are never published or part of the site build.</p>
      {error ? (
        <Notice tone="error">{error.includes("sail_private") ? "Run migration 0006 in Supabase to enable private notes." : error}</Notice>
      ) : !row ? (
        <Spinner />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Notes">
            <TextArea value={row.notes} onChange={(e) => set("notes", e.currentTarget.value)} rows={5} placeholder="Crew feedback, near misses, things you'd rather not publish…" />
          </Field>
          <Field label="Boat & gear issues">
            <TextArea value={row.maintenance} onChange={(e) => set("maintenance", e.currentTarget.value)} rows={5} placeholder="- Jib sheet chafing at the fairlead" />
          </Field>
        </div>
      )}
    </Card>
  );
}

// --- Editable event log ------------------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, "0");
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (v: string) => new Date(v).toISOString();
const TEXT_KINDS = new Set(["note", "weather", "photo"]);

interface Draft {
  id: string | null;
  at: string;
  kind: string;
  text: string;
}

export function EventLogCard({ sailId, events, setEvents, endIso, defaultIso }: { sailId: string; events: EventRow[]; setEvents: (e: EventRow[]) => void; endIso: string | null; defaultIso: string }) {
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const sorted = [...events].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const log = sorted.length ? summarizeLog(sorted, Date.parse(endIso ?? sorted[sorted.length - 1]!.at)) : null;
  const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const submit = async () => {
    if (!draft) return;
    setBusy(true);
    setError(null);
    try {
      const old = draft.id ? events.find((e) => e.id === draft.id) : null;
      const data = { ...(old?.data ?? {}), text: draft.text.trim() || undefined };
      const payload = { at: fromLocalInput(draft.at), kind: draft.kind, data };
      if (draft.id) {
        const updated = await updateEvent(draft.id, payload);
        setEvents(events.map((e) => (e.id === updated.id ? updated : e)));
      } else {
        setEvents([...events, await createEvent(sailId, payload)]);
      }
      setDraft(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (e: EventRow) => {
    if (!confirm(`Delete “${describeEvent(e)}”?`)) return;
    setBusy(true);
    try {
      await deleteEvent(sailId, e.id);
      setEvents(events.filter((x) => x.id !== e.id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const form = draft && (
    <div className="grid gap-2 rounded-lg border border-border bg-secondary/40 p-3 sm:grid-cols-[auto_auto_1fr_auto]">
      <Input type="datetime-local" aria-label="Time" value={draft.at} onChange={(e) => setDraft({ ...draft, at: e.currentTarget.value })} />
      <Select aria-label="Event" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.currentTarget.value })}>
        {Object.entries(EVENT_META).map(([k, m]) => (
          <option key={k} value={k}>
            {m.icon} {m.label}
          </option>
        ))}
      </Select>
      <Input aria-label="Text" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.currentTarget.value })} placeholder={TEXT_KINDS.has(draft.kind) ? "Text" : "Text (optional)"} />
      <div className="flex gap-1">
        <Button variant="primary" size="sm" onClick={() => void submit()} disabled={busy || !draft.at}>
          {busy ? <Spinner className="h-3.5 w-3.5" /> : "Save"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDraft(null)} aria-label="Cancel">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <Card
      title={`Event log · ${events.length}`}
      actions={
        <Button size="sm" onClick={() => setDraft({ id: null, at: toLocalInput(sorted[sorted.length - 1]?.at ?? defaultIso), kind: "note", text: "" })} disabled={busy || Boolean(draft)}>
          <Plus className="h-3.5 w-3.5" /> Add event
        </Button>
      }
    >
      {log && (
        <p className="-mt-2 mb-3 text-sm text-muted-foreground">
          Under sail {formatDuration(log.sailingMs / 1000)} · under engine {formatDuration(log.engineMs / 1000)}.
        </p>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      {draft && !draft.id && <div className="mb-3">{form}</div>}
      {sorted.length === 0 && !draft && <p className="text-sm text-muted-foreground">No events yet. Add engine, sails, reefs, notes or weather to build a proper log.</p>}
      <ol className="max-h-96 space-y-1 overflow-y-auto text-sm">
        {sorted.map((e) =>
          draft?.id === e.id ? (
            <li key={e.id}>{form}</li>
          ) : (
            <li key={e.id} className="group flex items-baseline gap-2">
              <span className="w-12 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{time(e.at)}</span>
              <span aria-hidden="true">{EVENT_META[e.kind]?.icon ?? "•"}</span>
              <span className={`flex-1 ${EVENT_META[e.kind]?.tone === "alert" ? "font-semibold text-rose-600" : ""}`}>{describeEvent(e)}</span>
              <span className="flex gap-0.5 opacity-60 group-hover:opacity-100">
                <Button variant="ghost" size="sm" aria-label="Edit event" disabled={busy || Boolean(draft)} onClick={() => setDraft({ id: e.id, at: toLocalInput(e.at), kind: e.kind, text: e.data.text ?? "" })}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" aria-label="Delete event" disabled={busy || Boolean(draft)} onClick={() => void remove(e)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </span>
            </li>
          ),
        )}
      </ol>
    </Card>
  );
}

// --- Revision history --------------------------------------------------------------------------

const FIELD_LABEL: Partial<Record<keyof SailRow, string>> = {
  title: "title",
  date: "date",
  location: "location",
  summary: "summary",
  boat_id: "boat",
  role: "role",
  crew: "crew",
  rating: "rating",
  sails_used: "sails",
  reef: "reef",
  tags: "tags",
  how_it_went: "how it went",
  what_i_practised: "what I practised",
  learnings: "learnings",
  notes: "notes",
  passage_type: "passage type",
  departure: "departure",
  arrival: "arrival",
  skipper: "skipper",
  night_hours: "night hours",
  tidal: "tidal",
  observed_bft: "observed wind",
  sea_state: "sea state",
  visibility: "visibility",
  engine_minutes: "engine",
};

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null) || (a != null && b != null && String(a) === String(b));

export function HistoryCard({ sail, onRestored, flush }: { sail: SailRow; onRestored: (s: SailRow) => void; flush: () => Promise<void> }) {
  const [open, setOpen] = React.useState(false);
  const [revs, setRevs] = React.useState<SailRevision[] | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setError(null);
    listRevisions(sail.id).then(setRevs, (e: Error) => setError(e.message));
  }, [sail.id]);

  React.useEffect(() => {
    if (open) load();
  }, [open, load]);

  const restore = async (rev: SailRevision) => {
    if (!confirm(`Restore the version from ${formatDateTime(rev.changed_at)}? The current version is kept in the history.`)) return;
    setBusy(rev.id);
    try {
      await flush();
      onRestored(await restoreRevision(rev.id, sail.id));
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card
      title={
        <span className="inline-flex items-center gap-1.5">
          <History className="h-4 w-4" /> History
        </span>
      }
      actions={
        <Button size="sm" onClick={() => setOpen(!open)}>
          {open ? "Hide" : "Show versions"}
        </Button>
      }
    >
      {!open ? (
        <p className="-mt-2 text-sm text-muted-foreground">Earlier versions of the texts and log fields, one per editing session (last 50).</p>
      ) : error ? (
        <Notice tone="error">{error.includes("sail_revisions") ? "Run migration 0006 in Supabase to enable the history." : error}</Notice>
      ) : !revs ? (
        <Spinner />
      ) : revs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No earlier versions yet.</p>
      ) : (
        <ul className="divide-y divide-border text-sm">
          {revs.map((rev) => {
            const changed = (Object.keys(FIELD_LABEL) as (keyof SailRow)[]).filter((k) => k in rev.snapshot && !same(rev.snapshot[k], sail[k]));
            return (
              <li key={rev.id} className="flex flex-wrap items-center gap-2 py-2">
                <span className="w-40 shrink-0 tabular-nums">{formatDateTime(rev.changed_at)}</span>
                <span className="min-w-0 flex-1 text-xs text-muted-foreground">
                  {changed.length ? `Differs in: ${changed.map((k) => FIELD_LABEL[k]).join(", ")}` : "Same as now"}
                </span>
                <Button size="sm" onClick={() => void restore(rev)} disabled={busy !== null || changed.length === 0}>
                  {busy === rev.id ? <Spinner className="h-3.5 w-3.5" /> : "Restore"}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
