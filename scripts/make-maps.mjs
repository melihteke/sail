#!/usr/bin/env node
// Render a static map thumbnail (OSM tiles + speed-coloured track) for every sail:
//   public/maps/<sail>.webp
// Runs automatically before `npm run build` (prebuild). Existing, up-to-date maps are skipped,
// so commit the generated files and CI never needs to download tiles.
//   node scripts/make-maps.mjs [--force]
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { XMLParser } from "fast-xml-parser";
import sharp from "sharp";

const SAILS_DIR = join("src", "content", "sails");
const OUT_DIR = join("public", "maps");
const W = 960;
const H = 540;
const PADDING = 0.14;
const TILE = 256;
const MAX_ZOOM = 17;
const TILE_URL = (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
const USER_AGENT = "sail.mteke.com logbook thumbnails (+https://github.com/melihteke/sail)";
const force = process.argv.includes("--force");

// --- GPX + speed (mirrors src/lib/gpx.ts: speed over a ±5 s window) ---
function parsePoints(xml) {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "", isArray: (t) => ["trk", "trkseg", "trkpt"].includes(t) });
  const points = [];
  for (const trk of parser.parse(xml)?.gpx?.trk ?? [])
    for (const seg of trk.trkseg ?? [])
      for (const p of seg.trkpt ?? []) {
        const lat = Number(p.lat), lon = Number(p.lon), t = Date.parse(p.time);
        if (Number.isFinite(lat) && Number.isFinite(lon)) points.push({ lat, lon, t });
      }
  return points.sort((a, b) => a.t - b.t);
}

function haversine(a, b) {
  const r = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.sqrt(h));
}

function speedsKn(points) {
  const out = new Array(points.length).fill(0);
  let lo = 0, hi = 0;
  for (let i = 0; i < points.length; i++) {
    const t = points[i].t;
    while (points[lo].t < t - 5000) lo++;
    while (hi + 1 < points.length && points[hi + 1].t <= t + 5000) hi++;
    const dt = (points[hi].t - points[lo].t) / 1000;
    if (!(dt > 0)) continue;
    let d = 0;
    for (let j = lo + 1; j <= hi; j++) d += haversine(points[j - 1], points[j]);
    out[i] = (d / dt) * (3600 / 1852);
  }
  return out;
}

// Same ramp as speedColor() in src/lib/units.ts
const speedColor = (kn, max) => `hsl(${(230 - Math.max(0, Math.min(1, kn / max)) * 230).toFixed(0)} 85% 48%)`;

// --- Web Mercator ---
const project = (lat, lon, z) => {
  const n = TILE * 2 ** z;
  const s = Math.sin((lat * Math.PI) / 180);
  return [((lon + 180) / 360) * n, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n];
};

async function fetchTile(z, x, y) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(TILE_URL(z, x, y), { headers: { "User-Agent": USER_AGENT } }).catch(() => null);
    if (res?.ok) return Buffer.from(await res.arrayBuffer());
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
  }
  throw new Error(`tile ${z}/${x}/${y} failed`);
}

async function renderMap(points, out) {
  const lats = points.map((p) => p.lat), lons = points.map((p) => p.lon);
  const [minLat, maxLat, minLon, maxLon] = [Math.min(...lats), Math.max(...lats), Math.min(...lons), Math.max(...lons)];
  let z = MAX_ZOOM;
  for (; z > 1; z--) {
    const [x1, y1] = project(maxLat, minLon, z), [x2, y2] = project(minLat, maxLon, z);
    if (x2 - x1 <= W * (1 - 2 * PADDING) && y2 - y1 <= H * (1 - 2 * PADDING)) break;
  }
  const [ax, ay] = project(maxLat, minLon, z), [bx, by] = project(minLat, maxLon, z);
  const left = Math.round((ax + bx) / 2 - W / 2);
  const top = Math.round((ay + by) / 2 - H / 2);
  const tx0 = Math.floor(left / TILE), ty0 = Math.floor(top / TILE);
  const tx1 = Math.floor((left + W - 1) / TILE), ty1 = Math.floor((top + H - 1) / TILE);

  const jobs = [];
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) jobs.push({ tx, ty });
  const tiles = [];
  // OSM tile policy: keep concurrency low.
  for (let i = 0; i < jobs.length; i += 2) {
    const batch = await Promise.all(jobs.slice(i, i + 2).map(async ({ tx, ty }) => ({ input: await fetchTile(z, tx, ty), left: (tx - tx0) * TILE, top: (ty - ty0) * TILE })));
    tiles.push(...batch);
  }
  const mosaic = await sharp({ create: { width: (tx1 - tx0 + 1) * TILE, height: (ty1 - ty0 + 1) * TILE, channels: 4, background: "#aad3df" } })
    .composite(tiles)
    .png()
    .toBuffer();

  const speeds = speedsKn(points);
  const max = Math.max(4, Math.ceil(Math.max(...speeds)));
  const px = points.map((p) => {
    const [x, y] = project(p.lat, p.lon, z);
    return [+(x - left).toFixed(1), +(y - top).toFixed(1)];
  });
  const all = px.map(([x, y]) => `${x},${y}`).join(" ");
  const segments = [];
  const STEPS = 14;
  let run = [px[0]], bucket = -1;
  for (let i = 0; i < px.length; i++) {
    const b = Math.min(STEPS - 1, Math.floor((speeds[i] / max) * STEPS));
    if (b !== bucket && run.length > 1) {
      segments.push({ color: speedColor(((bucket + 0.5) / STEPS) * max, max), pts: run });
      run = [run.at(-1)];
    }
    bucket = b;
    run.push(px[i]);
  }
  if (run.length > 1) segments.push({ color: speedColor(((bucket + 0.5) / STEPS) * max, max), pts: run });
  const [sx, sy] = px[0], [ex, ey] = px.at(-1);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<polyline points="${all}" fill="none" stroke="#fff" stroke-opacity="0.85" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
${segments.map((s) => `<polyline points="${s.pts.map(([x, y]) => `${x},${y}`).join(" ")}" fill="none" stroke="${s.color}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`).join("\n")}
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

mkdirSync(OUT_DIR, { recursive: true });
let made = 0, failed = 0;
for (const sail of readdirSync(SAILS_DIR)) {
  const dir = join(SAILS_DIR, sail);
  const index = join(dir, "index.md");
  if (!statSync(dir).isDirectory() || !existsSync(index)) continue;
  const gpxName = readFileSync(index, "utf8").match(/^gpx:\s*["']?([^"'\s#]+)/m)?.[1] ?? "track.gpx";
  const gpx = join(dir, gpxName);
  const out = join(OUT_DIR, `${sail}.webp`);
  if (!existsSync(gpx)) continue;
  // In CI, checkout timestamps are meaningless: reuse committed maps instead of re-downloading tiles.
  const upToDate = existsSync(out) && (process.env.CI || statSync(out).mtimeMs >= statSync(gpx).mtimeMs);
  if (!force && upToDate) continue;
  try {
    const points = parsePoints(readFileSync(gpx, "utf8"));
    if (points.length < 2) throw new Error("not enough track points");
    const { z, tiles } = await renderMap(points, out);
    console.log(`[maps] ✓ ${out} (zoom ${z}, ${tiles} tiles)`);
    made++;
  } catch (error) {
    failed++;
    console.warn(`[maps] ✖ ${sail}: ${error.message} (card falls back to the track outline)`);
  }
}
if (made || failed) console.log(`[maps] ${made} rendered${failed ? `, ${failed} failed` : ""}`);
