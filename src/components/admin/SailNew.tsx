import * as React from "react";
import { ArrowLeft, FileUp } from "lucide-react";
import { SITE } from "@/config";
import { createSailFromGpx, listBoats, processGpx, type ProcessedGpx } from "@/lib/admin-api";
import { POINT_OF_SAIL_LABEL } from "@/lib/analysis";
import { beaufort, compass, formatDuration, formatKn, formatNm } from "@/lib/units";
import type { BoatRow } from "@/lib/types";
import { Button, Card, DropZone, Field, Input, Notice, Select, Spinner, navigate } from "./ui";
import TrackPreview from "./TrackPreview";

/** Suggest a title from the GPX activity name ("Morning Sail") or the time of day. */
function suggestTitle(gpx: ProcessedGpx) {
  const generic = /^(morning|afternoon|evening|night|lunch)?\s*(sail(ing)?|activity|track)?$/i;
  if (gpx.name && !generic.test(gpx.name.trim())) return gpx.name.trim();
  const hour = Number(new Date(gpx.stats.start).toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: SITE.timeZone }));
  const part = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
  const windy = gpx.wind ? beaufort(gpx.wind.avgKn).force : 0;
  return `${windy >= 4 ? "Windy " + part.toLowerCase() : part} sail`;
}

export default function SailNew() {
  const [boats, setBoats] = React.useState<BoatRow[]>([]);
  const [gpx, setGpx] = React.useState<ProcessedGpx | null>(null);
  const [fileName, setFileName] = React.useState("");
  const [busy, setBusy] = React.useState<"parse" | "create" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [boatId, setBoatId] = React.useState<string>("");

  React.useEffect(() => {
    listBoats()
      .then((b) => {
        setBoats(b);
        const main = b.find((x) => x.is_default) ?? b[0];
        if (main) {
          setBoatId(main.id);
          setLocation((l) => l || main.home_water || SITE.homeWaters.name);
        }
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const onFiles = async (files: File[]) => {
    const file = files.find((f) => /\.gpx$/i.test(f.name)) ?? files[0];
    if (!file) return;
    setBusy("parse");
    setError(null);
    try {
      const processed = await processGpx(file);
      setGpx(processed);
      setFileName(file.name);
      setTitle(suggestTitle(processed));
      setLocation((l) => l || SITE.homeWaters.name);
    } catch (e) {
      setError(`Could not read ${file.name}: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const create = async () => {
    if (!gpx) return;
    setBusy("create");
    setError(null);
    try {
      const row = await createSailFromGpx(gpx, { title: title.trim() || "Sail", location: location.trim(), boatId: boatId || null });
      navigate(`#/sails/${row.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  };

  const stats = gpx?.stats;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("#/sails")} aria-label="Back to sails">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">New sail</h1>
      </div>

      <Card title="1. Track">
        <DropZone accept=".gpx,application/gpx+xml" onFiles={(f) => void onFiles(f)} disabled={busy !== null}>
          {busy === "parse" ? (
            <>
              <Spinner className="text-primary" />
              <span className="mt-2 font-medium">Reading track and fetching wind…</span>
            </>
          ) : (
            <>
              <FileUp className="h-7 w-7 text-muted-foreground" />
              <span className="mt-2 font-medium">{fileName ? `${fileName} · drop another GPX to replace` : "Drop a GPX file here, or click to choose"}</span>
              <span className="text-xs text-muted-foreground">From Upwind, Strava, Garmin, Navionics… any GPX with timestamps</span>
            </>
          )}
        </DropZone>
        {error && (
          <div className="mt-3">
            <Notice tone="error">{error}</Notice>
          </div>
        )}
      </Card>

      {gpx && stats && (
        <>
          <Card title="Preview">
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                ["Date", `${gpx.localDate} · ${new Date(stats.start).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: SITE.timeZone })}`],
                ["Distance", formatNm(stats.distanceNm)],
                ["Duration", formatDuration(stats.elapsedSec)],
                ["Avg / max", `${formatKn(stats.avgSpeedKn)} / ${formatKn(stats.maxSpeedKn)}`],
                ["Wind", gpx.wind ? `${gpx.wind.avgKn.toFixed(0)} kn ${compass(gpx.wind.dirDeg)} · Bft ${beaufort(gpx.wind.avgKn).force}` : "–"],
                ["Gusts", gpx.wind ? `${gpx.wind.maxGustKn.toFixed(0)} kn` : "–"],
                ["Tacks / gybes", gpx.analysis ? `${gpx.analysis.tacks} / ${gpx.analysis.gybes}` : "–"],
                [
                  "Mostly",
                  gpx.analysis
                    ? POINT_OF_SAIL_LABEL[
                        (Object.entries(gpx.analysis.pointsOfSail).sort((a, b) => b[1] - a[1])[0]![0]) as keyof typeof POINT_OF_SAIL_LABEL
                      ]
                    : "–",
                ],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-secondary px-3 py-2">
                  <dt className="text-[11px] text-muted-foreground">{k}</dt>
                  <dd className="font-medium tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            {gpx.windError && (
              <div className="mt-3">
                <Notice tone="warn">Wind could not be loaded ({gpx.windError}). You can retry from the editor.</Notice>
              </div>
            )}
            <div className="mt-4">
              <TrackPreview track={stats.track} bounds={stats.bounds} maxSpeedKn={stats.maxSpeedKn} />
            </div>
          </Card>

          <Card title="2. Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title">
                <Input value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
              </Field>
              <Field label="Location">
                <Input value={location} onChange={(e) => setLocation(e.currentTarget.value)} />
              </Field>
              <Field label="Boat" hint={boats.length ? undefined : "No boats yet: add one under Boats (you can set it later)."}>
                <Select value={boatId} onChange={(e) => setBoatId(e.currentTarget.value)}>
                  <option value="">No boat</option>
                  {boats.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                      {b.is_default ? " (main)" : ""}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button variant="primary" onClick={() => void create()} disabled={busy !== null}>
                {busy === "create" && <Spinner className="h-3.5 w-3.5" />} Create draft &amp; continue
              </Button>
              <span className="text-xs text-muted-foreground">Next: write how it went, add photos, then publish.</span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
