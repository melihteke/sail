import * as React from "react";
import { MapPin } from "lucide-react";
import { fetchSettings, type Place, type SiteSettings } from "@/lib/settings";
import { saveSetting } from "@/lib/settings-store";
import { url } from "@/lib/url";
import LocationSearch from "../LocationSearch";
import { Card, Notice, Spinner } from "./ui";

const FIELDS: { key: keyof SiteSettings; title: string; help: string }[] = [
  {
    key: "live_wind",
    title: "Live wind location",
    help: "Shown on the home page: live wind, 3-day sailing forecast and rain radar. Visitors see a change right away; no deploy needed.",
  },
  {
    key: "sea",
    title: "Sea conditions location",
    help: "Waves, sea temperature and tide on the home page. Pick a spot on open water (lakes have no wave or tide data).",
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<SiteSettings | null>(null);
  const [notice, setNotice] = React.useState<{ tone: "ok" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    void fetchSettings().then(setSettings);
  }, []);

  const save = async (key: keyof SiteSettings, place: Place) => {
    setNotice(null);
    try {
      await saveSetting(key, place);
      setSettings((s) => (s ? { ...s, [key]: place } : s));
      setNotice({ tone: "ok", text: `Saved: ${place.name}. The home page uses it straight away.` });
    } catch (e) {
      setNotice({ tone: "error", text: (e as Error).message });
    }
  };

  if (!settings) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      {FIELDS.map((f) => {
        const p = settings[f.key];
        return (
          <Card key={f.key} title={f.title}>
            <p className="-mt-2 mb-4 text-sm text-muted-foreground">{f.help}</p>
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-secondary px-3 py-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sea" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {p.lat.toFixed(4)}, {p.lon.toFixed(4)} ·{" "}
                  <a className="text-primary hover:underline" href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=13/${p.lat}/${p.lon}`} target="_blank" rel="noopener">
                    show on map
                  </a>
                </p>
              </div>
            </div>
            <LocationSearch onPick={(place) => void save(f.key, place)} placeholder="Type an address, harbour or lake…" />
          </Card>
        );
      })}
      <p className="text-xs text-muted-foreground">
        Tip: on the <a className="text-primary hover:underline" href={url("/")}>home page</a> you can also change the live wind location with the pencil in its box while signed in.
      </p>
    </div>
  );
}
