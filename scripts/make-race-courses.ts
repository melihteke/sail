/**
 * Builds the race courses from real OpenStreetMap data.
 *
 *   npx tsx scripts/make-race-courses.ts            (all courses)
 *   ONLY=bodrum npx tsx scripts/make-race-courses.ts (one course, for testing; does not write files)
 *
 * Lakes use the OSM water polygons (simplified and clipped). Sea areas have no water polygon in OSM, so
 * a 10 m land/water grid is classified from the OpenStreetMap standard map tiles instead. Then the
 * position, wind direction and leg length are searched where the course fits with room to spare, and
 * every course is sailed once by the autopilot. Writes src/academy/games/race/courses.json and the
 * Supabase seed migration.
 */
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { botRace } from "../src/academy/games/race/bot";
import { initialState, landProbe, q, step, type CourseData, type CourseLeg, type CourseObject, type XY } from "../src/academy/games/race/sim";

interface Spec {
  id: string;
  name: string;
  area: string;
  type: CourseData["type"];
  /** Lakes: an OSM water element used to centre the area. Seas: use `center` and source "tiles". */
  source: "osm" | "tiles";
  main?: string;
  center?: [number, number];
  /** Half size of the race area (m). */
  half: number;
  /** Prevailing wind (from, deg), allowed deviation (deg) and mean speed (kn). */
  wind: [number, number, number];
  /** Longest windward leg to try (m). */
  maxLeg: number;
  simplify: number;
}

const ONLY = process.env.ONLY;
const SPECS: Spec[] = [
  { id: "grote-poel", name: "De Grote Poel", area: "Amstelveen, NL", type: "windward-leeward", source: "osm", main: "relation/1159460", half: 750, wind: [225, 40, 11], maxLeg: 650, simplify: 4 },
  { id: "westeinder", name: "Westeinderplassen", area: "Aalsmeer, NL", type: "windward-leeward", source: "osm", main: "relation/1102901", half: 1000, wind: [240, 35, 13], maxLeg: 700, simplify: 7 },
  { id: "loosdrecht", name: "Loosdrechtse Plassen", area: "Loosdrecht, NL", type: "windward-leeward", source: "osm", main: "relation/1306728", half: 1000, wind: [250, 35, 12], maxLeg: 700, simplify: 7 },
  { id: "sneekermeer", name: "Sneekermeer", area: "Friesland, NL", type: "windward-leeward", source: "osm", main: "relation/1948725", half: 1000, wind: [230, 35, 14], maxLeg: 700, simplify: 7 },
  { id: "braassemermeer", name: "Braassemermeer", area: "Roelofarendsveen, NL", type: "windward-leeward", source: "osm", main: "relation/1102571", half: 1000, wind: [220, 35, 12], maxLeg: 700, simplify: 7 },
  { id: "garda", name: "Lago di Garda", area: "Riva del Garda, IT", type: "windward-leeward", source: "osm", main: "relation/8569", center: [45.855, 10.865], half: 1100, wind: [195, 25, 16], maxLeg: 650, simplify: 8 },
  { id: "marmaris", name: "Marmaris", area: "Muğla, TR", type: "triangle", source: "tiles", center: [36.842, 28.262], half: 1200, wind: [215, 30, 14], maxLeg: 650, simplify: 0 },
  { id: "bodrum", name: "Bodrum", area: "Muğla, TR", type: "triangle", source: "tiles", center: [37.022, 27.425], half: 1200, wind: [345, 25, 17], maxLeg: 650, simplify: 0 },
  { id: "cowes", name: "Cowes", area: "Isle of Wight, UK", type: "windward-leeward", source: "tiles", center: [50.782, -1.29], half: 1200, wind: [235, 30, 15], maxLeg: 650, simplify: 0 },
  { id: "kiel", name: "Kiel", area: "Schleswig-Holstein, DE", type: "windward-leeward", source: "tiles", center: [54.405, 10.205], half: 1200, wind: [265, 30, 13], maxLeg: 650, simplify: 0 },
  { id: "porto-cervo", name: "Porto Cervo", area: "Sardinia, IT", type: "triangle", source: "tiles", center: [41.135, 9.555], half: 1200, wind: [305, 25, 16], maxLeg: 650, simplify: 0 },
  { id: "sydney", name: "Sydney Harbour", area: "Sydney, AU", type: "windward-leeward", source: "tiles", center: [-33.848, 151.255], half: 1200, wind: [45, 30, 14], maxLeg: 600, simplify: 0 },
];

