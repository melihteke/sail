// Renders a static map thumbnail (OSM tiles + speed-coloured track) for every published sail:
//   public/maps/<slug>.webp
// Runs before `npm run build` (prebuild). Each map is keyed by a hash of its track in
// public/maps/maps.json, so unchanged sails are skipped; CI keeps the folder in actions/cache.
//   npx tsx scripts/make-maps.ts [--force]
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { computeStats, type TrackPoint } from "../src/lib/gpx";
import { speedColor } from "../src/lib/units";

const SAILS_DIR = join("src", "content", "sails");
const OUT_DIR = join("public", "maps");
const STAMPS = join(OUT_DIR, "maps.json");
const W = 960;
const H = 540;
const PADDING = 0.14;
const TILE = 256;
const MAX_ZOOM = 17;
const USER_AGENT = "sail.mteke.com logbook thumbnails (+https://github.com/melihteke/sail)";
const force = process.argv.includes("--force");

if (existsSync(".env")) process.loadEnvFile(".env");

type Job = { slug: string; track: TrackPoint[]; maxKn: number };

async function fromSupabase(url: string, key: string): Promise<Job[]> {
  const res = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/sails?select=slug,track,stats&status=eq.published&track=not.is.null`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  const rows = (await res.json()) as { slug: string; track: TrackPoint[]; stats: { maxSpeedKn: number } | null }[];
  return rows.map((r) => ({ slug: r.slug, track: r.track, maxKn: r.stats?.maxSpeedKn ?? Math.max(...r.track.map((p) => p[2])) }));
}

function fromMarkdown(): Job[] {
  if (!existsSync(SAILS_DIR)) return [];
  return readdirSync(SAILS_DIR)
    .filter((d) => statSync(join(SAILS_DIR, d)).isDirectory() && existsSync(join(SAILS_DIR, d, "index.md")))
    .flatMap((slug) => {
      const md = readFileSync(join(SAILS_DIR, slug, "index.md"), "utf8");
      const gpx = join(SAILS_DIR, slug, md.match(/^gpx:\s*["']?([^"'\s#]+)/m)?.[1] ?? "track.gpx");
      if (!existsSync(gpx)) return [];
      const stats = computeStats(readFileSync(gpx, "utf8"));
      return [{ slug, track: stats.track, maxKn: stats.maxSpeedKn }];
    });
}

const project = (lat: number, lon: number, z: number) => {
  const n = TILE * 2 ** z;
  const s = Math.sin((lat * Math.PI) / 180);
  return [((lon + 180) / 360) * n, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n] as const;
};

async function fetchTile(z: number, x: number, y: number) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, { headers: { "User-Agent": USER_AGENT } }).catch(() => null);
    if (res?.ok) return Buffer.from(await res.arrayBuffer());
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
  }
  throw new Error(`tile ${z}/${x}/${y} failed`);
}

async function render({ track, maxKn }: Job, out: string) {
  const lats = track.map((p) => p[0]);
  const lons = track.map((p) => p[1]);
  const [minLat, maxLat, minLon, maxLon] = [Math.min(...lats), Math.max(...lats), Math.min(...lons), Math.max(...lons)];
  let z = MAX_ZOOM;
  for (; z > 1; z--) {
    const [x1, y1] = project(maxLat, minLon, z);
    const [x2, y2] = project(minLat, maxLon, z);
    if (x2 - x1 <= W * (1 - 2 * PADDING) && y2 - y1 <= H * (1 - 2 * PADDING)) break;
  }
  const [ax, ay] = project(maxLat, minLon, z);
  const [bx, by] = project(minLat, maxLon, z);
  const left = Math.round((ax + bx) / 2 - W / 2);
  const top = Math.round((ay + by) / 2 - H / 2);
  const tx0 = Math.floor(left / TILE);
  const ty0 = Math.floor(top / TILE);
  const tx1 = Math.floor((left + W - 1) / TILE);
  const ty1 = Math.floor((top + H - 1) / TILE);

  const jobs: { tx: number; ty: number }[] = [];
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) jobs.push({ tx, ty });
  const tiles: { input: Buffer; left: number; top: number }[] = [];
  // OSM tile policy: keep concurrency low.
  for (let i = 0; i < jobs.length; i += 2) {
    tiles.push(...(await Promise.all(jobs.slice(i, i + 2).map(async ({ tx, ty }) => ({ input: await fetchTile(z, tx, ty), left: (tx - tx0) * TILE, top: (ty - ty0) * TILE })))));
  }
  const mosaic = await sharp({ create: { width: (tx1 - tx0 + 1) * TILE, height: (ty1 - ty0 + 1) * TILE, channels: 4, background: "#aad3df" } })
    .composite(tiles)
    .png()
    .toBuffer();

  const max = Math.max(4, Math.ceil(maxKn));
  const px = track.map((p) => {
    const [x, y] = project(p[0], p[1], z);
    return [+(x - left).toFixed(1), +(y - top).toFixed(1)] as const;
  });
  const STEPS = 14;
  const segments: { color: string; pts: (readonly [number, number])[] }[] = [];
  let run: (readonly [number, number])[] = [px[0]!];
  let bucket = -1;
  for (let i = 0; i < px.length; i++) {
    const b = Math.min(STEPS - 1, Math.floor((track[i]![2] / max) * STEPS));
    if (b !== bucket && run.length > 1) {
      segments.push({ color: speedColor(((bucket + 0.5) / STEPS) * max, max), pts: run });
      run = [run.at(-1)!];
    }
    bucket = b;
    run.push(px[i]!);
  }
  if (run.length > 1) segments.push({ color: speedColor(((bucket + 0.5) / STEPS) * max, max), pts: run });
  const line = (pts: (readonly [number, number])[]) => pts.map(([x, y]) => `${x},${y}`).join(" ");
  const [sx, sy] = px[0]!;
  const [ex, ey] = px.at(-1)!;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<polyline points="${line(px)}" fill="none" stroke="#fff" stroke-opacity="0.85" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
${segments.map((s) => `<polyline points="${line(s.pts)}" fill="none" stroke="${s.color}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`).join("\n")}
<circle cx="${sx}" cy="${sy}" r="7" fill="#16a34a" stroke="#fff" stroke-width="2.5"/>
<circle cx="${ex}" cy="${ey}" r="7" fill="#dc2626" stroke="#fff" stroke-width="2.5"/>
</svg>`;

  await sharp(mosaic)
    .extract({ left: left - tx0 * TILE, top: top - ty0 * TILE, width: W, height: H })
    .composite([{ input: Buffer.from(svg) }])
    .webp({ quality: 80 })
    .toFile(out);
  return { z, tiles: tiles.length };
}

const url = process.env.PUBLIC_SUPABASE_URL;
const key = process.env.PUBLIC_SUPABASE_ANON_KEY;
let jobs: Job[];
try {
  jobs = url && key ? await fromSupabase(url, key) : fromMarkdown();
} catch (error) {
  console.warn(`[maps] could not load sails: ${(error as Error).message} (cards fall back to the track outline)`);
  jobs = [];
}

mkdirSync(OUT_DIR, { recursive: true });
const stamps: Record<string, string> = existsSync(STAMPS) ? JSON.parse(readFileSync(STAMPS, "utf8")) : {};
let made = 0;
let failed = 0;
for (const job of jobs) {
  if (job.track.length < 2) continue;
  const out = join(OUT_DIR, `${job.slug}.webp`);
  const stamp = createHash("sha1").update(JSON.stringify(job.track)).digest("hex").slice(0, 16);
  if (!force && existsSync(out)) {
    // Maps made before stamps existed are kept as they are.
    stamps[job.slug] ??= stamp;
    if (stamps[job.slug] === stamp) continue;
  }
  try {
    const { z, tiles } = await render(job, out);
    stamps[job.slug] = stamp;
    console.log(`[maps] ✓ ${out} (zoom ${z}, ${tiles} tiles)`);
    made++;
  } catch (error) {
    failed++;
    console.warn(`[maps] ✖ ${job.slug}: ${(error as Error).message} (card falls back to the track outline)`);
  }
}
writeFileSync(STAMPS, JSON.stringify(stamps, null, 1) + "\n");
console.log(`[maps] ${jobs.length} sails · ${made} rendered${failed ? ` · ${failed} failed` : ""}`);
