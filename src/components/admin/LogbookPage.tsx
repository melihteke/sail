import * as React from "react";
import { Download, Plus, Printer } from "lucide-react";
import { listBoats, listEngineEvents, listLogbook, listPrivate } from "@/lib/admin-api";
import type { SailEvent } from "@/lib/events";
import { PASSAGE_LABEL, SEA_STATE_LABEL, VISIBILITY_LABEL, engineMinutesFromEvents, logbookCsv, toNumber, type LogbookRow } from "@/lib/logbook";
import { PASSAGE_TYPES, type BoatRow } from "@/lib/types";
import { formatDuration } from "@/lib/units";
import { Button, Field, Input, Notice, Select, Spinner, navigate } from "./ui";

type Row = LogbookRow & { id: string; boatId: string | null; type: string | null; location: string; hasTrack: boolean };

// The site header/footer and admin chrome stay off the printed logbook.
const PRINT_CSS = `@media print {
  body > header, body > footer, body > a { display: none !important; }
  main { padding: 0 !important; max-width: none !important; }
  @page { size: A4 landscape; margin: 12mm; }
}`;

const cap = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : s);

// On screen: a short list to open sails; printed: the full logbook.
const COLUMNS = [
  { label: "Date", cls: "" },
  { label: "Sail", cls: "" },
  { label: "Boat", cls: "hidden md:table-cell print:table-cell" },
  { label: "Role", cls: "hidden print:table-cell" },
  { label: "Skipper", cls: "hidden print:table-cell" },
  { label: "Type", cls: "hidden print:table-cell" },
  { label: "Route", cls: "hidden print:table-cell" },
  { label: "nm", cls: "hidden text-right sm:table-cell print:table-cell" },
  { label: "Hours", cls: "hidden text-right sm:table-cell print:table-cell" },
  { label: "Night", cls: "hidden text-right print:table-cell" },
  { label: "Engine", cls: "hidden text-right print:table-cell" },
  { label: "Tidal", cls: "hidden print:table-cell" },
  { label: "Conditions", cls: "hidden print:table-cell" },
  { label: "Status", cls: "print:hidden" },
];