type LL = { lat: number; lon: number };
const OVERPASS = "https://overpass-api.de/api/interpreter";

async function overpass(query: string): Promise<any> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(OVERPASS, {
      method: "POST",
      body: "data=" + encodeURIComponent(query),
      headers: { "User-Agent": "sail.mteke.com race course builder", "Content-Type": "application/x-www-form-urlencoded" },
    }).catch(() => null);
    if (!res) {
      await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
      continue;
    }
    if (res.ok) return res.json();
    await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
  }
  throw new Error("Overpass failed");
}



/** Joins way geometries into closed rings. */
function assemble(parts: LL[][]): LL[][] {
  const key = (p: LL) => `${p.lat.toFixed(7)},${p.lon.toFixed(7)}`;
  const open = parts.filter((p) => p.length > 1).map((p) => [...p]);
  const rings: LL[][] = [];
  while (open.length) {
    let ring = open.shift()!;
    let guard = 0;
    while (key(ring[0]) !== key(ring[ring.length - 1]) && guard++ < 10000) {
      const end = key(ring[ring.length - 1]);
      const i = open.findIndex((p) => key(p[0]) === end || key(p[p.length - 1]) === end);
      if (i < 0) break;
      const next = open.splice(i, 1)[0]!;
      if (key(next[0]) !== end) next.reverse();
      ring = ring.concat(next.slice(1));
    }
    if (key(ring[0]) === key(ring[ring.length - 1]) && ring.length >= 4) rings.push(ring.slice(0, -1));
  }
  return rings;
}

function elementRings(e: any): LL[][] {
  if (e.type === "way") return e.geometry ? assemble([e.geometry]) : [];
  return assemble((e.members ?? []).filter((m: any) => m.type === "way" && m.geometry).map((m: any) => m.geometry));
}

function douglasPeucker(pts: XY[], tol: number): XY[] {
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const [ax, ay] = pts[a]!;
    const [bx, by] = pts[b]!;
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    let best = -1;
    let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((pts[i]![0] - ax) * dy - (pts[i]![1] - ay) * dx) / len;
      if (d > best) {
        best = d;
        idx = i;
      }
    }
    if (best > tol) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

function simplifyRing(ring: XY[], tol: number): XY[] {
  // Split the closed ring at its farthest point pair so both halves simplify well.
  const half = Math.floor(ring.length / 2);
  const a = douglasPeucker(ring.slice(0, half + 1), tol);
  const b = douglasPeucker([...ring.slice(half), ring[0]!], tol);
  return [...a.slice(0, -1), ...b.slice(0, -1)];
}

/** Sutherland–Hodgman clip of a ring to an axis-aligned box. */
function clip(ring: XY[], [x0, y0, x1, y1]: [number, number, number, number]): XY[] {
  const edges: [(p: XY) => boolean, (a: XY, b: XY) => XY][] = [
    [(p) => p[0] >= x0, (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= y0, (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0]],
    [(p) => p[1] <= y1, (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]],
  ];
  let out = ring;
  for (const [inside, cut] of edges) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i]!;
      const prev = input[(i + input.length - 1) % input.length]!;
      if (inside(cur)) {
        if (!inside(prev)) out.push(cut(prev, cur));
        out.push(cur);
      } else if (inside(prev)) out.push(cut(prev, cur));
    }
    if (!out.length) break;
  }
  return out;
}

function ringArea(r: XY[]) {
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j]![0] + r[i]![0]) * (r[j]![1] - r[i]![1]);
  return Math.abs(a / 2);
}

