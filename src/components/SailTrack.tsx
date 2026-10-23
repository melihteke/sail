import * as React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrackPoint } from "@/lib/gpx";
import { speedColor } from "@/lib/units";

type Props = {
  track: TrackPoint[];
  bounds: [[number, number], [number, number]];
  startIso: string;
  timeZone: string;
  maxSpeedKn: number;
};

const COLOR_STEPS = 14;

function clockLabel(startIso: string, offsetSec: number, timeZone: string) {
  return new Date(Date.parse(startIso) + offsetSec * 1000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone });
}

export default function SailTrack({ track, bounds, startIso, timeZone, maxSpeedKn }: Props) {
  const mapNode = React.useRef<HTMLDivElement | null>(null);
  const marker = React.useRef<L.CircleMarker | null>(null);
  const [active, setActive] = React.useState<number | null>(null);
  const scaleMax = Math.max(4, Math.ceil(maxSpeedKn));

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
    marker.current = L.circleMarker([0, 0], { radius: 7, color: "#fff", weight: 2, fillColor: "#0f172a", opacity: 0, fillOpacity: 0 }).addTo(map);

    map.fitBounds(bounds, { padding: [24, 24] });
    return () => {
      map.remove();
      marker.current = null;
    };
  }, [track, bounds, scaleMax]);

  React.useEffect(() => {
    const m = marker.current;
    if (!m) return;
    const point = active == null ? undefined : track[active];
    if (!point) {
      m.setStyle({ opacity: 0, fillOpacity: 0 });
      return;
    }
    m.setLatLng([point[0], point[1]]);
    m.setStyle({ opacity: 1, fillOpacity: 1 });
  }, [active, track]);

  const chartData = React.useMemo(() => track.map(([, , kn, sec], index) => ({ index, sec, kn })), [track]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div ref={mapNode} className="h-[420px] w-full sm:h-[520px]" role="img" aria-label="Map of the sailed track, coloured by speed" />
        <div className="flex items-center gap-3 border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
          <span>Speed</span>
          <span
            className="h-2 flex-1 rounded-full"
            style={{ background: `linear-gradient(to right, ${Array.from({ length: 6 }, (_, i) => speedColor((i / 5) * scaleMax, scaleMax)).join(",")})` }}
          />
          <span className="tabular-nums">0–{scaleMax} kn</span>
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
                const index = state?.activeTooltipIndex;
                setActive(index == null ? null : Number(index));
              }}
              onMouseLeave={() => setActive(null)}
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
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Hover the chart to see the boat's position on the map.</p>
      </div>
    </div>
  );
}
