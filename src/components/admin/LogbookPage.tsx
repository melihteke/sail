import * as React from "react";
import { Download, Printer } from "lucide-react";
import { listBoats, listEngineEvents, listLogbook, listPrivate } from "@/lib/admin-api";
import type { SailEvent } from "@/lib/events";
import { PASSAGE_LABEL, SEA_STATE_LABEL, VISIBILITY_LABEL, engineMinutesFromEvents, logbookCsv, toNumber, type LogbookRow } from "@/lib/logbook";
import { PASSAGE_TYPES, type BoatRow } from "@/lib/types";
import { formatDuration } from "@/lib/units";
import { Button, Card, Field, Input, Notice, Select, Spinner } from "./ui";

type Row = LogbookRow & { id: string; boatId: string | null; type: string | null };

// The site header/footer and admin chrome stay off the printed logbook.
const PRINT_CSS = `@media print {
  body > header, body > footer, body > a { display: none !important; }
  main { padding: 0 !important; max-width: none !important; }
  @page { size: A4 landscape; margin: 12mm; }
}`;

const cap = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : s);

export default function LogbookPage() {
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [boats, setBoats] = React.useState<BoatRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState({ from: "", to: "", boat: "", type: "", status: "published" });
  const [withPrivate, setWithPrivate] = React.useState(false);

  React.useEffect(() => {
    Promise.all([listLogbook(), listBoats(), listEngineEvents().catch(() => []), listPrivate().catch(() => [])])
      .then(([sails, b, events, priv]) => {
        const boatName = new Map(b.map((x) => [x.id, x.name]));
        const eventsBySail = new Map<string, SailEvent[]>();
        for (const e of events) eventsBySail.set(e.sail_id, [...(eventsBySail.get(e.sail_id) ?? []), e]);
        const privBySail = new Map(priv.map((p) => [p.sail_id, p]));
        setBoats(b);
        setRows(
          sails.map((s) => {
            const p = privBySail.get(s.id);
            return {
              id: s.id,
              boatId: s.boat_id,
              type: s.passage_type,
              date: s.date,
              title: s.title,
              boat: (s.boat_id && boatName.get(s.boat_id)) || "",
              role: cap(s.role),
              skipper: s.skipper ?? (s.role === "skipper" ? "Me" : ""),
              passageType: s.passage_type ? PASSAGE_LABEL[s.passage_type] : "",
              departure: s.departure ?? "",
              arrival: s.arrival ?? "",
              distanceNm: s.stats ? Math.round(s.stats.distanceNm * 10) / 10 : null,
              hours: s.stats ? Math.round(s.stats.elapsedSec / 360) / 10 : null,
              nightHours: toNumber(s.night_hours),
              engineMinutes: s.engine_minutes ?? (s.stats ? engineMinutesFromEvents(eventsBySail.get(s.id) ?? [], s.stats.end) : null),
              tidal: s.tidal ?? false,
              observedBft: s.observed_bft ?? null,
              seaState: s.sea_state ? SEA_STATE_LABEL[s.sea_state] : "",
              visibility: s.visibility ? VISIBILITY_LABEL[s.visibility] : "",
              status: s.status,
              privateNotes: [p?.notes, p?.maintenance].filter((x) => x?.trim()).join("\n\n"),
            };
          }),
        );
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <Notice tone="error">{error.includes("column") ? `${error}. Run migration 0006 in Supabase.` : error}</Notice>;
  if (!rows) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        <Spinner />
      </div>
    );
  }

  const shown = rows
    .filter((r) => (!filter.from || r.date >= filter.from) && (!filter.to || r.date <= filter.to))
    .filter((r) => !filter.boat || r.boatId === filter.boat)
    .filter((r) => !filter.type || r.type === filter.type)
    .filter((r) => !filter.status || r.status === filter.status)
    .sort((a, b) => a.date.localeCompare(b.date));

  const sum = (pick: (r: Row) => number | null) => shown.reduce((a, r) => a + (pick(r) ?? 0), 0);
  const totals = {
    nm: sum((r) => r.distanceNm),
    hours: sum((r) => r.hours),
    night: sum((r) => r.nightHours),
    days: new Set(shown.map((r) => r.date)).size,
    tidal: shown.filter((r) => r.tidal).length,
    skipper: shown.filter((r) => r.role === "Skipper").length,
  };

  const download = () => {
    const blob = new Blob(["\uFEFF", logbookCsv(shown, withPrivate)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `logbook-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-5">
      <style>{PRINT_CSS}</style>
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <h1 className="flex-1 text-2xl font-semibold tracking-tight">Logbook</h1>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={withPrivate} onChange={(e) => setWithPrivate(e.currentTarget.checked)} className="h-4 w-4 accent-[var(--primary)]" />
          Include private notes
        </label>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print / PDF
        </Button>
        <Button variant="primary" onClick={download} disabled={!shown.length}>
          <Download className="h-4 w-4" /> CSV
        </Button>
      </div>

      <Card className="print:hidden">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="From">
            <Input type="date" value={filter.from} onChange={(e) => setFilter({ ...filter, from: e.currentTarget.value })} />
          </Field>
          <Field label="To">
            <Input type="date" value={filter.to} onChange={(e) => setFilter({ ...filter, to: e.currentTarget.value })} />
          </Field>
          <Field label="Boat">
            <Select value={filter.boat} onChange={(e) => setFilter({ ...filter, boat: e.currentTarget.value })}>
              <option value="">All boats</option>
              {boats.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Type">
            <Select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.currentTarget.value })}>
              <option value="">All types</option>
              {PASSAGE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PASSAGE_LABEL[t]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.currentTarget.value })}>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              <option value="">All</option>
            </Select>
          </Field>
        </div>
      </Card>

      <div className="hidden print:block">
        <h1 className="text-xl font-semibold">Sailing logbook · Melih Teke</h1>
        <p className="text-xs">
          {shown[0]?.date ?? ""} – {shown[shown.length - 1]?.date ?? ""} · printed {new Date().toISOString().slice(0, 10)}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Sails", String(shown.length)],
          ["Days", String(totals.days)],
          ["Distance", `${totals.nm.toFixed(1)} nm`],
          ["Hours", `${totals.hours.toFixed(1)} h`],
          ["Night hours", `${totals.night.toFixed(1)} h`],
          ["Tidal / as skipper", `${totals.tidal} / ${totals.skipper}`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border bg-card px-3 py-2">
            <dt className="text-[11px] text-muted-foreground">{k}</dt>
            <dd className="font-medium tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="overflow-x-auto rounded-xl border border-border bg-card print:overflow-visible print:border-0">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary text-muted-foreground">
            <tr>
              {["Date", "Title", "Boat", "Role", "Skipper", "Type", "Route", "nm", "Hours", "Night", "Engine", "Tidal", "Conditions"].map((h) => (
                <th key={h} className="px-2 py-2 font-medium">
                  {h}
                </th>
              ))}
              {withPrivate && <th className="px-2 py-2 font-medium">Private notes</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shown.map((r) => (
              <tr key={r.id} className="break-inside-avoid align-top">
                <td className="whitespace-nowrap px-2 py-1.5 tabular-nums">{r.date}</td>
                <td className="px-2 py-1.5">
                  <a href={`#/sails/${r.id}`} className="hover:underline print:no-underline">
                    {r.title}
                  </a>
                  {r.status === "draft" && <span className="ml-1 text-[10px] text-muted-foreground">(draft)</span>}
                </td>
                <td className="px-2 py-1.5">{r.boat}</td>
                <td className="px-2 py-1.5">{r.role}</td>
                <td className="px-2 py-1.5">{r.skipper}</td>
                <td className="px-2 py-1.5">{r.passageType}</td>
                <td className="px-2 py-1.5">{[r.departure, r.arrival].filter(Boolean).join(" → ")}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{r.distanceNm?.toFixed(1) ?? ""}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{r.hours?.toFixed(1) ?? ""}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{r.nightHours ? r.nightHours.toFixed(1) : ""}</td>
                <td className="whitespace-nowrap px-2 py-1.5 text-right tabular-nums">{r.engineMinutes ? formatDuration(r.engineMinutes * 60) : ""}</td>
                <td className="px-2 py-1.5">{r.tidal ? "Yes" : ""}</td>
                <td className="px-2 py-1.5">{[r.observedBft !== null ? `Bft ${r.observedBft}` : "", r.seaState, r.visibility].filter(Boolean).join(" · ")}</td>
                {withPrivate && <td className="whitespace-pre-line px-2 py-1.5">{r.privateNotes}</td>}
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={withPrivate ? 14 : 13} className="px-2 py-6 text-center text-muted-foreground">
                  No sails match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