/** Deterministic pseudo-random numbers from the course id. */
function rng(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const r3 = (v: number) => q(v, 1000);
const p3 = (p: XY): XY => [r3(p[0]), r3(p[1])];

const CELL = 10;
const COARSE = 4;
const TILE_ZOOM = 15;
const tileDir = join(tmpdir(), "sail-race-tiles");

/** Raw RGB pixels of an OpenStreetMap standard tile (cached on disk, polite user agent). */
async function tile(z: number, x: number, y: number): Promise<Buffer> {
  mkdirSync(tileDir, { recursive: true });
  const file = join(tileDir, `${z}-${x}-${y}.png`);
  if (!existsSync(file)) {
    const res = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, { headers: { "User-Agent": "sail.mteke.com race course builder (one-off)" } });
    if (!res.ok) throw new Error(`tile ${z}/${x}/${y}: ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    await new Promise((r) => setTimeout(r, 250));
  }
  return sharp(readFileSync(file)).removeAlpha().raw().toBuffer();
}

/** Water is drawn in light blue on the standard map; land, roads and buildings are not. */
const isWater = (r: number, g: number, b: number) => b - r >= 25 && b >= g - 10;

/** Land/water grid for a sea area: true = water. Cleans up map symbols and isolated pools. */
async function seaGrid(center: LL, h: number): Promise<{ water: Uint8Array; n: number }> {
  const n = Math.floor((2 * h) / CELL);
  const kx = 111320 * Math.cos((center.lat * Math.PI) / 180);
  const world = 256 * 2 ** TILE_ZOOM;
  const pixel = (lat: number, lon: number) => {
    const r = (lat * Math.PI) / 180;
    return [((lon + 180) / 360) * world, ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * world] as const;
  };
  const tiles = new Map<string, Buffer>();
  const water = new Uint8Array(n * n);
  for (let iy = 0; iy < n; iy++)
    for (let ix = 0; ix < n; ix++) {
      const x = -h + (ix + 0.5) * CELL;
      const y = -h + (iy + 0.5) * CELL;
      const [px, py] = pixel(center.lat + y / 111320, center.lon + x / kx);
      let votes = 0;
      for (const [dx, dy] of [[0, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const gx = Math.floor(px + dx!);
        const gy = Math.floor(py + dy!);
        const tx = Math.floor(gx / 256);
        const ty = Math.floor(gy / 256);
        const key = `${tx}/${ty}`;
        if (!tiles.has(key)) tiles.set(key, await tile(TILE_ZOOM, tx, ty));
        const buf = tiles.get(key)!;
        const o = ((gy - ty * 256) * 256 + (gx - tx * 256)) * 3;
        if (isWater(buf[o]!, buf[o + 1]!, buf[o + 2]!)) votes++;
      }
      water[iy * n + ix] = votes >= 3 ? 1 : 0;
    }

  // Connected components: drop small land specks (labels, ferry lines) and water not linked to the main body.
  const label = (target: number, diagonal: boolean) => {
    const comp = new Int32Array(n * n).fill(-1);
    const sizes: number[] = [];
    const nb = diagonal ? [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let i = 0; i < n * n; i++) {
      if (water[i] !== target || comp[i] >= 0) continue;
      const id = sizes.length;
      let size = 0;
      const stack = [i];
      comp[i] = id;
      while (stack.length) {
        const j = stack.pop()!;
        size++;
        const jx = j % n;
        const jy = (j - jx) / n;
        for (const [dx, dy] of nb) {
          const kx2 = jx + dx!;
          const ky2 = jy + dy!;
          if (kx2 < 0 || ky2 < 0 || kx2 >= n || ky2 >= n) continue;
          const k = ky2 * n + kx2;
          if (water[k] === target && comp[k] < 0) {
            comp[k] = id;
            stack.push(k);
          }
        }
      }
      sizes.push(size);
    }
    return { comp, sizes };
  };
  const land = label(0, true);
  // Real land has an inside; thin lines on the map (boundaries, ferry routes, piers' outlines) do not.
  const core = new Array<number>(land.sizes.length).fill(0);
  for (let i = 0; i < n * n; i++) {
    if (water[i] !== 0) continue;
    const ix = i % n;
    const iy = (i - ix) / n;
    let inside = true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2]]) {
      const jx = ix + dx!;
      const jy = iy + dy!;
      if (jx >= 0 && jy >= 0 && jx < n && jy < n && water[jy * n + jx] !== 0) inside = false;
    }
    if (inside) core[land.comp[i]!]!++;
  }
  for (let i = 0; i < n * n; i++) {
    if (water[i] !== 0) continue;
    const k = land.comp[i]!;
    if (land.sizes[k]! < 40 || core[k]! < Math.max(6, land.sizes[k]! * 0.08)) water[i] = 1;
  }  const sea = label(1, false);
  const main = sea.sizes.indexOf(Math.max(...sea.sizes));
  for (let i = 0; i < n * n; i++) if (water[i] === 1 && sea.comp[i] !== main) water[i] = 0;
  return { water, n };
}

/** Chebyshev distance (in cells) from every cell to the nearest land cell, capped at 255. */
function landDistance(water: Uint8Array, n: number): Uint8Array {
  const d = new Uint8Array(n * n).fill(255);
  let frontier: number[] = [];
  for (let i = 0; i < n * n; i++)
    if (!water[i]) {
      d[i] = 0;
      frontier.push(i);
    }
  for (let step = 1; frontier.length && step < 255; step++) {
    const next: number[] = [];
    for (const j of frontier) {
      const jx = j % n;
      const jy = (j - jx) / n;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const kx2 = jx + dx;
          const ky2 = jy + dy;
          if (kx2 < 0 || ky2 < 0 || kx2 >= n || ky2 >= n) continue;
          const k = ky2 * n + kx2;
          if (d[k]! > step) {
            d[k] = step;
            next.push(k);
          }
        }
    }
    frontier = next;
  }
  return d;
}

const unit = (v: XY): XY => {
  const l = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / l, v[1] / l];
};

async function build(spec: Spec) {
  let center: LL;
  if (spec.center) center = { lat: spec.center[0], lon: spec.center[1] };
  else {
    const [type, id] = spec.main!.split("/");
    const main = (await overpass(`[out:json][timeout:120];${type}(${id});out bb;`)).elements[0];
    center = { lat: (main.bounds.minlat + main.bounds.maxlat) / 2, lon: (main.bounds.minlon + main.bounds.maxlon) / 2 };
  }
  const kx = 111320 * Math.cos((center.lat * Math.PI) / 180);
  const toXY = (p: LL): XY => [(p.lon - center.lon) * kx, (p.lat - center.lat) * 111320];
  const h = spec.half;
  const box: [number, number, number, number] = [-h, -h, h, h];

  const course: CourseData = {
    id: spec.id,
    type: spec.type,
    origin: { lat: center.lat, lon: center.lon },
    bounds: [-h + 1, -h + 1, h - 1, h - 1],
    water: [],
    land: [],
    wind: { dir: spec.wind[0], speed: spec.wind[2], shifts: [], spatialAmp: 0, spatialWave: 1, gust: [0, 1, 0], puff: [0, 1, 1, 1, 0] },
    start: { committee: [0, 0], pin: [0, 0] },
    legs: [],
    objects: [],
    preSign: 1,
    boat: { x: 0, y: 0, heading: 0 },
    legM: 0,
  };

  const n = Math.floor((2 * h) / CELL);
  const clear = new Float32Array(n * n);
  let water: XY[][][] = [];
  let land: XY[][] = [];
  if (spec.source === "tiles") {
    const grid = await seaGrid(center, h);
    const dist = landDistance(grid.water, n);
    const bits = new Uint8Array(Math.ceil((n * n) / 8));
    for (let i = 0; i < n * n; i++) if (grid.water[i]) bits[i >> 3]! |= 1 << (i & 7);
    const cn = Math.ceil(n / COARSE);
    const coarse = new Uint8Array(cn * cn).fill(255);
    for (let iy = 0; iy < n; iy++)
      for (let ix = 0; ix < n; ix++) {
        const k = Math.floor(iy / COARSE) * cn + Math.floor(ix / COARSE);
        coarse[k] = Math.min(coarse[k]!, dist[iy * n + ix]!);
      }
    course.mask = { x0: -h, y0: -h, cell: CELL, nx: n, ny: n, bits: Buffer.from(bits).toString("base64"), coarse: COARSE, dist: Buffer.from(coarse).toString("base64") };
    for (let i = 0; i < n * n; i++) {
      const ix = i % n;
      const iy = (i - ix) / n;
      const edge = Math.min(ix, iy, n - 1 - ix, n - 1 - iy) * CELL;
      clear[i] = grid.water[i] ? Math.min(Math.max(0, dist[i]! - 1) * CELL, edge) : -1;
    }
  } else {
    const s = center.lat - h / 111320;
    const nn = center.lat + h / 111320;
    const w = center.lon - h / kx;
    const e = center.lon + h / kx;
    await new Promise((r) => setTimeout(r, 1500));
    const all = await overpass(
      `[out:json][timeout:180];(way["natural"="water"](${s},${w},${nn},${e});relation["natural"="water"](${s},${w},${nn},${e});way["waterway"="riverbank"](${s},${w},${nn},${e});way["place"~"^(island|islet)$"](${s},${w},${nn},${e});relation["place"~"^(island|islet)$"](${s},${w},${nn},${e}););out geom;`,
    );
    const prep = (ring: LL[]) => {
      const xy = simplifyRing(ring.map(toXY), spec.simplify);
      const clipped = clip(xy, box).map(p3);
      return clipped.length >= 3 && ringArea(clipped) > 200 ? clipped : null;
    };
    for (const el of all.elements) {
      const rings = elementRings(el).map(prep).filter((r): r is XY[] => !!r);
      if (!rings.length) continue;
      if (el.tags?.place) land.push(...rings.filter((r) => ringArea(r) > 400));
      else water.push(rings);
    }
    course.water = water;
    course.land = land;
    for (let iy = 0; iy < n; iy++)
      for (let ix = 0; ix < n; ix++) {
        const x = -h + (ix + 0.5) * CELL;
        const y = -h + (iy + 0.5) * CELL;
        const p = landProbe(course, x, y);
        clear[iy * n + ix] = p.water ? Math.min(p.dist, h - Math.abs(x), h - Math.abs(y)) : -1;
      }
  }
  const clearance = (p: XY) => {
    const ix = Math.floor((p[0] + h) / CELL);
    const iy = Math.floor((p[1] + h) / CELL);
    if (ix < 0 || iy < 0 || ix >= n || iy >= n) return -1;
    return clear[iy * n + ix]!;
  };

  /** Course geometry for a wind direction, windward leg length and start-line centre. */
  const layout = (dir: number, L: number, c0: XY) => {
    const a = (dir * Math.PI) / 180;
    const u: XY = [Math.sin(a), Math.cos(a)];
    const r: XY = [Math.cos(a), -Math.sin(a)];
    const at = (du: number, dr: number): XY => [c0[0] + u[0] * du + r[0] * dr, c0[1] + u[1] * du + r[1] * dr];
    const startLen = Math.max(70, 0.22 * L);
    const finishLen = Math.max(45, 0.12 * L);
    const committee = at(0, startLen / 2);
    const pin = at(0, -startLen / 2);
    const finishBoat = at(0.35 * L, finishLen / 2 + 0.05 * L);
    const finishPin = at(0.35 * L, -finishLen / 2 + 0.05 * L);
    type Pt = { label: string; at: XY; color: string };
    let marks: Pt[];
    let gate: { a: XY; b: XY } | null = null;
    if (spec.type === "triangle") {
      marks = [
        { label: "1", at: at(L, 0), color: "#f97316" },
        { label: "2", at: at(L / 2, -L / 2), color: "#f97316" },
        { label: "3", at: at(-0.1 * L, 0), color: "#f97316" },
      ];
    } else {
      const g = Math.max(45, 0.08 * L);
      marks = [
        { label: "1", at: at(L, 0), color: "#f97316" },
        { label: "1a", at: at(L - 12, -Math.max(40, 0.08 * L)), color: "#facc15" },
      ];
      gate = { a: at(-0.12 * L, -g / 2), b: at(-0.12 * L, g / 2) };
    }
    // Route points in sailing order, for the clearance checks.
    const route: XY[] = [at(0, 0), ...marks.map((m) => m.at), ...(gate ? [[(gate.a[0] + gate.b[0]) / 2, (gate.a[1] + gate.b[1]) / 2] as XY] : []), at(0.35 * L, 0.05 * L)];
    const checks: XY[] = [];
    for (let i = 0; i + 1 < route.length; i++) {
      const [p0, p1] = [route[i]!, route[i + 1]!];
      const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
      const d = unit([p1[0] - p0[0], p1[1] - p0[1]]);
      const upwind = d[0] * u[0] + d[1] * u[1] > 0.5;
      const spread = upwind ? 0.3 : 0.08;
      for (let f = 0; f <= 1.0001; f += 25 / Math.max(25, len)) {
        const base: XY = [p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f];
        checks.push(base);
        if (f > 0.2 && f < 0.85) {
          const lat = spread * len * Math.min(f, 1 - f) * 2;
          checks.push([base[0] + r[0] * lat, base[1] + r[1] * lat], [base[0] - r[0] * lat, base[1] - r[1] * lat]);
        }
      }
    }
    for (const m of marks) checks.push([m.at[0] + u[0] * 25, m.at[1] + u[1] * 25], [m.at[0] - r[0] * 25, m.at[1] - r[1] * 25], [m.at[0] + r[0] * 25, m.at[1] + r[1] * 25]);
    checks.push(at(0, startLen / 2 + 25), at(0, -startLen / 2 - 25), at(-90, 0));
    const objectsAt: XY[] = [committee, pin, finishBoat, finishPin, ...marks.map((m) => m.at), ...(gate ? [gate.a, gate.b] : [])];
    return { u, r, at, committee, pin, finishBoat, finishPin, marks, gate, checks, objectsAt, boat: at(-55, 0) };
  };

  let best: { score: number; dir: number; L: number; c0: XY } | null = null;
  const [pref, dev] = spec.wind;
  for (let L = spec.maxLeg; L >= 250 && !best; L -= 50) {
    for (let d = -dev; d <= dev; d += 5) {
      const dir = (pref + d + 360) % 360;
      for (let cy = -h + 60; cy <= h - 60; cy += 20)
        for (let cx = -h + 60; cx <= h - 60; cx += 20) {
          const lay = layout(dir, L, [cx, cy]);
          let min = Infinity;
          for (const p of lay.checks) {
            min = Math.min(min, clearance(p));
            if (min < 30) break;
          }
          if (min < 30) continue;
          for (const p of [...lay.objectsAt, lay.boat]) min = Math.min(min, clearance(p) + 5);
          if (min < 30) continue;
          const score = min - Math.abs(d) * 0.5;
          if (!best || score > best.score) best = { score, dir, L, c0: [cx, cy] };
        }
    }
  }
  if (!best) throw new Error(`${spec.id}: no course fits`);
  const lay = layout(best.dir, best.L, best.c0);

  if (spec.source === "osm") {
    // Keep only the water connected to the course (drops ponds and canals elsewhere in the box).
    const reach = new Uint8Array(n * n);
    const startCell = Math.floor((lay.boat[1] + h) / CELL) * n + Math.floor((lay.boat[0] + h) / CELL);
    const queue = [startCell];
    reach[startCell] = 1;
    while (queue.length) {
      const i = queue.pop()!;
      const ix = i % n;
      const iy = (i - ix) / n;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const jx = ix + dx!;
        const jy = iy + dy!;
        if (jx < 0 || jy < 0 || jx >= n || jy >= n) continue;
        const j = jy * n + jx;
        if (!reach[j] && clear[j]! >= 0) {
          reach[j] = 1;
          queue.push(j);
        }
      }
    }
    const touchesReach = (rings: XY[][]) => {
      const xs = rings[0]!.map((p) => p[0]);
      const ys = rings[0]!.map((p) => p[1]);
      const ix0 = Math.max(0, Math.floor((Math.min(...xs) + h) / CELL));
      const ix1 = Math.min(n - 1, Math.floor((Math.max(...xs) + h) / CELL));
      const iy0 = Math.max(0, Math.floor((Math.min(...ys) + h) / CELL));
      const iy1 = Math.min(n - 1, Math.floor((Math.max(...ys) + h) / CELL));
      const probe: CourseData = { ...course, water: [rings], land: [] };
      for (let iy = iy0; iy <= iy1; iy++)
        for (let ix = ix0; ix <= ix1; ix++) {
          if (!reach[iy * n + ix]) continue;
          if (landProbe(probe, -h + (ix + 0.5) * CELL, -h + (iy + 0.5) * CELL).water) return true;
        }
      return false;
    };
    course.water = water.filter(touchesReach);
    course.land = land.filter((ring) => touchesReach([ring]));
  }

  // Legs in sailing order; each mark's outward ray bisects the turn so the rounding side can be checked.
  const startMid: XY = [(lay.committee[0] + lay.pin[0]) / 2, (lay.committee[1] + lay.pin[1]) / 2];
  const finishMid: XY = [(lay.finishBoat[0] + lay.finishPin[0]) / 2, (lay.finishBoat[1] + lay.finishPin[1]) / 2];
  const down: XY = [-lay.u[0], -lay.u[1]];
  const stops: { pos: XY; leg: CourseLeg }[] = lay.marks.map((m) => ({ pos: m.at, leg: { kind: "mark", at: p3(m.at), ray: [0, 0], side: 1, label: m.label } }));
  if (lay.gate) {
    const mid: XY = [(lay.gate.a[0] + lay.gate.b[0]) / 2, (lay.gate.a[1] + lay.gate.b[1]) / 2];
    stops.push({ pos: mid, leg: { kind: "gate", a: p3(lay.gate.a), b: p3(lay.gate.b), dir: p3(down), label: "4S/4P" } });
  }
  stops.push({ pos: finishMid, leg: { kind: "finish", a: p3(lay.finishBoat), b: p3(lay.finishPin), dir: p3(lay.u), label: "F" } });
  stops.forEach((s, i) => {
    if (s.leg.kind !== "mark") return;
    const prev = i === 0 ? startMid : stops[i - 1]!.pos;
    const next = stops[i + 1]!.pos;
    const a = unit([s.pos[0] - prev[0], s.pos[1] - prev[1]]);
    const b = unit([next[0] - s.pos[0], next[1] - s.pos[1]]);
    s.leg.ray = p3(unit([a[0] - b[0], a[1] - b[1]]));
  });
  course.legs = stops.map((s) => s.leg);
  course.start = { committee: p3(lay.committee), pin: p3(lay.pin) };
  const objects: CourseObject[] = [
    { kind: "committee", at: p3(lay.committee), label: "RC", color: "#f97316" },
    { kind: "pin", at: p3(lay.pin), label: "", color: "#f97316" },
    ...lay.marks.map((m): CourseObject => ({ kind: "mark", at: p3(m.at), label: m.label, color: m.color })),
    ...(lay.gate
      ? [
          { kind: "mark", at: p3(lay.gate.a), label: "4S", color: "#f97316" } as CourseObject,
          { kind: "mark", at: p3(lay.gate.b), label: "4P", color: "#f97316" } as CourseObject,
        ]
      : []),
    { kind: "finishBoat", at: p3(lay.finishBoat), label: "F", color: "#2563eb" },
    { kind: "finishPin", at: p3(lay.finishPin), label: "", color: "#2563eb" },
  ];
  course.objects = objects;
  const [cx, cy] = course.start.committee;
  const [px, py] = course.start.pin;
  const dn = lay.at(-30, 0);
  course.preSign = (px - cx) * (dn[1] - cy) - (py - cy) * (dn[0] - cx) > 0 ? 1 : -1;
  // Start the pre-start luffing head to wind below the line, like boats holding position.
  course.boat = { x: r3(lay.boat[0]), y: r3(lay.boat[1]), heading: Math.round(best.dir) % 360 };
  course.legM = best.L;
  const rnd = rng(spec.id);
  const phase = () => r3(rnd() * Math.PI * 2);
  course.wind = {
    dir: best.dir,
    speed: spec.wind[2],
    shifts: [
      [r3(6 + rnd() * 4), Math.round(150 + rnd() * 90), phase()],
      [r3(3 + rnd() * 3), Math.round(55 + rnd() * 40), phase()],
    ],
    spatialAmp: r3(3 + rnd() * 3),
    spatialWave: Math.round(best.L * (1.6 + rnd())),
    gust: [r3(0.08 + rnd() * 0.06), Math.round(200 + rnd() * 160), phase()],
    puff: [r3(0.22 + rnd() * 0.12), Math.round(Math.max(220, best.L * 0.45)), Math.round(50 + rnd() * 30), Math.round(best.L * 0.7), phase()],
  };

  const bot = botRace(course, step, initialState(course));
  const size = course.mask ? `${Math.round((course.mask.bits.length + course.mask.dist.length) / 1024)} KB grid` : `${course.water.flat().reduce((k, r) => k + r.length, 0) + course.land.reduce((k, r) => k + r.length, 0)} vertices`;
  console.log(
    `${spec.id}: ${spec.type}, wind ${best.dir}° ${spec.wind[2]} kn, leg ${best.L} m, clearance ${Math.round(best.score)} m, ${size} → bot ${bot.final.status} ${bot.final.finishTime ?? "-"} s, ${bot.final.tacks} tacks, ${bot.final.gybes} gybes`,
  );
  if (bot.final.status !== "finished") {
    const f = bot.final;
    throw new Error(`${spec.id}: the autopilot could not finish (${f.status}) leg=${f.leg} t=${f.t} at ${Math.round(f.x)},${Math.round(f.y)}`);
  }
  return { meta: { id: spec.id, name: spec.name, area: spec.area, botTime: bot.final.finishTime }, course };
}

const out: { meta: { id: string; name: string; area: string; botTime: number | null }; course: CourseData }[] = [];
for (const spec of SPECS.filter((s) => !ONLY || s.id === ONLY)) {
  out.push(await build(spec));
  await new Promise((r) => setTimeout(r, spec.source === "osm" ? 2000 : 200));
}

if (!ONLY) {
  const root = join(import.meta.dirname, "..");
  writeFileSync(join(root, "src/academy/games/race/courses.json"), JSON.stringify(out));
  const sql = [
    "-- Generated by scripts/make-race-courses.ts from OpenStreetMap data (© OpenStreetMap contributors, ODbL).",
    "-- Re-run the script to rebuild. Safe to run more than once.",
    "",
    ...out.map(
      ({ meta, course }, i) =>
        `insert into public.race_courses (id, sort, name, area, data, active, is_current) values (${[
          `'${meta.id}'`,
          i + 1,
          `'${meta.name.replace(/'/g, "''")}'`,
          `'${meta.area.replace(/'/g, "''")}'`,
          `'${JSON.stringify(course).replace(/'/g, "''")}'::jsonb`,
          "true",
          "false",
        ].join(", ")}) on conflict (id) do update set name = excluded.name, area = excluded.area, data = excluded.data, sort = excluded.sort;`,
    ),
    "-- Make sure one course is current.",
    "update public.race_courses set is_current = true where id = 'grote-poel' and not exists (select 1 from public.race_courses where is_current);",
    "",
  ].join("\n");
  writeFileSync(join(root, "supabase/migrations/0004_race_courses.sql"), sql);
  console.log("wrote courses.json and 0004_race_courses.sql");
}