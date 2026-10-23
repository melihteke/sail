import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { meanDirection } from "./units";

export interface WindHour {
  /** ISO UTC hour, e.g. 2026-10-17T08:00Z */
  time: string;
  speedKn: number;
  gustKn: number;
  dirDeg: number;
  tempC: number;
}

export interface WindSummary {
  hours: WindHour[];
  avgKn: number;
  maxKn: number;
  maxGustKn: number;
  dirDeg: number;
  tempC: number;
  source: string;
}

// Resolved from the project root: at build time this module runs from a bundled chunk.
const CACHE_FILE = join(process.cwd(), "src", "data", "wind-cache.json");
const HOURLY = "wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_2m";
const SETTLED_AFTER_MS = 3 * 24 * 3600 * 1000;

type Cache = Record<string, WindHour[]>;
let cache: Cache | null = null;

function loadCache(): Cache {
  if (cache) return cache;
  cache = existsSync(CACHE_FILE) ? (JSON.parse(readFileSync(CACHE_FILE, "utf8")) as Cache) : {};
  return cache;
}

function saveCache() {
  if (!cache) return;
  const sorted = Object.fromEntries(Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)));
  try {
    writeFileSync(CACHE_FILE, JSON.stringify(sorted, null, 1) + "\n");
  } catch {
    // Read-only file systems (some CI setups) just skip persisting the cache.
  }
}

async function fetchDay(lat: number, lon: number, date: string): Promise<WindHour[]> {
  const ageMs = Date.now() - Date.parse(`${date}T00:00:00Z`);
  // ERA5 archive lags a few days; the historical-forecast API covers recent days well.
  const host = ageMs > 30 * 24 * 3600 * 1000 ? "archive-api.open-meteo.com/v1/archive" : "historical-forecast-api.open-meteo.com/v1/forecast";
  const url = `https://${host}?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&hourly=${HOURLY}&wind_speed_unit=kn&timezone=GMT`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as {
    hourly: { time: string[]; wind_speed_10m: number[]; wind_direction_10m: number[]; wind_gusts_10m: number[]; temperature_2m: number[] };
  };
  const h = json.hourly;
  return h.time
    .map((time, i) => ({
      time: `${time}Z`,
      speedKn: h.wind_speed_10m[i]!,
      gustKn: h.wind_gusts_10m[i]!,
      dirDeg: h.wind_direction_10m[i]!,
      tempC: h.temperature_2m[i]!,
    }))
    .filter((hour) => hour.speedKn != null && hour.dirDeg != null);
}

async function getDay(lat: number, lon: number, date: string) {
  const store = loadCache();
  const key = `${lat.toFixed(2)},${lon.toFixed(2)},${date}`;
  if (store[key]) return store[key];
  const hours = await fetchDay(+lat.toFixed(2), +lon.toFixed(2), date);
  if (Date.now() - Date.parse(`${date}T00:00:00Z`) > SETTLED_AFTER_MS && hours.length >= 24) {
    store[key] = hours;
    saveCache();
  }
  return hours;
}

/** Hourly wind (UTC) covering the sail window, from the cache or Open-Meteo. */
export async function getSailWind(lat: number, lon: number, startIso: string, endIso: string): Promise<WindSummary | null> {
  const start = Date.parse(startIso);
  const end = Date.parse(endIso);
  const dates = new Set<string>();
  for (let t = start; t <= end + 3600_000; t += 3600_000) dates.add(new Date(t).toISOString().slice(0, 10));
  try {
    const all = (await Promise.all([...dates].map((d) => getDay(lat, lon, d)))).flat();
    const from = Math.floor(start / 3600_000) * 3600_000;
    const to = Math.ceil(end / 3600_000) * 3600_000;
    const hours = all.filter((h) => {
      const t = Date.parse(h.time);
      return t >= from && t <= to;
    });
    if (!hours.length) return null;
    return {
      hours,
      avgKn: hours.reduce((sum, h) => sum + h.speedKn, 0) / hours.length,
      maxKn: Math.max(...hours.map((h) => h.speedKn)),
      maxGustKn: Math.max(...hours.map((h) => h.gustKn)),
      dirDeg: meanDirection(hours.map((h) => h.dirDeg)),
      tempC: hours.reduce((sum, h) => sum + h.tempC, 0) / hours.length,
      source: "Open-Meteo",
    };
  } catch (error) {
    console.warn(`[wind] could not load wind for ${startIso}:`, (error as Error).message);
    return null;
  }
}
