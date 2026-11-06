import * as React from "react";
import { Link2, MapPin, RotateCcw } from "lucide-react";
import { DEFAULT_SETTINGS, fetchSettingsDetailed, FOLLOWS_LIVE_WIND, type Place, type SettingKey, type SiteSettings } from "@/lib/settings";
import { clearSetting, saveSetting } from "@/lib/settings-store";
import { url } from "@/lib/url";
import LocationSearch from "../LocationSearch";
import { Card, Notice, Spinner } from "./ui";

interface Field {
  key: SettingKey;
  title: string;
  help: string;
  /** Zoom levels offered for map cards */
  zooms?: { value: number; label: string }[];
}

const FIELDS: Field[] = [
  {
    key: "live_wind",
    title: "Live wind",
    help: "The live wind box on the home page. The forecast, daylight and rain radar cards follow this place unless you give them their own.",
  },
  {
    key: "forecast",
    title: "3-day sailing forecast",
    help: "Daily wind, gusts, rain and temperature for the next three days.",
  },
  {
    key: "daylight",
    title: "Daylight",
    help: "Sunrise, sunset, twilight and moon, computed for this place.",
  },
  {
    key: "sea",
    title: "Sea now",
    help: "Waves, sea temperature and tide. Pick a spot on open water (lakes have no wave or tide data).",
  },
  {
    key: "wind_map",
    title: "Live wind map (Windy)",
    help: "Centre and zoom of the Windy.com wind map. The card title reads “Wind over <name>”, so a region or country name works well.",
    zooms: [
      { value: 5, label: "Continent" },
      { value: 6, label: "Large region" },
      { value: 7, label: "Country, wide" },
      { value: 8, label: "Country" },
      { value: 9, label: "Region" },
      { value: 10, label: "Local" },
    ],
  },
  {
    key: "radar",
    title: "Rain radar",
    help: "Centre and zoom of the animated rain radar.",
    zooms: [
      { value: 5, label: "Continent" },
      { value: 6, label: "Large region" },
      { value: 7, label: "Country" },
      { value: 8, label: "Region" },
      { value: 9, label: "Local" },
      { value: 10, label: "Close" },
    ],
  },
];

export default function SettingsPage() {
  const [data, setData] = React.useState<{ settings: SiteSettings; custom: Set<SettingKey> } | null>(null);
  const [notice, setNotice] = React.useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = React.useState<SettingKey | null>(null);

  const reload = React.useCallback(() => fetchSettingsDetailed().then(setData), []);
  React.useEffect(() => {
    void reload();
  }, [reload]);

  const run = async (key: SettingKey, action: () => Promise<void>, ok: string) => {
    setNotice(null);
    setBusy(key);
    try {
      await action();
      await reload();
      setNotice({ tone: "ok", text: ok });
    } catch (e) {
      setNotice({ tone: "error", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const save = (f: Field, place: Place) => {
    const current = data?.settings[f.key];
    // Keep the chosen zoom when only the place changes.
    const value: Place = { name: place.name, lat: place.lat, lon: place.lon, ...(f.zooms ? { zoom: current?.zoom ?? DEFAULT_SETTINGS[f.key].zoom } : {}) };
    return run(f.key, () => saveSetting(f.key, value), `${f.title}: ${place.name}. The home page uses it straight away.`);
  };

  if (!data) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose the place behind each card on the home page. Changes show to visitors right away; no deploy needed.</p>
      </div>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <div className="grid gap-5 lg:grid-cols-2">
        {FIELDS.map((f) => {
          const p = data.settings[f.key];
          const follows = FOLLOWS_LIVE_WIND.includes(f.key) && !data.custom.has(f.key);
          const resettable = data.custom.has(f.key) && (FOLLOWS_LIVE_WIND.includes(f.key) || f.key === "wind_map");
          return (
            <Card key={f.key} title={f.title}>
              <p className="-mt-2 mb-4 text-sm text-muted-foreground">{f.help}</p>
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-secondary px-3 py-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sea" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {p.name}
                    {follows && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
                        <Link2 className="h-3 w-3" aria-hidden="true" /> Same as live wind
                      </span>
                    )}
                  </p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {p.lat.toFixed(4)}, {p.lon.toFixed(4)}
                    {p.zoom !== undefined && ` · zoom ${p.zoom}`} ·{" "}
                    <a className="text-primary hover:underline" href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=${p.zoom ?? 13}/${p.lat}/${p.lon}`} target="_blank" rel="noopener">
                      show on map
                    </a>
                  </p>
                </div>
                {busy === f.key && <Spinner />}
              </div>
              <LocationSearch onPick={(place) => void save(f, place)} placeholder="Type an address, harbour, lake or region…" />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {f.zooms && (
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Zoom</span>
                    <select
                      className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                      value={p.zoom ?? DEFAULT_SETTINGS[f.key].zoom}
                      disabled={busy !== null}
                      onChange={(e) => {
                        const zoom = Number(e.target.value);
                        void run(f.key, () => saveSetting(f.key, { name: p.name, lat: p.lat, lon: p.lon, zoom }), `${f.title}: zoom ${zoom}.`);
                      }}
                    >
                      {f.zooms.map((z) => (
                        <option key={z.value} value={z.value}>
                          {z.value} · {z.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {resettable && (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void run(f.key, () => clearSetting(f.key), f.key === "wind_map" ? `${f.title}: back to the default.` : `${f.title}: follows the live wind place again.`)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm hover:bg-secondary disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    {f.key === "wind_map" ? "Reset to default" : "Use live wind place"}
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Tip: on the <a className="text-primary hover:underline" href={url("/")}>home page</a> you can also change the live wind location with the pencil in its box while signed in.
      </p>
    </div>
  );
}
