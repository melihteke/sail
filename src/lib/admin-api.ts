import { DEPLOY, SITE } from "@/config";
import { analyzeSail } from "./analysis";
import { computeStats, type TrackStats } from "./gpx";
import { extensionOf, processPhoto, processVideo, BOAT_PHOTO_MAX_PX } from "./media-process";
import { sailSlug, slugify } from "./sections";
import { db } from "./supabase";
import type { BoatRow, MediaRow, SailRow } from "./types";
import { fetchSailWind } from "./wind";
import { parseYouTube } from "./youtube";

export const MEDIA_BUCKET = "media";
export const GPX_BUCKET = "gpx";

const localDateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: SITE.timeZone, year: "numeric", month: "2-digit", day: "2-digit" });

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export function publicUrl(bucket: string, path: string) {
  return db().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

// --- GPX --------------------------------------------------------------------------------------------

export interface ProcessedGpx {
  xml: string;
  stats: TrackStats;
  wind: Awaited<ReturnType<typeof fetchSailWind>>;
  analysis: ReturnType<typeof analyzeSail>;
  localDate: string;
  name: string;
  windError: string | null;
}

/** Parses the GPX in the browser, then adds hourly wind (Open-Meteo) and the manoeuvre analysis. */
export async function processGpx(file: File): Promise<ProcessedGpx> {
  const xml = await file.text();
  const stats = computeStats(xml);
  let wind: ProcessedGpx["wind"] = null;
  let windError: string | null = null;
  try {
    wind = await fetchSailWind(stats.startPoint.lat, stats.startPoint.lon, stats.start, stats.end);
  } catch (error) {
    windError = (error as Error).message;
  }
  return {
    xml,
    stats,
    wind,
    analysis: analyzeSail(stats.track, wind, stats.start),
    localDate: localDateFmt.format(new Date(stats.start)),
    name: stats.name,
    windError,
  };
}

function gpxFields(gpx: ProcessedGpx) {
  const { track, ...stats } = gpx.stats;
  return { stats, track, wind: gpx.wind, analysis: gpx.analysis };
}

// --- Sails ------------------------------------------------------------------------------------------

export async function listSails() {
  return check(
    await db()
      .from("sails")
      .select("id, slug, status, title, date, location, boat_id, updated_at, published_at, stats")
      .order("date", { ascending: false }),
  ) as Pick<SailRow, "id" | "slug" | "status" | "title" | "date" | "location" | "boat_id" | "updated_at" | "published_at" | "stats">[];
}

export async function getSail(id: string) {
  return check(await db().from("sails").select("*").eq("id", id).single()) as SailRow;
}

async function uniqueSlug(base: string, ignoreId?: string) {
  const rows = check(await db().from("sails").select("id, slug").like("slug", `${base}%`)) as { id: string; slug: string }[];
  const taken = new Set(rows.filter((r) => r.id !== ignoreId).map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
}

export async function createSailFromGpx(gpx: ProcessedGpx, defaults: { title: string; location: string; boatId: string | null }) {
  const slug = await uniqueSlug(sailSlug(gpx.localDate, defaults.title));
  const row = check(
    await db()
      .from("sails")
      .insert({
        slug,
        title: defaults.title,
        date: gpx.localDate,
        location: defaults.location,
        boat_id: defaults.boatId,
        status: "draft",
        ...gpxFields(gpx),
      })
      .select("*")
      .single(),
  ) as SailRow;
  const gpxPath = await uploadGpx(row.id, gpx.xml);
  return check(await db().from("sails").update({ gpx_path: gpxPath }).eq("id", row.id).select("*").single()) as SailRow;
}

async function uploadGpx(sailId: string, xml: string) {
  const path = `${sailId}/track.gpx`;
  check(await db().storage.from(GPX_BUCKET).upload(path, new Blob([xml], { type: "application/gpx+xml" }), { upsert: true, contentType: "application/gpx+xml" }));
  return path;
}

export async function replaceGpx(sailId: string, gpx: ProcessedGpx) {
  const gpxPath = await uploadGpx(sailId, gpx.xml);
  return check(await db().from("sails").update({ gpx_path: gpxPath, ...gpxFields(gpx) }).eq("id", sailId).select("*").single()) as SailRow;
}

/** Re-fetches wind and re-runs the analysis for a sail that already has a track. */
export async function refreshWind(sail: SailRow) {
  if (!sail.stats || !sail.track) throw new Error("This sail has no GPX track yet.");
  const wind = await fetchSailWind(sail.stats.startPoint.lat, sail.stats.startPoint.lon, sail.stats.start, sail.stats.end);
  const analysis = analyzeSail(sail.track, wind, sail.stats.start);
  return check(await db().from("sails").update({ wind, analysis }).eq("id", sail.id).select("*").single()) as SailRow;
}

export type SailPatch = Partial<Omit<SailRow, "id" | "created_at" | "updated_at">>;

export async function updateSail(id: string, patch: SailPatch) {
  if (patch.slug !== undefined) patch.slug = slugify(patch.slug);
  return check(await db().from("sails").update(patch).eq("id", id).select("*").single()) as SailRow;
}

async function removeFolder(bucket: string, prefix: string) {
  const files = check(await db().storage.from(bucket).list(prefix, { limit: 1000 })) as { name: string }[];
  if (files.length) check(await db().storage.from(bucket).remove(files.map((f) => `${prefix}/${f.name}`)));
}

export async function deleteSail(id: string) {
  await removeFolder(MEDIA_BUCKET, `sails/${id}`);
  await removeFolder(GPX_BUCKET, id);
  check(await db().from("sails").delete().eq("id", id));
}

// --- Media ------------------------------------------------------------------------------------------

export async function listMedia(sailId: string) {
  return check(await db().from("sail_media").select("*").eq("sail_id", sailId).order("sort").order("created_at")) as MediaRow[];
}

async function nextSort(sailId: string) {
  const rows = check(await db().from("sail_media").select("sort").eq("sail_id", sailId).order("sort", { ascending: false }).limit(1)) as { sort: number }[];
  return (rows[0]?.sort ?? -1) + 1;
}

async function upload(path: string, blob: Blob, contentType: string) {
  check(await db().storage.from(MEDIA_BUCKET).upload(path, blob, { contentType, cacheControl: "31536000", upsert: false }));
  return path;
}

/** Processes and uploads photos/videos in shooting order. Returns warnings to show the user. */
export async function uploadMediaFiles(sailId: string, files: File[], onProgress?: (done: number, total: number, name: string) => void) {
  const warnings: string[] = [];
  const prepared: { file: File; takenAt: string | null; run: (sort: number) => Promise<void> }[] = [];
  let done = 0;
  for (const file of files) {
    onProgress?.(done, files.length, file.name);
    const id = crypto.randomUUID();
    const base = `sails/${sailId}/${id}`;
    if (file.type.startsWith("video/") || /\.(mp4|mov|m4v|webm)$/i.test(file.name)) {
      const v = await processVideo(file);
      if (v.warning) warnings.push(`${file.name}: ${v.warning}`);
      prepared.push({
        file,
        takenAt: v.takenAt,
        run: async (sort) => {
          const path = await upload(`${base}.${extensionOf(file, "mp4")}`, file, file.type || "video/mp4");
          const poster = v.poster ? await upload(`${base}_poster.jpg`, v.poster, "image/jpeg") : null;
          check(await db().from("sail_media").insert({ sail_id: sailId, kind: "video", storage_path: path, poster_path: poster, width: v.width, height: v.height, taken_at: v.takenAt, sort }));
        },
      });
    } else {
      const p = await processPhoto(file);
      prepared.push({
        file,
        takenAt: p.takenAt,
        run: async (sort) => {
          const path = await upload(`${base}.jpg`, p.full, "image/jpeg");
          const thumb = await upload(`${base}_thumb.jpg`, p.thumb, "image/jpeg");
          check(await db().from("sail_media").insert({ sail_id: sailId, kind: "photo", storage_path: path, thumb_path: thumb, width: p.width, height: p.height, taken_at: p.takenAt, sort }));
        },
      });
    }
    done++;
    onProgress?.(done, files.length, file.name);
  }
  prepared.sort((a, b) => (a.takenAt ?? "").localeCompare(b.takenAt ?? ""));
  let sort = await nextSort(sailId);
  for (const item of prepared) await item.run(sort++);
  return warnings;
}

export async function addYouTube(sailId: string, link: string, caption: string) {
  const video = parseYouTube(link);
  if (!video) throw new Error("That doesn't look like a YouTube link.");
  check(await db().from("sail_media").insert({ sail_id: sailId, kind: "youtube", url: link.trim(), caption: caption.trim() || null, sort: await nextSort(sailId) }));
}

export async function addLink(sailId: string, link: string, caption: string) {
  let href: URL;
  try {
    href = new URL(link.trim());
  } catch {
    throw new Error("Enter a full link, starting with https://");
  }
  if (!/^https?:$/.test(href.protocol)) throw new Error("Only http(s) links are allowed.");
  check(await db().from("sail_media").insert({ sail_id: sailId, kind: "link", url: href.toString(), caption: caption.trim() || null, sort: await nextSort(sailId) }));
}

export async function updateMedia(id: string, patch: Partial<Pick<MediaRow, "caption" | "sort">>) {
  check(await db().from("sail_media").update(patch).eq("id", id));
}

export async function reorderMedia(items: MediaRow[]) {
  await Promise.all(items.map((m, i) => (m.sort === i ? null : updateMedia(m.id, { sort: i }))));
}

export async function deleteMedia(item: MediaRow) {
  const paths = [item.storage_path, item.thumb_path, item.poster_path].filter((p): p is string => Boolean(p));
  if (paths.length) check(await db().storage.from(MEDIA_BUCKET).remove(paths));
  check(await db().from("sail_media").delete().eq("id", item.id));
}

// --- Boats ------------------------------------------------------------------------------------------

export async function listBoats() {
  return check(await db().from("boats").select("*").order("sort").order("name")) as BoatRow[];
}

export type BoatPatch = Partial<Omit<BoatRow, "id" | "created_at" | "updated_at">>;

export async function saveBoat(id: string | null, patch: BoatPatch) {
  if (patch.slug !== undefined) patch.slug = slugify(patch.slug) || slugify(patch.name ?? "") || "boat";
  if (patch.is_default) {
    // Only one default boat is allowed (unique index), so clear the old one first.
    check(await db().from("boats").update({ is_default: false }).eq("is_default", true).neq("id", id ?? "00000000-0000-0000-0000-000000000000"));
  }
  if (id) return check(await db().from("boats").update(patch).eq("id", id).select("*").single()) as BoatRow;
  return check(await db().from("boats").insert(patch).select("*").single()) as BoatRow;
}

export async function uploadBoatPhoto(boatId: string, file: File, previous: string | null) {
  const photo = await processPhoto(file, BOAT_PHOTO_MAX_PX);
  const path = await upload(`boats/${boatId}/${crypto.randomUUID()}.jpg`, photo.full, "image/jpeg");
  if (previous) await db().storage.from(MEDIA_BUCKET).remove([previous]);
  return saveBoat(boatId, { photo_path: path });
}

export async function deleteBoat(boat: BoatRow) {
  await removeFolder(MEDIA_BUCKET, `boats/${boat.id}`);
  check(await db().from("boats").delete().eq("id", boat.id));
}

// --- Deploy -----------------------------------------------------------------------------------------

export interface DeployRun {
  status: string;
  conclusion: string | null;
  createdAt: string;
  updatedAt: string;
  url: string;
}

/** Latest run of the deploy workflow (public repo, so no token is needed to read it). */
export async function latestDeploy(): Promise<{ latest: DeployRun | null; lastSuccess: DeployRun | null }> {
  const res = await fetch(`https://api.github.com/repos/${DEPLOY.repo}/actions/workflows/${DEPLOY.workflow}/runs?per_page=10`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const json = (await res.json()) as {
    workflow_runs: { status: string; conclusion: string | null; created_at: string; updated_at: string; html_url: string }[];
  };
  const map = (r: (typeof json.workflow_runs)[number]): DeployRun => ({
    status: r.status,
    conclusion: r.conclusion,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    url: r.html_url,
  });
  const runs = json.workflow_runs;
  const success = runs.find((r) => r.status === "completed" && r.conclusion === "success");
  return { latest: runs[0] ? map(runs[0]) : null, lastSuccess: success ? map(success) : null };
}

/** Published sails and boats edited after the given time (not live yet). */
export async function pendingChanges(since: string) {
  const [sails, boats] = await Promise.all([
    db().from("sails").select("id", { count: "exact", head: true }).gt("updated_at", since).not("published_at", "is", null),
    db().from("boats").select("id", { count: "exact", head: true }).gt("updated_at", since),
  ]);
  return (sails.count ?? 0) + (boats.count ?? 0);
}

/** Asks the `publish` edge function to run the GitHub Pages deploy workflow. */
export async function triggerDeploy() {
  const { data, error } = await db().functions.invoke("publish", { body: {} });
  if (error) {
    const context = (error as { context?: Response }).context;
    const detail = context ? await context.text().catch(() => "") : "";
    throw new Error(detail || error.message);
  }
  return data as { ok: boolean };
}
