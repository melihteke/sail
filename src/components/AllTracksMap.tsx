import * as React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type TrackSummary = {
  slug: string;
  title: string;
  date: string;
  href: string;
  /** Simplified [lat, lon] points */
  points: [number, number][];
};

type Props = { tracks: TrackSummary[] };

const PALETTE = ["#0ea5e9", "#f97316", "#22c55e", "#a855f7", "#ef4444", "#eab308", "#14b8a6", "#ec4899"];

export default function AllTracksMap({ tracks }: Props) {
  const node = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!node.current || !tracks.length) return;
    const map = L.map(node.current, { scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    const all: L.LatLngExpression[] = [];
    tracks.forEach((t, i) => {
      const color = PALETTE[i % PALETTE.length]!;
      const line = L.polyline(t.points, { color, weight: 3, opacity: 0.8, lineJoin: "round" }).addTo(map);
      line.bindTooltip(`${t.title} · ${t.date}`, { sticky: true });
      line.on("mouseover", () => line.setStyle({ weight: 6, opacity: 1 }).bringToFront());
      line.on("mouseout", () => line.setStyle({ weight: 3, opacity: 0.8 }));
      line.on("click", () => {
        window.location.href = t.href;
      });
      all.push(...t.points);
    });
    map.fitBounds(L.latLngBounds(all), { padding: [24, 24] });
    return () => {
      map.remove();
    };
  }, [tracks]);

  return <div ref={node} className="h-[380px] w-full sm:h-[460px]" role="img" aria-label={`Map with all ${tracks.length} sailed tracks`} />;
}