export default function LogbookPage() {
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [boats, setBoats] = React.useState<BoatRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState({ q: "", from: "", to: "", boat: "", type: "", status: "" });
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
            const manualMin = s.manual_duration_min ?? null;
            return {
              id: s.id,
              boatId: s.boat_id,
              type: s.passage_type,
              location: s.location,
              hasTrack: Boolean(s.stats),
              date: s.date,
              title: s.title.trim() || "Untitled sail",
              boat: (s.boat_id && boatName.get(s.boat_id)) || "",
              role: cap(s.role),
              skipper: s.skipper ?? (s.role === "skipper" ? "Me" : ""),
              passageType: s.passage_type ? PASSAGE_LABEL[s.passage_type] : "",
              departure: s.departure ?? "",
              arrival: s.arrival ?? "",
              distanceNm: s.stats ? Math.round(s.stats.distanceNm * 10) / 10 : toNumber(s.manual_distance_nm),
              hours: s.stats ? Math.round(s.stats.elapsedSec / 360) / 10 : manualMin !== null ? Math.round(manualMin / 6) / 10 : null,
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

  const q = filter.q.trim().toLowerCase();
  const shown = rows
    .filter((r) => !q || `${r.title} ${r.location} ${r.date} ${r.boat} ${r.departure} ${r.arrival}`.toLowerCase().includes(q))
    .filter((r) => (!filter.from || r.date >= filter.from) && (!filter.to || r.date <= filter.to))
    .filter((r) => !filter.boat || r.boatId === filter.boat)
    .filter((r) => !filter.type || r.type === filter.type)
    .filter((r) => !filter.status || r.status === filter.status)
    .sort((a, b) => b.date.localeCompare(a.date));

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
    const blob = new Blob(["\uFEFF", logbookCsv([...shown].reverse(), withPrivate)], { type: "text/csv;charset=utf-8" });
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
        <Input type="search" placeholder="Search…" value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.currentTarget.value })} className="w-44" aria-label="Search sails" />
        <Button variant="primary" onClick={() => navigate("#/sails/new")}>
          <Plus className="h-4 w-4" /> New sail
        </Button>
      </div>

      <details className="group rounded-2xl border border-border bg-card p-4 shadow-sm print:hidden">
        <summary className="cursor-pointer select-none text-sm font-medium">Filters &amp; export</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
              <option value="">All</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </Select>
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <label className="mr-auto flex items-center gap-2 text-sm">
            <input type="checkbox" checked={withPrivate} onChange={(e) => setWithPrivate(e.currentTarget.checked)} className="h-4 w-4 accent-[var(--primary)]" />
            Include private notes
          </label>
          <Button onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print / PDF
          </Button>
          <Button onClick={download} disabled={!shown.length}>
            <Download className="h-4 w-4" /> CSV
          </Button>
        </div>
      </details>

      <div className="hidden print:block">
        <h1 className="text-xl font-semibold">Sailing logbook · Melih Teke</h1>
        <p className="text-xs">
          {shown[shown.length - 1]?.date ?? ""} – {shown[0]?.date ?? ""} · printed {new Date().toISOString().slice(0, 10)}
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

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm print:overflow-visible print:rounded-none print:border-0 print:shadow-none">
        <table className="w-full text-left text-sm print:text-[10px]">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.label} className={`px-3 py-2.5 font-medium print:px-1.5 print:py-1 ${c.cls}`}>
                  {c.label}
                </th>
              ))}
              {withPrivate && <th className="hidden px-1.5 py-1 font-medium print:table-cell">Private notes</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shown.map((r) => (
              <tr key={r.id} className="cursor-pointer break-inside-avoid align-top hover:bg-secondary/60" onClick={() => navigate(`#/sails/${r.id}`)}>
                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums print:px-1.5 print:py-1">{r.date}</td>
                <td className="px-3 py-2.5 print:px-1.5 print:py-1">
                  <a href={`#/sails/${r.id}`} className="font-medium hover:text-primary print:font-normal" onClick={(e) => e.stopPropagation()}>
                    {r.title}
                  </a>
                  <p className="text-xs text-muted-foreground print:hidden">
                    {[r.departure && r.arrival ? `${r.departure} → ${r.arrival}` : r.location, r.passageType].filter(Boolean).join(" · ") || "–"}
                  </p>
                </td>
                <td className="hidden px-3 py-2.5 md:table-cell print:table-cell print:px-1.5 print:py-1">{r.boat || "–"}</td>
                <td className="hidden px-1.5 py-1 print:table-cell">{r.role}</td>
                <td className="hidden px-1.5 py-1 print:table-cell">{r.skipper}</td>
                <td className="hidden px-1.5 py-1 print:table-cell">{r.passageType}</td>
                <td className="hidden px-1.5 py-1 print:table-cell">{[r.departure, r.arrival].filter(Boolean).join(" → ")}</td>
                <td className="hidden whitespace-nowrap px-3 py-2.5 text-right tabular-nums sm:table-cell print:table-cell print:px-1.5 print:py-1">
                  {r.distanceNm !== null ? r.distanceNm.toFixed(1) : "–"}
                </td>
                <td className="hidden whitespace-nowrap px-3 py-2.5 text-right tabular-nums sm:table-cell print:table-cell print:px-1.5 print:py-1">
                  {r.hours !== null ? r.hours.toFixed(1) : "–"}
                  {!r.hasTrack && r.hours !== null && <span className="ml-1 text-[10px] text-muted-foreground print:hidden" title="Entered by hand">✎</span>}
                </td>
                <td className="hidden px-1.5 py-1 text-right tabular-nums print:table-cell">{r.nightHours ? r.nightHours.toFixed(1) : ""}</td>
                <td className="hidden whitespace-nowrap px-1.5 py-1 text-right tabular-nums print:table-cell">{r.engineMinutes ? formatDuration(r.engineMinutes * 60) : ""}</td>
                <td className="hidden px-1.5 py-1 print:table-cell">{r.tidal ? "Yes" : ""}</td>
                <td className="hidden px-1.5 py-1 print:table-cell">{[r.observedBft !== null ? `Bft ${r.observedBft}` : "", r.seaState, r.visibility].filter(Boolean).join(" · ")}</td>
                <td className="px-3 py-2.5 print:hidden">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.status === "published" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-800 dark:text-amber-200"}`}
                  >
                    {r.status === "published" ? "Published" : "Draft"}
                  </span>
                </td>
                {withPrivate && <td className="hidden whitespace-pre-line px-1.5 py-1 print:table-cell">{r.privateNotes}</td>}
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-3 py-8 text-center text-muted-foreground">
                  {rows.length === 0 ? "No sails yet. Click “New sail”: only a date is filled in, everything else is optional." : "No sails match these filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
