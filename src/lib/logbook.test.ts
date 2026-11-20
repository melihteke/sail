import { describe, expect, it } from "vitest";
import { engineMinutesFromEvents, logbookCsv, logFacts, nightHours, type LogbookRow } from "./logbook";

describe("nightHours", () => {
  it("counts only the time after sunset", () => {
    // Amsterdam midwinter: sunset about 15:29 UTC
    expect(nightHours("2026-12-21T13:00:00Z", "2026-12-21T17:30:00Z", 52.37, 4.9)).toBeCloseTo(2, 0);
    expect(nightHours("2026-12-21T10:00:00Z", "2026-12-21T14:00:00Z", 52.37, 4.9)).toBe(0);
  });

  it("counts a night passage through midnight", () => {
    // Sunset ~15:29 UTC, sunrise ~07:48 UTC the next day: 20:00 → 06:00 is all night
    expect(nightHours("2026-12-21T20:00:00Z", "2026-12-22T06:00:00Z", 52.37, 4.9)).toBe(10);
  });
});

describe("engine minutes", () => {
  const events = [
    { at: "2026-11-08T15:00:00Z", kind: "engine_on", lat: null, lon: null, data: {} },
    { at: "2026-11-08T15:20:00Z", kind: "engine_off", lat: null, lon: null, data: {} },
  ];

  it("come from the event log unless set by hand", () => {
    expect(engineMinutesFromEvents(events, "2026-11-08T17:00:00Z")).toBe(20);
    expect(engineMinutesFromEvents([], "2026-11-08T17:00:00Z")).toBeNull();
    expect(logFacts({ engine_minutes: null }, events, "2026-11-08T17:00:00Z").engineMinutes).toBe(20);
    expect(logFacts({ engine_minutes: 5 }, events, "2026-11-08T17:00:00Z").engineMinutes).toBe(5);
    expect(logFacts({ night_hours: "1.5" }).nightHours).toBe(1.5);
  });
});

describe("logbookCsv", () => {
  it("quotes commas and quotes, and only adds private notes on request", () => {
    const row = { date: "2026-11-08", title: 'Gusty, "fun"', tidal: true, privateNotes: "secret" } as LogbookRow;
    const [header, line] = logbookCsv([row]).split("\r\n");
    expect(header).not.toContain("Private notes");
    expect(line).toContain('"Gusty, ""fun"""');
    expect(line).toContain("yes");
    expect(line).not.toContain("secret");
    expect(logbookCsv([row], true)).toContain("secret");
  });
});
