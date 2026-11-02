import * as React from "react";
import { Plus } from "lucide-react";
import { listBoats, listSails } from "@/lib/admin-api";
import { formatDuration, formatNm } from "@/lib/units";
import type { BoatRow } from "@/lib/types";
import { Button, Input, Notice, Spinner, formatDateTime, navigate } from "./ui";

type Row = Awaited<ReturnType<typeof listSails>>[number];

export default function SailList() {
  const [sails, setSails] = React.useState<Row[] | null>(null);
  const [boats, setBoats] = React.useState<BoatRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    Promise.all([listSails(), listBoats()])
      .then(([s, b]) => {
        setSails(s);
        setBoats(b);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const boatName = (id: string | null) => boats.find((b) => b.id === id)?.name ?? "–";
  const visible = (sails ?? []).filter((s) => `${s.title} ${s.location} ${s.date}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Sails</h1>
        <div className="flex items-center gap-2">
          <Input type="search" placeholder="Search…" value={query} onChange={(e) => setQuery(e.currentTarget.value)} className="w-44" aria-label="Search sails" />
          <Button variant="primary" onClick={() => navigate("#/sails/new")}>
            <Plus className="h-4 w-4" /> New sail
          </Button>
        </div>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {!sails && !error && (
        <div className="flex justify-center py-12 text-muted-foreground">
          <Spinner />
        </div>
      )}
      {sails && sails.length === 0 && <Notice>No sails yet. Click “New sail” and drop a GPX file to start.</Notice>}
      {visible.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Sail</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">Boat</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Distance</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s) => (
                <tr key={s.id} className="cursor-pointer border-b border-border last:border-0 hover:bg-secondary/60" onClick={() => navigate(`#/sails/${s.id}`)}>
                  <td className="px-4 py-3">
                    <a href={`#/sails/${s.id}`} className="font-medium hover:text-primary" onClick={(e) => e.stopPropagation()}>
                      {s.title}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {s.date} · {s.location || "–"}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">{boatName(s.boat_id)}</td>
                  <td className="hidden px-4 py-3 tabular-nums sm:table-cell">
                    {s.stats ? `${formatNm(s.stats.distanceNm)} · ${formatDuration(s.stats.elapsedSec)}` : "–"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.status === "published" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-800 dark:text-amber-200"}`}
                    >
                      {s.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">{formatDateTime(s.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
