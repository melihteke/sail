import { XMLParser } from "fast-xml-parser";
import { MS_TO_KN, M_PER_NM } from "./units";

export interface GpxPoint {
  lat: number;
  lon: number;
  /** Epoch milliseconds */
  t: number;
}

/** Compact client-side point: [lat, lon, speedKn, secondsFromStart] */
export type TrackPoint = [number, number, number, number];

export interface TrackStats {
  name: string;
  start: string;
  end: string;
  startPoint: { lat: number; lon: number };
  endPoint: { lat: number; lon: number };
  bounds: [[number, number], [number, number]];
  distanceNm: number;
  elapsedSec: number;
  movingSec: number;
  avgSpeedKn: number;
  maxSpeedKn: number;
  track: TrackPoint[];
}

const SPEED_WINDOW_SEC = 10;
const DISTANCE_STEP_SEC = 5;
const MOVING_THRESHOLD_KN = 0.8;
const TRACK_STEP_SEC = 8;

export function haversineM(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371008.8;
  const toRad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toRad;
  const dLon = (b.lon - a.lon) * toRad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function parseGpx(xml: string): { name: string; points: GpxPoint[] } {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "", isArray: (tag) => ["trk", "trkseg", "trkpt"].includes(tag) });
  const doc = parser.parse(xml);
  const tracks = doc?.gpx?.trk ?? [];
  const points: GpxPoint[] = [];
  let name = "";
  for (const trk of tracks) {
    name ||= String(trk.name ?? "");
    for (const seg of trk.trkseg ?? []) {
      for (const pt of seg.trkpt ?? []) {
        const lat = Number(pt.lat);
        const lon = Number(pt.lon);
        const t = Date.parse(pt.time);
        if (Number.isFinite(lat) && Number.isFinite(lon) && Number.isFinite(t)) points.push({ lat, lon, t });
      }
    }
  }
  points.sort((a, b) => a.t - b.t);
  return { name, points };
}

/**
 * Speed at each point from the distance covered over a ±window, which filters the
 * metre-level GPS jitter that makes raw point-to-point speeds spike.
 */
function windowSpeeds(points: GpxPoint[]) {
  const half = (SPEED_WINDOW_SEC / 2) * 1000;
  const speeds = new Array<number>(points.length).fill(0);
  let lo = 0;
  let hi = 0;
  for (let i = 0; i < points.length; i++) {
    const t = points[i]!.t;
    while (points[lo]!.t < t - half) lo++;
    while (hi + 1 < points.length && points[hi + 1]!.t <= t + half) hi++;
    const dt = (points[hi]!.t - points[lo]!.t) / 1000;
    if (dt <= 0) continue;
    let d = 0;
    for (let j = lo + 1; j <= hi; j++) d += haversineM(points[j - 1]!, points[j]!);
    speeds[i] = (d / dt) * MS_TO_KN;
  }
  return speeds;
}

export function computeStats(xml: string): TrackStats {
  const { name, points } = parseGpx(xml);
  if (points.length < 2) throw new Error("GPX track needs at least two timed points");

  const speeds = windowSpeeds(points);
  const first = points[0]!;
  const last = points.at(-1)!;

  let distanceM = 0;
  let movingSec = 0;
  let prev = first;
  for (let i = 1; i < points.length; i++) {
    const p = points[i]!;
    const dt = (p.t - points[i - 1]!.t) / 1000;
    if (speeds[i]! >= MOVING_THRESHOLD_KN && dt < 60) movingSec += dt;
    if ((p.t - prev.t) / 1000 >= DISTANCE_STEP_SEC || i === points.length - 1) {
      const segSpeed = speeds[i]!;
      if (segSpeed >= MOVING_THRESHOLD_KN / 2) distanceM += haversineM(prev, p);
      prev = p;
    }
  }

  let minLat = Infinity, minLon = Infinity, maxLat = -Infinity, maxLon = -Infinity;
  for (const p of points) {
    minLat = Math.min(minLat, p.lat); maxLat = Math.max(maxLat, p.lat);
    minLon = Math.min(minLon, p.lon); maxLon = Math.max(maxLon, p.lon);
  }

  const track: TrackPoint[] = [];
  let lastT = -Infinity;
  for (let i = 0; i < points.length; i++) {
    const p = points[i]!;
    if (p.t - lastT >= TRACK_STEP_SEC * 1000 || i === points.length - 1) {
      track.push([+p.lat.toFixed(6), +p.lon.toFixed(6), +speeds[i]!.toFixed(2), Math.round((p.t - first.t) / 1000)]);
      lastT = p.t;
    }
  }

  const distanceNm = distanceM / M_PER_NM;
  const elapsedSec = (last.t - first.t) / 1000;
  return {
    name,
    start: new Date(first.t).toISOString(),
    end: new Date(last.t).toISOString(),
    startPoint: { lat: first.lat, lon: first.lon },
    endPoint: { lat: last.lat, lon: last.lon },
    bounds: [[minLat, minLon], [maxLat, maxLon]],
    distanceNm,
    elapsedSec,
    movingSec,
    avgSpeedKn: movingSec > 0 ? distanceNm / (movingSec / 3600) : 0,
    maxSpeedKn: Math.max(...speeds),
    track,
  };
}
