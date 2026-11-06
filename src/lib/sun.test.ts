import { describe, expect, it } from "vitest";
import { moonInfo, sunTimes } from "./sun";

const minutesOff = (a: Date | null, iso: string) => Math.abs(a!.getTime() - new Date(iso).getTime()) / 60000;

describe("sunTimes", () => {
  it("matches published Amsterdam times at midsummer", () => {
    // timeanddate.com, Amsterdam 2026-06-21: sunrise 05:18, sunset 22:06 (CEST = UTC+2)
    const s = sunTimes(new Date("2026-06-21T12:00:00Z"), 52.37, 4.9);
    expect(minutesOff(s.sunrise, "2026-06-21T03:18:00Z")).toBeLessThan(3);
    expect(minutesOff(s.sunset, "2026-06-21T20:06:00Z")).toBeLessThan(3);
    expect(s.dawn!.getTime()).toBeLessThan(s.sunrise!.getTime());
    expect(s.dusk!.getTime()).toBeGreaterThan(s.sunset!.getTime());
  });

  it("matches published Amsterdam times at midwinter", () => {
    // Amsterdam 2026-12-21: sunrise 08:48, sunset 16:29 (CET = UTC+1)
    const s = sunTimes(new Date("2026-12-21T12:00:00Z"), 52.37, 4.9);
    expect(minutesOff(s.sunrise, "2026-12-21T07:48:00Z")).toBeLessThan(3);
    expect(minutesOff(s.sunset, "2026-12-21T15:29:00Z")).toBeLessThan(3);
  });

  it("returns null in polar night", () => {
    const s = sunTimes(new Date("2026-12-21T12:00:00Z"), 78.2, 15.6);
    expect(s.sunrise).toBeNull();
    expect(s.sunset).toBeNull();
  });
});

describe("moonInfo", () => {
  it("knows a full moon and a new moon", () => {
    // Full moon 2024-01-25 17:54 UTC, new moon 2024-02-09 22:59 UTC
    const full = moonInfo(new Date("2024-01-25T17:54:00Z"));
    expect(full.phase).toBe("full");
    expect(full.illumination).toBeGreaterThan(0.99);
    const nm = moonInfo(new Date("2024-02-09T22:59:00Z"));
    expect(nm.phase).toBe("new");
    expect(nm.illumination).toBeLessThan(0.01);
  });
});
