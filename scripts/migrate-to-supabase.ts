// One-off import of the Markdown logbook (src/content/sails + src/data/boat.ts) into Supabase.
// Safe to run more than once: boats and sails are matched by slug and media is replaced.
//
//   $env:SUPABASE_URL = "https://<ref>.supabase.co"
//   $env:SUPABASE_SERVICE_ROLE_KEY = "<service role key>"   # Project Settings → API. Never commit it.
//   npx tsx scripts/migrate-to-supabase.ts [--dry-run]
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { parse as parseYaml } from "yaml";
import { BOAT_DATA as BOAT } from "../src/data/boat-data";
import { analyzeSail } from "../src/lib/analysis";
import { computeStats } from "../src/lib/gpx";
import { splitSections } from "../src/lib/sections";
import { fetchSailWind, summarizeWind, type WindHour } from "../src/lib/wind";

const SAILS_DIR = join("src", "content", "sails");
const dryRun = process.argv.includes("--dry-run");
if (existsSync(".env")) process.loadEnvFile(".env");

const url = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see docs/SETUP.md).");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

function check<T>(res: { data: T; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data;
}

async function upload(bucket: string, path: string, body: Buffer | Blob, contentType: string) {
  if (dryRun) return path;
  check(await db.storage.from(bucket).upload(path, body, { contentType, upsert: true, cacheControl: "31536000" }), `upload ${path}`);
  return path;
}

async function removeFolder(bucket: string, prefix: string) {
  const files = check(await db.storage.from(bucket).list(prefix, { limit: 1000 }), `list ${prefix}`) as { name: string }[];
  if (files.length && !dryRun) check(await db.storage.from(bucket).remove(files.map((f) => `${prefix}/${f.name}`)), `remove ${prefix}`);
}

// --- Boat ---------------------------------------------------------------------------------------------

async function migrateBoat() {
  const description = `${BOAT.description}\n\n<small>Specifications are class figures; individual boats vary by build year and fit-out. Sources: ${BOAT.sources
    .map((s) => `[${s.label}](${s.url})`)
    .join(", ")}.</small>`;
  const fields = {
    slug: "polyvalk",
    name: BOAT.name,
    model: BOAT.model,
    builder: BOAT.builder,
    builder_url: BOAT.builderUrl,
    designer: BOAT.designer,
    design_year: BOAT.designYear,
    sail_number: BOAT.sailNumber ?? null,
    home_water: BOAT.homePort,
    description,
    specs: BOAT.specs,
    photo_credit: BOAT.photoCredit ?? null,
    is_default: true,
  };
  if (dryRun) {
    console.log(`[boat] would upsert ${fields.slug}`);
    return "dry-run-boat";
  }
  const boat = check(await db.from("boats").upsert(fields, { onConflict: "slug" }).select("id").single(), "boat") as { id: string };
  const photo = join("src", "assets", "boat", "polyvalk.jpg");
  if (existsSync(photo)) {
    const jpg = await sharp(readFileSync(photo)).rotate().resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
    const path = await upload("media", `boats/${boat.id}/polyvalk.jpg`, jpg, "image/jpeg");
    check(await db.from("boats").update({ photo_path: path }).eq("id", boat.id), "boat photo");
  }
  console.log(`[boat] ✓ ${fields.name}`);
  return boat.id;
}

// --- Sails --------------------------------------------------------------------------------------------

const windCache = JSON.parse(readFileSync(join("src", "data", "wind-cache.json"), "utf8")) as Record<string, WindHour[]>;

async function windFor(lat: number, lon: number, start: string, end: string) {
  const cached = windCache[`${lat.toFixed(2)},${lon.toFixed(2)},${start.slice(0, 10)}`];
  if (cached && start.slice(0, 10) === end.slice(0, 10)) {
    const from = Math.floor(Date.parse(start) / 3600_000) * 3600_000;
    const to = Math.ceil(Date.parse(end) / 3600_000) * 3600_000;
    return summarizeWind(cached.filter((h) => Date.parse(h.time) >= from && Date.parse(h.time) <= to));
  }
  return fetchSailWind(lat, lon, start, end);
}

interface Frontmatter {
  title: string;
  date: string | Date;
  gpx?: string;
  location?: string;
  summary?: string;
  crew?: string[];
  role?: string;
  rating?: number;
  sails?: string;
  reef?: boolean;
  tags?: string[];
  captions?: Record<string, string>;
  youtube?: (string | { url: string; caption?: string })[];
  draft?: boolean;
}

function readEntry(dir: string) {
  const raw = readFileSync(join(dir, "index.md"), "utf8").replace(/\r\n/g, "\n");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${dir}/index.md has no frontmatter`);
  return { data: parseYaml(match[1]!) as Frontmatter, body: match[2]! };
}

async function migrateSail(slug: string, boatId: string) {
  const dir = join(SAILS_DIR, slug);
  const { data, body } = readEntry(dir);
  const xml = readFileSync(join(dir, data.gpx ?? "track.gpx"), "utf8");
  const { track, ...stats } = computeStats(xml);
  const wind = await windFor(stats.startPoint.lat, stats.startPoint.lon, stats.start, stats.end);
  const analysis = analyzeSail(track, wind, stats.start);
  const sections = splitSections(body);
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date);

  const fields = {
    slug,
    status: data.draft ? "draft" : "published",
    title: data.title,
    date,
    location: data.location ?? "",
    summary: data.summary ?? "",
    boat_id: boatId,
    role: data.role ?? "helm",
    crew: data.crew ?? [],
    rating: data.rating ?? 3,
    sails_used: data.sails ?? null,
    reef: data.reef ?? false,
    tags: data.tags ?? [],
    how_it_went: sections.howItWent,
    what_i_practised: sections.whatIPractised,
    learnings: sections.learnings,
    notes: sections.notes,
    stats,
    track,
    wind,
    analysis,
  };
  if (dryRun) {
    console.log(`[sail] would upsert ${slug}: ${fields.status}, ${stats.distanceNm.toFixed(1)} nm, ${analysis?.tacks ?? "?"} tacks, sections: ${Object.entries(sections).filter(([, v]) => v).map(([k]) => k).join(", ")}`);
    return;
  }
  const sail = check(await db.from("sails").upsert(fields, { onConflict: "slug" }).select("id").single(), `sail ${slug}`) as { id: string };
  const gpxPath = await upload("gpx", `${sail.id}/track.gpx`, Buffer.from(xml), "application/gpx+xml");
  check(await db.from("sails").update({ gpx_path: gpxPath, cover_media_id: null }).eq("id", sail.id), "gpx path");

  // Media: start clean so re-runs don't duplicate.
  check(await db.from("sail_media").delete().eq("sail_id", sail.id), "clear media");
  await removeFolder("media", `sails/${sail.id}`);
  const rows: Record<string, unknown>[] = [];
  for (const y of data.youtube ?? []) {
    const item = typeof y === "string" ? { url: y } : y;
    rows.push({ kind: "youtube", url: item.url, caption: item.caption ?? null });
  }
  const files = ["photos", "videos"].flatMap((sub) =>
    existsSync(join(dir, sub)) ? readdirSync(join(dir, sub)).map((f) => ({ sub, file: f, path: join(dir, sub, f) })) : [],
  );
  files.sort((a, b) => a.file.localeCompare(b.file, undefined, { numeric: true }));
  for (const f of files) {
    const ext = extname(f.file).toLowerCase();
    const stem = basename(f.file, ext);
    const caption = data.captions?.[f.file] ?? null;
    if (f.sub === "photos" && /\.(jpe?g|png|webp)$/.test(ext)) {
      const img = sharp(readFileSync(f.path)).rotate();
      const meta = await img.metadata();
      const full = await img.clone().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
      const thumb = await img.clone().resize({ width: 960, height: 960, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
      const base = `sails/${sail.id}/${stem}`;
      rows.push({
        kind: "photo",
        storage_path: await upload("media", `${base}.jpg`, full, "image/jpeg"),
        thumb_path: await upload("media", `${base}_thumb.jpg`, thumb, "image/jpeg"),
        width: meta.width,
        height: meta.height,
        caption,
      });
    } else if (f.sub === "videos" && /\.(mp4|webm)$/.test(ext)) {
      const poster = join(dir, "videos", `${stem}.jpg`);
      const meta = existsSync(poster) ? await sharp(poster).metadata() : null;
      rows.push({
        kind: "video",
        storage_path: await upload("media", `sails/${sail.id}/${f.file}`, readFileSync(f.path), ext === ".webm" ? "video/webm" : "video/mp4"),
        poster_path: existsSync(poster) ? await upload("media", `sails/${sail.id}/${stem}_poster.jpg`, readFileSync(poster), "image/jpeg") : null,
        width: meta?.width ?? null,
        height: meta?.height ?? null,
        caption,
      });
    }
  }
  if (rows.length) check(await db.from("sail_media").insert(rows.map((r, i) => ({ ...r, sail_id: sail.id, sort: i }))), "media");
  console.log(`[sail] ✓ ${slug} (${fields.status}, ${rows.length} media)`);
}

const boatId = await migrateBoat();
const slugs = existsSync(SAILS_DIR) ? readdirSync(SAILS_DIR).filter((d) => statSync(join(SAILS_DIR, d)).isDirectory() && existsSync(join(SAILS_DIR, d, "index.md"))) : [];
for (const slug of slugs) await migrateSail(slug, boatId);
console.log(dryRun ? "Dry run finished; nothing was written." : `Done: ${slugs.length} sails imported. Next: deploy the site (admin → Deploy site, or push to main).`);
