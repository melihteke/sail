import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { getCollection } from "astro:content";
import { createClient } from "@supabase/supabase-js";
import { SITE, SUPABASE } from "@/config";
import { BOAT } from "@/data/boat";
import windCache from "@/data/wind-cache.json";
import { analyzeSail, type SailAnalysis } from "./analysis";
import type { SailEvent } from "./events";
import { computeStats, type TrackStats } from "./gpx";
import { sailMedia as legacyMedia } from "./media";
import { splitSections, type SailSections } from "./sections";
import type { BoatRow, BoatSpec, MediaRow, PhotoCredit, SailRole, SailRow } from "./types";
import { fetchSailWind, summarizeWind, type WindHour, type WindSummary } from "./wind";
import { parseYouTube, type YouTubeVideo } from "./youtube";

export interface ImageRef {
  src: string;
  width?: number;
  height?: number;
}

export interface BoatView {
  id: string;
  slug: string;
  name: string;
  model: string | null;
  builder: string | null;
  builderUrl: string | null;
  designer: string | null;
  designYear: number | null;
  sailNumber: string | null;
  homeWater: string | null;
  description: string;
  specs: BoatSpec[];
  photo: ImageRef | null;
  photoCredit: PhotoCredit | null;
  isDefault: boolean;
}

export type MediaView =
  | { kind: "photo"; id: string; src: string; thumb: string; width?: number; height?: number; caption?: string; lat?: number; lon?: number }
  | { kind: "video"; id: string; src: string; poster?: string; width?: number; height?: number; caption?: string }
  | { kind: "youtube"; id: string; video: YouTubeVideo; caption?: string }
  | { kind: "link"; id: string; url: string; caption?: string };

export interface Sail {
  slug: string;
  title: string;
  date: string;
  location: string;
  summary: string;
  role: SailRole;
  crew: string[];
  rating: number;
  sailsUsed: string | null;
  reef: boolean;
  tags: string[];
  sections: SailSections;
  boat: BoatView | null;
  stats: TrackStats;
  wind: WindSummary | null;
  analysis: SailAnalysis | null;
  media: MediaView[];
  cover: ImageRef | null;
  /** Cover the author picked on purpose (cards show the route map otherwise) */
  explicitCover: ImageRef | null;
  /** Local (site time zone) calendar date of the start, YYYY-MM-DD */
  localDate: string;
  /** Where to read the original GPX from at build time */
  gpx: { file: string } | { url: string };
  /** Event log recorded with the Sail Tracker app (empty for other sails) */
  events: SailEvent[];
}

export interface Logbook {
  source: "supabase" | "markdown";
  sails: Sail[];
  boats: BoatView[];
}

const localDateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: SITE.timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
const localDate = (iso: string) => localDateFmt.format(new Date(iso));

export const supabaseConfigured = Boolean(SUPABASE.url && SUPABASE.anonKey);

