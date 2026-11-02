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

const HOURLY = "wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_2m";
const HOUR = 3600_000;

async function fetchDay(lat: number, lon: number, date: string, fetcher: typeof fetch): Promise<WindHour[]> {
  const ageMs = Date.now() - Date.parse(`${date}T00:00:00Z`);
  // ERA5 archive lags a few days; the historical-forecast API covers recent days well.
  const host = ageMs > 30 * 24 * HOUR ? "archive-api.open-meteo.com/v1/archive" : "historical-forecast-api.open-meteo.com/v1/forecast";
  const url = `https://${host}?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&start_date=${date}&end_date=${date}&hourly=${HOURLY}&wind_speed_unit=kn&timezone=GMT`;
  const res = await fetcher(url);
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

export function summarizeWind(hours: WindHour[], source = "Open-Meteo"): WindSummary | null {
  if (!hours.length) return null;
  return {
    hours,
    avgKn: hours.reduce((sum, h) => sum + h.speedKn, 0) / hours.length,
    maxKn: Math.max(...hours.map((h) => h.speedKn)),
    maxGustKn: Math.max(...hours.map((h) => h.gustKn)),
    dirDeg: meanDirection(hours.map((h) => h.dirDeg)),
    tempC: hours.reduce((sum, h) => sum + h.tempC, 0) / hours.length,
    source,
  };
}

/** Hourly wind (UTC) covering the sail window from Open-Meteo (no API key). Works in the browser and Node. */
export async function fetchSailWind(lat: number, lon: number, startIso: string, endIso: string, fetcher: typeof fetch = fetch) {
  const start = Date.parse(startIso);
  const end = Date.parse(endIso);
  const dates = new Set<string>();
  for (let t = start; t <= end + HOUR; t += HOUR) dates.add(new Date(t).toISOString().slice(0, 10));
  const all = (await Promise.all([...dates].map((d) => fetchDay(lat, lon, d, fetcher)))).flat();
  const from = Math.floor(start / HOUR) * HOUR;
  const to = Math.ceil(end / HOUR) * HOUR;
  return summarizeWind(all.filter((h) => Date.parse(h.time) >= from && Date.parse(h.time) <= to));
}

/** Wind direction/speed at an instant, interpolated between hourly values (directions on the circle). */
export function windAt(wind: Pick<WindSummary, "hours">, epochMs: number) {
  const hours = wind.hours.filter((h) => Number.isFinite(Date.parse(h.time)));
  if (!hours.length) return null;
  const times = hours.map((h) => Date.parse(h.time));
  if (epochMs <= times[0]!) return { dirDeg: hours[0]!.dirDeg, speedKn: hours[0]!.speedKn };
  const last = hours.length - 1;
  if (epochMs >= times[last]!) return { dirDeg: hours[last]!.dirDeg, speedKn: hours[last]!.speedKn };
  const i = times.findIndex((t) => t > epochMs) - 1;
  const a = hours[i]!;
  const b = hours[i + 1]!;
  const f = (epochMs - times[i]!) / (times[i + 1]! - times[i]!);
  const diff = ((b.dirDeg - a.dirDeg + 540) % 360) - 180;
  return { dirDeg: (a.dirDeg + diff * f + 360) % 360, speedKn: a.speedKn + (b.speedKn - a.speedKn) * f };
}
