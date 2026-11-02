import * as React from "react";
import { Plus } from "lucide-react";
import { listBoats, publicUrl, MEDIA_BUCKET } from "@/lib/admin-api";
import type { BoatRow } from "@/lib/types";
import { Button, Notice, Spinner, navigate } from "./ui";

export default function BoatList() {
  const [boats, setBoats] = React.useState<BoatRow[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    listBoats()
      .then(setBoats)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Boats</h1>
        <Button variant="primary" onClick={() => navigate("#/boats/new")}>
          <Plus className="h-4 w-4" /> New boat
        </Button>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {!boats && !error && (
        <div className="flex justify-center py-12 text-muted-foreground">
          <Spinner />
        </div>
      )}
      {boats && boats.length === 0 && <Notice>No boats yet. Add the boat you sail so you can pick it when logging a sail.</Notice>}
      {boats && boats.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boats.map((b) => (
            <li key={b.id}>
              <a href={`#/boats/${b.id}`} className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md">
                <div className="aspect-[4/3] bg-sky-100 dark:bg-sky-950">
                  {b.photo_path && <img src={publicUrl(MEDIA_BUCKET, b.photo_path)} alt="" className="h-full w-full object-cover" loading="lazy" />}
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground">
                    {b.model ?? "Boat"}
                    {b.is_default ? " · Main boat" : ""}
                  </p>
                  <p className="font-semibold group-hover:text-primary">{b.name}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
