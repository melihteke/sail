import * as React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Pause, Play } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { useSiteSettings } from "@/lib/settings-store";

type Frame = { time: number; path: string };

/** Animated rain radar (RainViewer, free) over an OpenStreetMap base, centred on the live wind location. */
export default function RainRadar({ settings: initial, timeZone }: { settings: SiteSettings; timeZone: string }) {
  const { lat, lon, name } = useSiteSettings(initial).live_wind;
  const node = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const layers = React.useRef<L.TileLayer[]>([]);
  const marker = React.useRef<L.CircleMarker | null>(null);
  const [frames, setFrames] = React.useState<Frame[]>([]);
  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!node.current) return;
    const map = L.map(node.current, { scrollWheelZoom: false, zoomControl: true, maxZoom: 10 }).setView([lat, lon], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · Radar <a href="https://www.rainviewer.com/">RainViewer</a>',
    }).addTo(map);
    marker.current = L.circleMarker([lat, lon], { radius: 6, color: "#fff", weight: 2, fillColor: "#0b3a5c", fillOpacity: 1 }).addTo(map);
    mapRef.current = map;
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((r) => r.json())
      .then((json: { host: string; radar: { past: Frame[]; nowcast?: Frame[] } }) => {
        const list = [...json.radar.past, ...(json.radar.nowcast ?? [])];
        layers.current = list.map((f) =>
          // RainViewer serves radar tiles up to zoom 7; Leaflet scales them for closer zooms.
          L.tileLayer(`${json.host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`, { opacity: 0, maxNativeZoom: 7, maxZoom: 10, zIndex: 10 }).addTo(map),
        );
        setFrames(list);
        setIndex(list.length - 1);
      })
      .catch(() => setError(true));
    return () => {
      map.remove();
      mapRef.current = null;
      layers.current = [];
    };
    // The map is created once; location changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    mapRef.current?.setView([lat, lon], mapRef.current.getZoom());
    marker.current?.setLatLng([lat, lon]).bindTooltip(name);
  }, [lat, lon, name]);

  React.useEffect(() => {
    layers.current.forEach((l, i) => l.setOpacity(i === index ? 0.75 : 0));
  }, [index, frames]);

  React.useEffect(() => {
    if (!playing || frames.length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % frames.length), 700);
    return () => window.clearInterval(timer);
  }, [playing, frames.length]);

  const frame = frames[index];
  return (
    <section aria-labelledby="radar" className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-2 px-5 pt-5">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Rain radar · last 2 hours</p>
          <h2 id="radar" className="mt-1.5 text-xl font-semibold tracking-tight">Showers around {name.split(",")[0]}</h2>
        </div>
        {frames.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause radar" : "Play radar"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="ml-0.5 h-3.5 w-3.5" />}
            </button>
            <span className="w-12 tabular-nums">
              {frame && new Date(frame.time * 1000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone })}
            </span>
          </div>
        )}
      </div>
      <div className="relative mt-4">
        <div ref={node} className="h-[340px] w-full sm:h-[420px]" role="img" aria-label={`Rain radar map around ${name}`} />
        {error && <p className="absolute inset-x-0 top-4 z-[500] mx-auto w-fit rounded-full bg-background/90 px-3 py-1 text-xs shadow">Radar is unavailable right now.</p>}
      </div>
      {frames.length > 0 && (
        <input
          type="range"
          min={0}
          max={frames.length - 1}
          value={index}
          onChange={(e) => {
            setPlaying(false);
            setIndex(Number(e.currentTarget.value));
          }}
          aria-label="Radar time"
          className="block w-full accent-[var(--sea)]"
        />
      )}
    </section>
  );
}
