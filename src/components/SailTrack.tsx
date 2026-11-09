import * as React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { TrackPoint } from "@/lib/gpx";
import { bearing, pointOfSail, POINT_OF_SAIL_LABEL, signedTwa, type Maneuver } from "@/lib/analysis";
import { compass, speedColor } from "@/lib/units";
import { windAt, type WindHour } from "@/lib/wind";

type Props = {
  track: TrackPoint[];
  bounds: [[number, number], [number, number]];
  startIso: string;
  timeZone: string;
  maxSpeedKn: number;
  windHours?: WindHour[];
  twa?: (number | null)[];
  maneuvers?: Maneuver[];
  /** Logged events from the Sail Tracker app, already labelled */
  events?: MapEvent[];
  /** Engine periods as [fromSec, toSec] since the track start */
  engine?: [number, number][];
  /** Photos with the place they were taken */
  photos?: { lat: number; lon: number; thumb: string; caption?: string }[];
};

export interface MapEvent {
  lat: number;
  lon: number;
  sec: number;
  icon: string;
  label: string;
  alert?: boolean;
}

const COLOR_STEPS = 14;
const SPEEDS = [1, 5, 10, 30, 60];
const TRAIL_SEC = 120;
const UI_FPS_MS = 100;

function clockLabel(startIso: string, offsetSec: number, timeZone: string, seconds = false) {
  return new Date(Date.parse(startIso) + offsetSec * 1000).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    ...(seconds ? { second: "2-digit" } : {}),
    timeZone,
  });
}

