import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { getCollection, type CollectionEntry } from "astro:content";
import { SITE } from "@/config";
import { computeStats, type TrackStats } from "./gpx";
import { getSailWind, type WindSummary } from "./wind";

export interface Sail {
  slug: string;
  entry: CollectionEntry<"sails">;
  stats: TrackStats;
  wind: WindSummary | null;
  /** Local (site time zone) calendar date of the start, YYYY-MM-DD */
  localDate: string;
}

const localDateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: SITE.timeZone, year: "numeric", month: "2-digit", day: "2-digit" });

let cached: Promise<Sail[]> | null = null;

async function load(): Promise<Sail[]> {
  const entries = await getCollection("sails", ({ data }) => import.meta.env.DEV || !data.draft);
  const sails = await Promise.all(
    entries.map(async (entry) => {
      if (!entry.filePath) throw new Error(`Sail ${entry.id} has no file path`);
      const gpxPath = join(process.cwd(), dirname(entry.filePath), entry.data.gpx);
      const stats = computeStats(await readFile(gpxPath, "utf8"));
      const wind = await getSailWind(stats.startPoint.lat, stats.startPoint.lon, stats.start, stats.end);
      return {
        slug: entry.id.replace(/\/index$/, ""),
        entry,
        stats,
        wind,
        localDate: localDateFmt.format(new Date(stats.start)),
      };
    }),
  );
  return sails.sort((a, b) => b.stats.start.localeCompare(a.stats.start));
}

/** All published sails with GPX stats and wind, newest first. Memoised per build. */
export function getSails() {
  cached ??= load();
  return cached;
}

export function careerStats(sails: Sail[]) {
  const totalNm = sails.reduce((s, x) => s + x.stats.distanceNm, 0);
  const totalSec = sails.reduce((s, x) => s + x.stats.elapsedSec, 0);
  const fastest = sails.reduce<Sail | null>((best, x) => (!best || x.stats.maxSpeedKn > best.stats.maxSpeedKn ? x : best), null);
  const longest = sails.reduce<Sail | null>((best, x) => (!best || x.stats.distanceNm > best.stats.distanceNm ? x : best), null);
  const windiest = sails.reduce<Sail | null>((best, x) => (x.wind && (!best?.wind || x.wind.maxGustKn > best.wind.maxGustKn) ? x : best), null);
  return {
    count: sails.length,
    totalNm,
    totalSec,
    days: new Set(sails.map((s) => s.localDate)).size,
    fastest,
    longest,
    windiest,
  };
}

/** Per-day nautical miles for the activity heatmap. */
export function activityData(sails: Sail[]) {
  const byDay = new Map<string, number>();
  for (const sail of sails) byDay.set(sail.localDate, (byDay.get(sail.localDate) ?? 0) + sail.stats.distanceNm);
  return [...byDay].map(([date, nm]) => ({ date, value: Math.round(nm * 10) / 10 }));
}

export function formatLocal(iso: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: SITE.timeZone, ...options }).format(new Date(iso));
}
