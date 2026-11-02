import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeSail, bearing, pointOfSail, signedTwa } from "./analysis";
import { computeStats, type TrackPoint } from "./gpx";
import type { WindHour } from "./wind";

const START = "2026-10-17T08:00:00Z";
const windFrom = (dirDeg: number): { hours: WindHour[] } => ({
  hours: [0, 1, 2, 3].map((h) => ({ time: `2026-10-17T${String(8 + h).padStart(2, "0")}:00Z`, speedKn: 10, gustKn: 14, dirDeg, tempC: 12 })),
});

/** Synthetic track: legs of [headingDeg, seconds] at 4 kn, one point every 8 s. */
function sail(legs: [number, number][], kn = 4): TrackPoint[] {
  const pts: TrackPoint[] = [];
  let lat = 52.3;
  let lon = 4.84;
  let t = 0;
  const step = 8;
  const metres = (kn * 1852 * step) / 3600;
  pts.push([lat, lon, kn, t]);
  for (const [hdg, secs] of legs) {
    for (let s = 0; s < secs; s += step) {
      const r = (hdg * Math.PI) / 180;
      lat += (metres * Math.cos(r)) / 111_320;
      lon += (metres * Math.sin(r)) / (111_320 * Math.cos((lat * Math.PI) / 180));
      t += step;
      pts.push([lat, lon, kn, t]);
    }
  }
  return pts;
}

describe("geometry", () => {
  it("computes bearings and signed true wind angles", () => {
    expect(bearing({ lat: 52, lon: 4 }, { lat: 53, lon: 4 })).toBeCloseTo(0, 0);
    expect(bearing({ lat: 52, lon: 4 }, { lat: 52, lon: 5 })).toBeCloseTo(90, 0);
    expect(signedTwa(45, 0)).toBe(45);
    expect(signedTwa(315, 0)).toBe(-45);
    expect(signedTwa(180, 0)).toBe(180);
    expect(signedTwa(10, 350)).toBe(20);
  });

  it("classifies points of sail", () => {
    expect(pointOfSail(40)).toBe("upwind");
    expect(pointOfSail(-90)).toBe("reach");
    expect(pointOfSail(130)).toBe("broadReach");
    expect(pointOfSail(-170)).toBe("downwind");
  });
});

describe("analyzeSail", () => {
  it("counts tacks when beating upwind", () => {
    const track = sail([[45, 120], [315, 120], [45, 120], [315, 120]]);
    const a = analyzeSail(track, windFrom(0), START)!;
    expect(a.tacks).toBe(3);
    expect(a.gybes).toBe(0);
    expect(a.pointsOfSail.upwind).toBeGreaterThan(a.pointsOfSail.reach);
  });

  it("counts gybes when running downwind", () => {
    const track = sail([[150, 120], [210, 120], [150, 120]]);
    const a = analyzeSail(track, windFrom(0), START)!;
    expect(a.gybes).toBe(2);
    expect(a.tacks).toBe(0);
    expect(a.pointsOfSail.broadReach + a.pointsOfSail.downwind).toBeGreaterThan(200);
  });

  it("ignores short wobbles across the wind", () => {
    const track = sail([[10, 120], [350, 8], [10, 120]]);
    const a = analyzeSail(track, windFrom(0), START)!;
    expect(a.tacks).toBe(0);
  });

  it("returns null without wind", () => {
    expect(analyzeSail(sail([[45, 60]]), null, START)).toBeNull();
  });

  it("produces plausible numbers for the real Morning Sail GPX", () => {
    const xml = readFileSync(join(import.meta.dirname, "../content/sails/2026-10-17-morning-sail/track.gpx"), "utf8");
    const stats = computeStats(xml);
    // Hourly Open-Meteo wind for that morning came from about north (336°–19°).
    const a = analyzeSail(stats.track, windFrom(355), stats.start)!;
    const moving = Object.values(a.pointsOfSail).reduce((s, v) => s + v, 0);
    expect(moving).toBeGreaterThan(stats.movingSec * 0.6);
    expect(a.tacks + a.gybes).toBeGreaterThan(5);
    expect(a.tacks + a.gybes).toBeLessThan(150);
  });
});
