import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, settingsFromRows } from "./settings";

const bodrum = { name: "Bodrum", lat: 37.03, lon: 27.43 };
const kos = { name: "Kos", lat: 36.89, lon: 27.29 };

describe("settingsFromRows", () => {
  it("lets forecast, daylight and radar follow the live wind place when they have no own row", () => {
    const { settings, custom } = settingsFromRows([{ key: "live_wind", value: bodrum }]);
    expect(settings.forecast).toEqual(bodrum);
    expect(settings.daylight).toEqual(bodrum);
    expect(settings.radar).toEqual({ ...bodrum, zoom: DEFAULT_SETTINGS.radar.zoom });
    expect(settings.wind_map).toEqual(DEFAULT_SETTINGS.wind_map);
    expect([...custom]).toEqual(["live_wind"]);
  });

  it("uses a card's own place and zoom when stored", () => {
    const { settings, custom } = settingsFromRows([
      { key: "live_wind", value: bodrum },
      { key: "forecast", value: kos },
      { key: "wind_map", value: { name: "Aegean", lat: 37.5, lon: 26, zoom: 7 } },
      { key: "radar", value: { ...kos, zoom: 9 } },
    ]);
    expect(settings.forecast).toEqual(kos);
    expect(settings.daylight).toEqual(bodrum);
    expect(settings.wind_map.zoom).toBe(7);
    expect(settings.radar).toEqual({ ...kos, zoom: 9 });
    expect(custom.has("daylight")).toBe(false);
  });

  it("ignores unknown keys and malformed values", () => {
    const { settings } = settingsFromRows([
      { key: "evil", value: bodrum },
      { key: "sea", value: { name: "x", lat: "no", lon: 1 } },
      { key: "radar", value: { ...kos, zoom: "far" } },
    ]);
    expect(settings.sea).toEqual(DEFAULT_SETTINGS.sea);
    expect(settings.radar.name).toBe(DEFAULT_SETTINGS.live_wind.name);
  });
});
