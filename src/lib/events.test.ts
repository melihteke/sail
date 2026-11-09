import { describe, expect, it } from "vitest";
import { describeEvent, summarizeLog, within, type SailEvent } from "./events";

const ev = (min: number, kind: string, data: SailEvent["data"] = {}): SailEvent => ({
  at: new Date(Date.UTC(2026, 10, 8, 15, min)).toISOString(),
  kind,
  lat: 52.3,
  lon: 4.84,
  data,
});
const T = (min: number) => Date.UTC(2026, 10, 8, 15, min);
const M = 60_000;

describe("summarizeLog", () => {
  it("splits a typical sail into engine out, sailing, engine back", () => {
    const s = summarizeLog(
      [ev(0, "cast_off"), ev(0, "engine_on"), ev(10, "sail_up", { sail: "main" }), ev(12, "engine_off"), ev(13, "sail_up", { sail: "jib" }), ev(70, "sail_down", { sail: "jib" }), ev(72, "engine_on"), ev(75, "sail_down", { sail: "main" }), ev(90, "docked")],
      T(95),
    );
    expect(s.engine).toEqual([
      { from: T(0), to: T(12) },
      { from: T(72), to: T(90) },
    ]);
    expect(s.sailing).toEqual([{ from: T(12), to: T(72) }]);
    expect(s.engineMs).toBe(30 * M);
    expect(s.sailingMs).toBe(60 * M);
    expect(within(s.engine, T(80))).toBe(true);
    expect(within(s.sailing, T(80))).toBe(false);
  });

  it("closes open periods at the end of the track", () => {
    const s = summarizeLog([ev(5, "sail_up", { sail: "main" })], T(65));
    expect(s.sailingMs).toBe(60 * M);
    expect(summarizeLog([ev(0, "engine_on")], T(20)).engineMs).toBe(20 * M);
  });

  it("ignores repeated or unmatched toggles and sorts by time", () => {
    const s = summarizeLog([ev(30, "engine_off"), ev(0, "engine_on"), ev(10, "engine_on"), ev(40, "engine_off")], T(60));
    expect(s.engine).toEqual([{ from: T(0), to: T(30) }]);
  });
});

describe("describeEvent", () => {
  it("names sails, weather and notes", () => {
    expect(describeEvent(ev(0, "sail_up", { sail: "gennaker" }))).toBe("Gennaker up");
    expect(describeEvent(ev(0, "weather", { bft: 4, sea_state: "moderate" }))).toBe("Weather · Bft 4 · moderate");
    expect(describeEvent(ev(0, "note", { text: "Lovely puff" }))).toBe("Lovely puff");
    expect(describeEvent(ev(0, "engine_on"))).toBe("Engine on");
    expect(describeEvent(ev(0, "something_new"))).toBe("something_new");
  });
});
