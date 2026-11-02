import type { TrackPoint } from "./gpx";
import { haversineM } from "./gpx";
import type { WindSummary } from "./wind";
import { windAt } from "./wind";

export type PointOfSail = "upwind" | "reach" | "broadReach" | "downwind";

export interface Maneuver {
  kind: "tack" | "gybe";
  /** Seconds from the start of the track */
  sec: number;
  lat: number;
  lon: number;
}

export interface SailAnalysis {
  tacks: number;
  gybes: number;
  maneuvers: Maneuver[];
  /** Seconds sailed on each point of sail (moving time only) */
  pointsOfSail: Record<PointOfSail, number>;
  /** Signed true wind angle per track point (+ = wind over port side), null when not moving */
  twa: (number | null)[];
  /** Mean speed on each point of sail (kn) */
  speedByPointOfSail: Record<PointOfSail, number>;
}

export const POINT_OF_SAIL_LABEL: Record<PointOfSail, string> = {
  upwind: "Close-hauled",
  reach: "Beam reach",
  broadReach: "Broad reach",
  downwind: "Running",
};

const MOVING_KN = 1.2;
/** A tack/gybe only counts when the new side is held this long (filters wobbles and GPS noise). */
const HOLD_SEC = 20;
/** Window used to decide whether a side change went through the wind (tack) or downwind (gybe). */
const CONTEXT_SEC = 40;

export function bearing(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const r = Math.PI / 180;
  const y = Math.sin((b.lon - a.lon) * r) * Math.cos(b.lat * r);
  const x = Math.cos(a.lat * r) * Math.sin(b.lat * r) - Math.sin(a.lat * r) * Math.cos(b.lat * r) * Math.cos((b.lon - a.lon) * r);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Signed angle from the wind direction (where it comes from) to the heading, in (-180, 180]. */
export function signedTwa(courseDeg: number, windFromDeg: number) {
  const d = (((courseDeg - windFromDeg) % 360) + 540) % 360 - 180;
  return d === -180 ? 180 : d;
}

export function pointOfSail(twa: number): PointOfSail {
  const a = Math.abs(twa);
  if (a < 60) return "upwind";
  if (a < 110) return "reach";
  if (a < 150) return "broadReach";
  return "downwind";
}

/** Course over ground per point from the positions a few points either side (smooths GPS jitter). */
function courses(track: TrackPoint[]) {
  return track.map((_, i) => {
    const a = track[Math.max(0, i - 1)]!;
    const b = track[Math.min(track.length - 1, i + 1)]!;
    if (haversineM({ lat: a[0], lon: a[1] }, { lat: b[0], lon: b[1] }) < 3) return null;
    return bearing({ lat: a[0], lon: a[1] }, { lat: b[0], lon: b[1] });
  });
}

export function analyzeSail(track: TrackPoint[], wind: Pick<WindSummary, "hours"> | null, startIso: string): SailAnalysis | null {
  if (!wind?.hours.length || track.length < 3) return null;
  const start = Date.parse(startIso);
  const cog = courses(track);
  const twa = track.map((p, i) => {
    const c = cog[i];
    if (c == null || p[2] < MOVING_KN) return null;
    const w = windAt(wind, start + p[3] * 1000);
    return w ? signedTwa(c, w.dirDeg) : null;
  });

  const pointsOfSail: Record<PointOfSail, number> = { upwind: 0, reach: 0, broadReach: 0, downwind: 0 };
  const speedSum: Record<PointOfSail, number> = { upwind: 0, reach: 0, broadReach: 0, downwind: 0 };
  for (let i = 1; i < track.length; i++) {
    const a = twa[i];
    if (a == null) continue;
    const dt = track[i]![3] - track[i - 1]![3];
    if (dt <= 0 || dt > 60) continue;
    const pos = pointOfSail(a);
    pointsOfSail[pos] += dt;
    speedSum[pos] += track[i]![2] * dt;
  }
  const speedByPointOfSail = Object.fromEntries(
    (Object.keys(pointsOfSail) as PointOfSail[]).map((k) => [k, pointsOfSail[k] ? speedSum[k] / pointsOfSail[k] : 0]),
  ) as Record<PointOfSail, number>;

  // Side changes (sign of TWA) that are held for HOLD_SEC become manoeuvres.
  const maneuvers: Maneuver[] = [];
  let side = 0;
  let candidate: { index: number; side: number } | null = null;
  for (let i = 0; i < track.length; i++) {
    const a = twa[i];
    if (a == null || Math.abs(a) < 5 || Math.abs(a) > 175) continue;
    const s = Math.sign(a);
    if (side === 0) {
      side = s;
      continue;
    }
    if (s === side) {
      candidate = null;
      continue;
    }
    candidate ??= { index: i, side: s };
    if (track[i]![3] - track[candidate.index]![3] >= HOLD_SEC) {
      const at = track[candidate.index]![3];
      const around = (from: number, to: number) => {
        const vals = twa.filter((v, k) => v != null && track[k]![3] >= from && track[k]![3] <= to) as number[];
        return vals.length ? vals.reduce((sum, v) => sum + Math.abs(v), 0) / vals.length : 90;
      };
      const before = around(at - CONTEXT_SEC, at - 1);
      const after = around(at, at + CONTEXT_SEC);
      const p = track[candidate.index]!;
      maneuvers.push({ kind: (before + after) / 2 < 90 ? "tack" : "gybe", sec: at, lat: p[0], lon: p[1] });
      side = candidate.side;
      candidate = null;
    }
  }

  return {
    tacks: maneuvers.filter((m) => m.kind === "tack").length,
    gybes: maneuvers.filter((m) => m.kind === "gybe").length,
    maneuvers,
    pointsOfSail,
    speedByPointOfSail,
    twa: twa.map((v) => (v == null ? null : Math.round(v))),
  };
}