export function storageUrl(bucket: "media" | "gpx", path: string) {
  return `${SUPABASE.url.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

// --- Supabase ---------------------------------------------------------------------------------------

function boatFromRow(row: BoatRow): BoatView {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    model: row.model,
    builder: row.builder,
    builderUrl: row.builder_url,
    designer: row.designer,
    designYear: row.design_year,
    sailNumber: row.sail_number,
    homeWater: row.home_water,
    description: row.description,
    specs: row.specs ?? [],
    photo: row.photo_path ? { src: storageUrl("media", row.photo_path) } : null,
    photoCredit: row.photo_credit,
    isDefault: row.is_default,
  };
}

export function mediaFromRow(row: MediaRow): MediaView | null {
  const caption = row.caption ?? undefined;
  const size = { width: row.width ?? undefined, height: row.height ?? undefined };
  switch (row.kind) {
    case "photo":
      return row.storage_path
        ? {
            kind: "photo",
            id: row.id,
            src: storageUrl("media", row.storage_path),
            thumb: storageUrl("media", row.thumb_path ?? row.storage_path),
            ...size,
            caption,
            ...(row.lat != null && row.lon != null ? { lat: row.lat, lon: row.lon } : {}),
          }
        : null;
    case "video":
      return row.storage_path
        ? { kind: "video", id: row.id, src: storageUrl("media", row.storage_path), poster: row.poster_path ? storageUrl("media", row.poster_path) : undefined, ...size, caption }
        : null;
    case "youtube": {
      const video = row.url ? parseYouTube(row.url, caption) : null;
      return video ? { kind: "youtube", id: row.id, video, caption } : null;
    }
    case "link":
      return row.url ? { kind: "link", id: row.id, url: row.url, caption } : null;
  }
}

function coverOf(media: MediaView[], coverId: string | null): ImageRef | null {
  const chosen = media.find((m) => m.id === coverId) ?? media.find((m) => m.kind === "photo") ?? media.find((m) => m.kind === "video" && m.poster);
  if (chosen?.kind === "photo") return { src: chosen.thumb, width: chosen.width, height: chosen.height };
  if (chosen?.kind === "video" && chosen.poster) return { src: chosen.poster };
  return null;
}

async function loadSupabase(): Promise<Logbook> {
  const db = createClient(SUPABASE.url, SUPABASE.anonKey, { auth: { persistSession: false } });
  const [boatsRes, sailsRes] = await Promise.all([
    db.from("boats").select("*").order("sort").order("name"),
    db.from("sails").select("*").eq("status", "published").order("date", { ascending: false }),
  ]);
  if (boatsRes.error) throw new Error(`Supabase boats: ${boatsRes.error.message}`);
  if (sailsRes.error) throw new Error(`Supabase sails: ${sailsRes.error.message}`);
  const sailRows = sailsRes.data as SailRow[];
  const mediaRes = sailRows.length
    ? await db.from("sail_media").select("*").in("sail_id", sailRows.map((s) => s.id)).order("sort")
    : { data: [], error: null };
  if (mediaRes.error) throw new Error(`Supabase media: ${mediaRes.error.message}`);
  // The event log table arrives with migration 0005; build without it if it is not there yet.
  const eventsRes = sailRows.length
    ? await db.from("sail_events").select("sail_id, at, kind, lat, lon, data").in("sail_id", sailRows.map((s) => s.id)).order("at")
    : { data: [], error: null };
  if (eventsRes.error) console.warn(`[logbook] no event log: ${eventsRes.error.message}`);
  const eventsBySail = new Map<string, SailEvent[]>();
  for (const row of (eventsRes.error ? [] : eventsRes.data) as (SailEvent & { sail_id: string })[]) {
    const { sail_id, ...e } = row;
    eventsBySail.set(sail_id, [...(eventsBySail.get(sail_id) ?? []), { ...e, data: e.data ?? {} }]);
  }

  const boats = (boatsRes.data as BoatRow[]).map(boatFromRow);
  const boatById = new Map(boats.map((b) => [b.id, b]));
  const mediaBySail = new Map<string, MediaView[]>();
  for (const row of mediaRes.data as MediaRow[]) {
    const view = mediaFromRow(row);
    if (view) mediaBySail.set(row.sail_id, [...(mediaBySail.get(row.sail_id) ?? []), view]);
  }

  const sails: Sail[] = [];
  for (const row of sailRows) {
    if (!row.stats || !row.track || !row.gpx_path) {
      console.warn(`[logbook] skipping "${row.slug}": no GPX track yet`);
      continue;
    }
    const media = mediaBySail.get(row.id) ?? [];
    const stats: TrackStats = { ...row.stats, track: row.track };
    const analysis = row.analysis ? ({ twa: [], ...row.analysis } as SailAnalysis) : analyzeSail(stats.track, row.wind, stats.start);
    sails.push({
      slug: row.slug,
      title: row.title,
      date: row.date,
      location: row.location,
      summary: row.summary,
      role: row.role,
      crew: row.crew ?? [],
      rating: row.rating,
      sailsUsed: row.sails_used,
      reef: row.reef,
      tags: row.tags ?? [],
      sections: { howItWent: row.how_it_went, whatIPractised: row.what_i_practised, learnings: row.learnings, notes: row.notes },
      boat: (row.boat_id && boatById.get(row.boat_id)) || null,
      stats,
      wind: row.wind,
      analysis,
      media,
      cover: coverOf(media, row.cover_media_id),
      explicitCover: row.cover_media_id && media.some((m) => m.id === row.cover_media_id) ? coverOf(media, row.cover_media_id) : null,
      localDate: localDate(stats.start),
      gpx: { url: storageUrl("gpx", row.gpx_path) },
      events: eventsBySail.get(row.id) ?? [],
    });
  }
  return { source: "supabase", sails: sortSails(sails), boats };
}

// --- Legacy markdown content (used until Supabase is configured) -----------------------------------

function legacyBoat(): BoatView {
  return {
    id: "legacy-polyvalk",
    slug: "polyvalk",
    name: BOAT.name,
    model: BOAT.model,
    builder: BOAT.builder,
    builderUrl: BOAT.builderUrl,
    designer: BOAT.designer,
    designYear: BOAT.designYear,
    sailNumber: BOAT.sailNumber ?? null,
    homeWater: BOAT.homePort,
    description: `${BOAT.description}\n\n<small>Specifications are class figures; individual boats vary by build year and fit-out. Sources: ${BOAT.sources
      .map((s) => `[${s.label}](${s.url})`)
      .join(", ")}.</small>`,
    specs: BOAT.specs,
    photo: BOAT.photo ? { src: BOAT.photo.src, width: BOAT.photo.width, height: BOAT.photo.height } : null,
    photoCredit: BOAT.photoCredit ?? null,
    isDefault: true,
  };
}

async function legacyWind(lat: number, lon: number, start: string, end: string) {
  const cache = windCache as Record<string, WindHour[]>;
  const day = start.slice(0, 10);
  const cached = cache[`${lat.toFixed(2)},${lon.toFixed(2)},${day}`];
  if (cached && end.slice(0, 10) === day) {
    const from = Math.floor(Date.parse(start) / 3600_000) * 3600_000;
    const to = Math.ceil(Date.parse(end) / 3600_000) * 3600_000;
    return summarizeWind(cached.filter((h) => Date.parse(h.time) >= from && Date.parse(h.time) <= to));
  }
  try {
    return await fetchSailWind(lat, lon, start, end);
  } catch (error) {
    console.warn(`[wind] could not load wind for ${start}:`, (error as Error).message);
    return null;
  }
}

async function loadMarkdown(): Promise<Logbook> {
  const boat = legacyBoat();
  const entries = await getCollection("sails", ({ data }) => import.meta.env.DEV || !data.draft);
  const sails = await Promise.all(
    entries.map(async (entry): Promise<Sail> => {
      const slug = entry.id.replace(/\/index$/, "");
      const file = join(process.cwd(), dirname(entry.filePath!), entry.data.gpx);
      const stats = computeStats(await readFile(file, "utf8"));
      const wind = await legacyWind(stats.startPoint.lat, stats.startPoint.lon, stats.start, stats.end);
      const files: MediaView[] = legacyMedia(slug, entry.data.captions).map((m, i) =>
        m.kind === "photo"
          ? { kind: "photo", id: `${slug}-m${i}`, src: m.image.src, thumb: m.image.src, width: m.image.width, height: m.image.height, caption: m.caption }
          : { kind: "video", id: `${slug}-m${i}`, src: m.src, poster: m.poster?.src, width: m.poster?.width, height: m.poster?.height, caption: m.caption },
      );
      const youtube: MediaView[] = entry.data.youtube.map((video, i) => ({ kind: "youtube", id: `${slug}-yt${i}`, video, caption: video.caption }));
      const media = [...youtube, ...files];
      const explicitCover = entry.data.cover ? { src: entry.data.cover.src, width: entry.data.cover.width, height: entry.data.cover.height } : null;
      return {
        slug,
        title: entry.data.title,
        date: entry.data.date.toISOString().slice(0, 10),
        location: entry.data.location,
        summary: entry.data.summary,
        role: entry.data.role,
        crew: entry.data.crew,
        rating: entry.data.rating,
        sailsUsed: entry.data.sails ?? null,
        reef: entry.data.reef,
        tags: entry.data.tags,
        sections: splitSections(entry.body ?? ""),
        boat,
        stats,
        wind,
        analysis: analyzeSail(stats.track, wind, stats.start),
        media,
        cover: explicitCover ?? coverOf(media, null),
        explicitCover,
        localDate: localDate(stats.start),
        gpx: { file },
        events: [],
      };
    }),
  );
  return { source: "markdown", sails: sortSails(sails), boats: [boat] };
}

// --- Public API ------------------------------------------------------------------------------------

function sortSails(sails: Sail[]) {
  return sails.sort((a, b) => b.stats.start.localeCompare(a.stats.start));
}

let cached: Promise<Logbook> | null = null;

/** Published sails (newest first) and boats, from Supabase or the legacy Markdown content. Memoised per build. */
export function getLogbook() {
  cached ??= supabaseConfigured ? loadSupabase() : loadMarkdown();
  return cached;
}

export async function getSails() {
  return (await getLogbook()).sails;
}

export async function getBoats() {
  return (await getLogbook()).boats;
}

export async function readGpx(sail: Sail) {
  if ("file" in sail.gpx) return readFile(sail.gpx.file, "utf8");
  const res = await fetch(sail.gpx.url);
  if (!res.ok) throw new Error(`GPX ${sail.slug}: ${res.status}`);
  return res.text();
}

export function careerStats(sails: Sail[]) {
  const pick = (score: (s: Sail) => number) =>
    sails.reduce<Sail | null>((best, x) => (score(x) > (best ? score(best) : -Infinity) ? x : best), null);
  return {
    count: sails.length,
    totalNm: sails.reduce((s, x) => s + x.stats.distanceNm, 0),
    totalSec: sails.reduce((s, x) => s + x.stats.elapsedSec, 0),
    days: new Set(sails.map((s) => s.localDate)).size,
    fastest: pick((s) => s.stats.maxSpeedKn),
    longest: pick((s) => s.stats.distanceNm),
    longestTime: pick((s) => s.stats.elapsedSec),
    windiest: pick((s) => s.wind?.maxGustKn ?? -1),
    busiest: pick((s) => (s.analysis ? s.analysis.tacks + s.analysis.gybes : -1)),
    tacks: sails.reduce((s, x) => s + (x.analysis?.tacks ?? 0), 0),
    gybes: sails.reduce((s, x) => s + (x.analysis?.gybes ?? 0), 0),
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