function durationLabel(sec: number) {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Index of the last point at or before `sec` (binary search). */
function indexAt(track: TrackPoint[], sec: number) {
  let lo = 0;
  let hi = track.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (track[mid]![3] <= sec) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

function stateAt(track: TrackPoint[], sec: number) {
  const i = indexAt(track, sec);
  const a = track[i]!;
  const b = track[Math.min(track.length - 1, i + 1)]!;
  const span = b[3] - a[3];
  const f = span > 0 ? Math.min(1, Math.max(0, (sec - a[3]) / span)) : 0;
  const lat = a[0] + (b[0] - a[0]) * f;
  const lon = a[1] + (b[1] - a[1]) * f;
  const kn = a[2] + (b[2] - a[2]) * f;
  const p = track[Math.max(0, i - 1)]!;
  const n = track[Math.min(track.length - 1, i + 2)]!;
  const cog = p === n ? 0 : bearing({ lat: p[0], lon: p[1] }, { lat: n[0], lon: n[1] });
  return { i, lat, lon, kn, cog };
}

const boatIcon = L.divIcon({
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  html: `<div data-boat style="width:30px;height:30px;transform-origin:50% 50%;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))">
    <svg viewBox="0 0 24 24" width="30" height="30"><path d="M12 2 L18 20 L12 16.5 L6 20 Z" fill="#0f172a" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>
  </div>`,
});

export default function SailTrack({ track, bounds, startIso, timeZone, maxSpeedKn, windHours = [], twa = [], maneuvers = [], events = [], engine = [], photos = [] }: Props) {
  const mapNode = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const boat = React.useRef<L.Marker | null>(null);
  const trail = React.useRef<L.Polyline | null>(null);
  const maneuverLayer = React.useRef<L.LayerGroup | null>(null);
  const logLayer = React.useRef<L.LayerGroup | null>(null);
  const [showLog, setShowLog] = React.useState(true);
  const tRef = React.useRef<number | null>(null);
  const [t, setT] = React.useState<number | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(30);
  const [showManeuvers, setShowManeuvers] = React.useState(true);
  const scaleMax = Math.max(4, Math.ceil(maxSpeedKn));
  const endSec = track.at(-1)?.[3] ?? 0;
  const wind = React.useMemo(() => ({ hours: windHours }), [windHours]);

  React.useEffect(() => {
    if (!mapNode.current) return;
    const map = L.map(mapNode.current, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openseamap.org">OpenSeaMap</a>',
    }).addTo(map);

    // Group consecutive points with the same speed bucket into one polyline to keep layers few.
    let run: L.LatLngExpression[] = [];
    let bucket = -1;
    const flush = () => {
      if (run.length > 1) L.polyline(run, { color: speedColor(((bucket + 0.5) / COLOR_STEPS) * scaleMax, scaleMax), weight: 4, opacity: 0.95, lineCap: "round" }).addTo(map);
    };
    for (const [lat, lon, kn] of track) {
      const b = Math.min(COLOR_STEPS - 1, Math.floor((kn / scaleMax) * COLOR_STEPS));
      if (b !== bucket && run.length) {
        flush();
        run = [run.at(-1)!];
      }
      bucket = b;
      run.push([lat, lon]);
    }
    flush();

    const first = track[0];
    const last = track.at(-1);
    if (first) L.circleMarker([first[0], first[1]], { radius: 6, color: "#fff", weight: 2, fillColor: "#16a34a", fillOpacity: 1 }).bindTooltip("Start").addTo(map);
    if (last) L.circleMarker([last[0], last[1]], { radius: 6, color: "#fff", weight: 2, fillColor: "#dc2626", fillOpacity: 1 }).bindTooltip("Finish").addTo(map);

    const group = L.layerGroup();
    for (const m of maneuvers) {
      L.circleMarker([m.lat, m.lon], {
        radius: 4,
        color: "#fff",
        weight: 1.5,
        fillColor: m.kind === "tack" ? "#f59e0b" : "#a855f7",
        fillOpacity: 1,
      })
        .bindTooltip(`${m.kind === "tack" ? "Tack" : "Gybe"} · ${clockLabel(startIso, m.sec, timeZone)}`)
        .addTo(group);
    }
    maneuverLayer.current = group;

    // App log: engine sections as a dashed grey line over the track, events and photos as pins.
    const log = L.layerGroup();
    for (const [from, to] of engine) {
      const a = indexAt(track, from);
      const b = indexAt(track, to);
      const pts = track.slice(a, b + 1).map((p) => [p[0], p[1]] as L.LatLngExpression);
      if (pts.length > 1) L.polyline(pts, { color: "#334155", weight: 3, dashArray: "4 6", opacity: 0.9 }).bindTooltip("Under engine").addTo(log);
    }
    for (const e of events) {
      const icon = L.divIcon({
        className: "",
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        html: `<div style="width:22px;height:22px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:12px;background:${e.alert ? "#e11d48" : "#fff"};box-shadow:0 1px 3px rgba(0,0,0,.35);border:1.5px solid ${e.alert ? "#fff" : "#0b3a5c"}">${e.icon}</div>`,
      });
      L.marker([e.lat, e.lon], { icon, keyboard: false })
        .bindTooltip(`${clockLabel(startIso, e.sec, timeZone)} · ${e.label.replace(/</g, "&lt;")}`)
        .addTo(log);
    }
    for (const ph of photos) {
      const icon = L.divIcon({
        className: "",
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        html: `<div style="width:34px;height:34px;border-radius:8px;overflow:hidden;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"><img src="${encodeURI(ph.thumb)}" alt="" style="width:100%;height:100%;object-fit:cover"/></div>`,
      });
      const m = L.marker([ph.lat, ph.lon], { icon, keyboard: false });
      if (ph.caption) m.bindTooltip(ph.caption.replace(/</g, "&lt;"));
      m.addTo(log);
    }
    logLayer.current = log;

    trail.current = L.polyline([], { color: "#0f172a", weight: 6, opacity: 0.75, lineCap: "round", lineJoin: "round" }).addTo(map);
    boat.current = L.marker([first?.[0] ?? 0, first?.[1] ?? 0], { icon: boatIcon, interactive: false, keyboard: false, opacity: 0, zIndexOffset: 1000 }).addTo(map);

    map.fitBounds(bounds, { padding: [24, 24] });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      boat.current = null;
      trail.current = null;
      maneuverLayer.current = null;
      logLayer.current = null;
    };
  }, [track, bounds, scaleMax, maneuvers, startIso, timeZone, events, engine, photos]);

  React.useEffect(() => {
    const group = logLayer.current;
    const map = mapRef.current;
    if (!group || !map) return;
    if (showLog) group.addTo(map);
    else group.remove();
  }, [showLog, events, engine, photos, track]);

  React.useEffect(() => {
    const group = maneuverLayer.current;
    const map = mapRef.current;
    if (!group || !map) return;
    if (showManeuvers) group.addTo(map);
    else group.remove();
  }, [showManeuvers, maneuvers, track]);

  /** Moves the boat + trail on the map; cheap enough to run every animation frame. */
  const draw = React.useCallback(
    (sec: number | null) => {
      const marker = boat.current;
      if (!marker) return;
      if (sec == null || !track.length) {
        marker.setOpacity(0);
        trail.current?.setLatLngs([]);
        return;
      }
      const s = stateAt(track, sec);
      marker.setLatLng([s.lat, s.lon]);
      marker.setOpacity(1);
      const el = marker.getElement()?.querySelector<HTMLElement>("[data-boat]");
      if (el) el.style.transform = `rotate(${s.cog}deg)`;
      const from = indexAt(track, Math.max(0, sec - TRAIL_SEC));
      const pts: L.LatLngExpression[] = track.slice(from, s.i + 1).map((p) => [p[0], p[1]]);
      pts.push([s.lat, s.lon]);
      trail.current?.setLatLngs(pts);
    },
    [track],
  );

  const seek = React.useCallback(
    (sec: number | null) => {
      tRef.current = sec == null ? null : Math.min(endSec, Math.max(0, sec));
      draw(tRef.current);
      setT(tRef.current);
    },
    [draw, endSec],
  );

  React.useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let lastUi = 0;
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const next = Math.min(endSec, (tRef.current ?? 0) + dt * speed);
      tRef.current = next;
      draw(next);
      if (now - lastUi > UI_FPS_MS || next >= endSec) {
        lastUi = now;
        setT(next);
      }
      if (next >= endSec) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, endSec, draw]);

  const togglePlay = () => {
    if (!playing && (tRef.current == null || tRef.current >= endSec)) seek(0);
    setPlaying((p) => !p);
  };

  const hud = React.useMemo(() => {
    if (t == null || !track.length) return null;
    const s = stateAt(track, t);
    const w = windHours.length ? windAt(wind, Date.parse(startIso) + t * 1000) : null;
    const angle = twa[s.i] ?? (w && s.kn >= 1.2 ? signedTwa(s.cog, w.dirDeg) : null);
    return { ...s, wind: w, twa: angle };
  }, [t, track, wind, windHours.length, startIso, twa]);

  const chartData = React.useMemo(() => track.map(([, , kn, sec], index) => ({ index, sec, kn })), [track]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative">
          <div ref={mapNode} className="h-[420px] w-full sm:h-[520px]" role="img" aria-label="Map of the sailed track, coloured by speed" />
          {hud && (
            <div className="pointer-events-none absolute right-3 top-3 z-[400] w-48 rounded-xl bg-background/90 p-3 text-xs shadow-md backdrop-blur" aria-live="off">
              <p className="font-semibold tabular-nums">{clockLabel(startIso, t!, timeZone, true)}</p>
              <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 tabular-nums">
                <dt className="text-muted-foreground">Speed</dt>
                <dd className="text-right font-medium">{hud.kn.toFixed(1)} kn</dd>
                <dt className="text-muted-foreground">Course</dt>
                <dd className="text-right font-medium">{Math.round(hud.cog)}° {compass(hud.cog)}</dd>
                {hud.wind && (
                  <>
                    <dt className="text-muted-foreground">Wind</dt>
                    <dd className="text-right font-medium">
                      {hud.wind.speedKn.toFixed(0)} kn {compass(hud.wind.dirDeg)}
                    </dd>
                  </>
                )}
                {hud.twa != null && (
                  <>
                    <dt className="text-muted-foreground">Sailing</dt>
                    <dd className="text-right font-medium">{POINT_OF_SAIL_LABEL[pointOfSail(hud.twa)]}</dd>
                    <dt className="text-muted-foreground">Tack</dt>
                    <dd className="text-right font-medium">{hud.twa > 0 ? "Port" : "Starboard"} · {Math.abs(hud.twa)}°</dd>
                  </>
                )}
              </dl>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border px-3 py-2.5">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause replay" : "Play replay"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              seek(null);
            }}
            aria-label="Reset replay"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <input
            type="range"
            min={0}
            max={endSec}
            step={1}
            value={t ?? 0}
            onChange={(e) => seek(Number(e.currentTarget.value))}
            aria-label="Replay position"
            className="min-w-[8rem] flex-1 accent-[var(--sea)]"
          />
          <span className="w-28 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
            {durationLabel(t ?? 0)} / {durationLabel(endSec)}
          </span>
          <div role="radiogroup" aria-label="Replay speed" className="inline-flex shrink-0 gap-0.5 rounded-lg bg-muted/70 p-0.5">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={speed === s}
                onClick={() => setSpeed(s)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium tabular-nums ${speed === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
          <span>Speed</span>
          <span
            className="h-2 min-w-[6rem] flex-1 rounded-full"
            style={{ background: `linear-gradient(to right, ${Array.from({ length: 6 }, (_, i) => speedColor((i / 5) * scaleMax, scaleMax)).join(",")})` }}
          />
          <span className="tabular-nums">0–{scaleMax} kn</span>
          {maneuvers.length > 0 && (
            <label className="flex cursor-pointer items-center gap-1.5">
              <input type="checkbox" checked={showManeuvers} onChange={(e) => setShowManeuvers(e.currentTarget.checked)} className="accent-[var(--sea)]" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" /> Tacks
              <span className="ml-1 inline-block h-2.5 w-2.5 rounded-full bg-purple-500" /> Gybes
            </label>
          )}
          {(events.length > 0 || engine.length > 0 || photos.length > 0) && (
            <label className="flex cursor-pointer items-center gap-1.5">
              <input type="checkbox" checked={showLog} onChange={(e) => setShowLog(e.currentTarget.checked)} className="accent-[var(--sea)]" />
              Log
              {engine.length > 0 && (
                <>
                  <span className="ml-1 inline-block w-4 border-t-2 border-dashed border-slate-600" /> engine
                </>
              )}
            </label>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="mb-2 text-sm font-semibold">Speed over ground</p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
              onMouseMove={(state) => {
                if (playing) return;
                const index = state?.activeTooltipIndex;
                const point = index == null ? undefined : track[Number(index)];
                if (point) seek(point[3]);
              }}
              onClick={(state) => {
                const index = state?.activeTooltipIndex;
                const point = index == null ? undefined : track[Number(index)];
                if (point) seek(point[3]);
              }}
            >
              <defs>
                <linearGradient id="sogFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--sea)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--sea)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="sec"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(sec: number) => clockLabel(startIso, sec, timeZone)}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                stroke="var(--border)"
                minTickGap={40}
              />
              <YAxis unit=" kn" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} stroke="var(--border)" width={56} />
              <Tooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--popover-foreground)" }}
                labelFormatter={(sec) => clockLabel(startIso, Number(sec), timeZone)}
                formatter={(value) => [`${Number(value).toFixed(1)} kn`, "SOG"]}
              />
              <Area type="monotone" dataKey="kn" stroke="var(--sea)" strokeWidth={1.5} fill="url(#sogFill)" isAnimationActive={false} />
              {t != null && <ReferenceLine x={t} stroke="var(--foreground)" strokeWidth={1.5} ifOverflow="extendDomain" />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Press play to replay the sail, or hover the chart to put the boat at that moment.</p>
      </div>
    </div>
  );
}
