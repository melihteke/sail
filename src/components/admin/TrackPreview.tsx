import * as React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { TrackPoint } from "@/lib/gpx";
import { speedColor } from "@/lib/units";

/** Lightweight speed-coloured track map for the admin preview. */
export default function TrackPreview({ track, bounds, maxSpeedKn }: { track: TrackPoint[]; bounds: [[number, number], [number, number]]; maxSpeedKn: number }) {
  const node = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!node.current || track.length < 2) return;
    const map = L.map(node.current, { scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    const max = Math.max(4, Math.ceil(maxSpeedKn));
    for (let i = 1; i < track.length; i++) {
      const a = track[i - 1]!;
      const b = track[i]!;
      L.polyline(
        [
          [a[0], a[1]],
          [b[0], b[1]],
        ],
        { color: speedColor(b[2], max), weight: 3.5, opacity: 0.95 },
      ).addTo(map);
    }
    const first = track[0]!;
    const last = track.at(-1)!;
    L.circleMarker([first[0], first[1]], { radius: 5, color: "#fff", weight: 2, fillColor: "#16a34a", fillOpacity: 1 }).addTo(map);
    L.circleMarker([last[0], last[1]], { radius: 5, color: "#fff", weight: 2, fillColor: "#dc2626", fillOpacity: 1 }).addTo(map);
    map.fitBounds(bounds, { padding: [16, 16] });
    return () => {
      map.remove();
    };
  }, [track, bounds, maxSpeedKn]);
  return <div ref={node} className="h-72 w-full overflow-hidden rounded-xl border border-border" role="img" aria-label="Track preview" />;
}
