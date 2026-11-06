/**
 * Builds the race courses from real OpenStreetMap water polygons.
 *
 *   npx tsx scripts/make-race-courses.ts
 *
 * For each lake it downloads the water (and island) polygons, converts them to metres, simplifies and
 * clips them to the race area, then searches the position, wind direction and leg length where a
 * windward-leeward course fits with room to spare. Every course is sailed once by the autopilot to make
 * sure it can be finished. Writes src/academy/games/race/courses.json and the Supabase seed migration.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { botRace } from "../src/academy/games/race/bot";
import { initialState, landProbe, q, step, type CourseData, type XY } from "../src/academy/games/race/sim";

interface Spec {
  id: string;
  name: string;
  area: string;
  /** OSM element used to find the lake; the race area is centred on it unless `center` is given. */
  main: string;
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
  { id: "grote-poel", name: "De Grote Poel", area: "Amstelveen, NL", main: "relation/1159460", half: 750, wind: [225, 40, 11], maxLeg: 650, simplify: 4 },
  { id: "westeinder", name: "Westeinderplassen", area: "Aalsmeer, NL", main: "relation/1102901", half: 1000, wind: [240, 35, 13], maxLeg: 700, simplify: 7 },
  { id: "loosdrecht", name: "Loosdrechtse Plassen", area: "Loosdrecht, NL", main: "relation/1306728", half: 1000, wind: [250, 35, 12], maxLeg: 700, simplify: 7 },
  { id: "sneekermeer", name: "Sneekermeer", area: "Friesland, NL", main: "relation/1948725", half: 1000, wind: [230, 35, 14], maxLeg: 700, simplify: 7 },
  { id: "braassemermeer", name: "Braassemermeer", area: "Roelofarendsveen, NL", main: "relation/1102571", half: 1000, wind: [220, 35, 12], maxLeg: 700, simplify: 7 },
  { id: "garda", name: "Lago di Garda", area: "Riva del Garda, IT", main: "relation/8569", center: [45.855, 10.865], half: 1100, wind: [195, 25, 16], maxLeg: 650, simplify: 8 },
];

const OVERPASS = "https://overpass-api.de/api/interpreter";

async function overpass(query: string): Promise<any> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(OVERPASS, {
      method: "POST",
      body: "data=" + encodeURIComponent(query),
      headers: { "User-Agent": "sail.mteke.com race course builder", "Content-Type": "application/x-www-form-urlencoded" },
    });
    if (res.ok) return res.json();
    await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
  }
  throw new Error("Overpass failed");
}

type LL = { lat: number; lon: number };

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

async function build(spec: Spec) {
  const [type, id] = spec.main.split("/");
  const main = spec.center ? null : (await overpass(`[out:json][timeout:120];${type}(${id});out bb;`)).elements[0];
  const center: LL = spec.center
    ? { lat: spec.center[0], lon: spec.center[1] }
    : { lat: (main.bounds.minlat + main.bounds.maxlat) / 2, lon: (main.bounds.minlon + main.bounds.maxlon) / 2 };
  const kx = 111320 * Math.cos((center.lat * Math.PI) / 180);
  const toXY = (p: LL): XY => [(p.lon - center.lon) * kx, (p.lat - center.lat) * 111320];
  const h = spec.half;
  const box: [number, number, number, number] = [-h, -h, h, h];
  const s = center.lat - h / 111320;
  const n = center.lat + h / 111320;
  const w = center.lon - h / kx;
  const e = center.lon + h / kx;
  await new Promise((r) => setTimeout(r, 1500));
  const all = await overpass(
    `[out:json][timeout:180];(way["natural"="water"](${s},${w},${n},${e});relation["natural"="water"](${s},${w},${n},${e});way["waterway"="riverbank"](${s},${w},${n},${e});way["place"~"^(island|islet)$"](${s},${w},${n},${e});relation["place"~"^(island|islet)$"](${s},${w},${n},${e}););out geom;`,
  );

  const prep = (ring: LL[]) => {
    const xy = simplifyRing(ring.map(toXY), spec.simplify);
    const clipped = clip(xy, box).map(p3);
    return clipped.length >= 3 && ringArea(clipped) > 200 ? clipped : null;
  };
  const water: XY[][][] = [];
  const land: XY[][] = [];
  for (const el of all.elements) {
    const rings = elementRings(el).map(prep).filter((r): r is XY[] => !!r);
    if (!rings.length) continue;
    if (el.tags?.place) land.push(...rings.filter((r) => ringArea(r) > 400));
    else water.push(rings);
  }

  const course: CourseData = {
    id: spec.id,
    origin: { lat: center.lat, lon: center.lon },
    bounds: [-h + 1, -h + 1, h - 1, h - 1],
    water,
    land,
    wind: { dir: spec.wind[0], speed: spec.wind[2], shifts: [], spatialAmp: 0, spatialWave: 1, gust: [0, 1, 0], puff: [0, 1, 1, 1, 0] },
    marks: { committee: [0, 0], pin: [0, 0], windward: [0, 0], offset: [0, 0], gateS: [0, 0], gateP: [0, 0], finishBoat: [0, 0], finishPin: [0, 0] },
    rays: { windward: [0, 0], offset: [0, 0] },
    preSign: 1,
    boat: { x: 0, y: 0, heading: 0 },
    legM: 0,
  };

  // Clearance raster: distance to the nearest shore (negative on land), 10 m cells.
  const cell = 10;
  const nCells = Math.floor((2 * h) / cell);
  const clear = new Float32Array(nCells * nCells);
  for (let iy = 0; iy < nCells; iy++)
    for (let ix = 0; ix < nCells; ix++) {
      const x = -h + (ix + 0.5) * cell;
      const y = -h + (iy + 0.5) * cell;
      const p = landProbe(course, x, y);
      clear[iy * nCells + ix] = p.water ? Math.min(p.dist, h - Math.abs(x), h - Math.abs(y)) : -1;
    }
  const clearance = (p: XY) => {
    const ix = Math.floor((p[0] + h) / cell);
    const iy = Math.floor((p[1] + h) / cell);
    if (ix < 0 || iy < 0 || ix >= nCells || iy >= nCells) return -1;
    return clear[iy * nCells + ix]!;
  };

  const layout = (dir: number, L: number, c0: XY) => {
    const a = (dir * Math.PI) / 180;
    const u: XY = [Math.sin(a), Math.cos(a)];
    const r: XY = [Math.cos(a), -Math.sin(a)];
    const at = (du: number, dr: number): XY => [c0[0] + u[0] * du + r[0] * dr, c0[1] + u[1] * du + r[1] * dr];
    const startLen = Math.max(70, 0.22 * L);
    const gate = Math.max(45, 0.08 * L);
    const finishLen = Math.max(45, 0.12 * L);
    return {
      u,
      r,
      at,
      marks: {
        committee: at(0, startLen / 2),
        pin: at(0, -startLen / 2),
        windward: at(L, 0),
        offset: at(L - 12, -Math.max(40, 0.08 * L)),
        gateS: at(-0.12 * L, -gate / 2),
        gateP: at(-0.12 * L, gate / 2),
        finishBoat: at(0.35 * L, finishLen / 2 + 0.05 * L),
        finishPin: at(0.35 * L, -finishLen / 2 + 0.05 * L),
      },
      boat: at(-55, 0),
      checks: [
        ...Array.from({ length: 13 }, (_, i) => at(-0.2 * L + (i * 1.25 * L) / 12, 0)),
        at(0, startLen / 2 + 25),
        at(0, -startLen / 2 - 25),
        at(L + 25, 0),
        at(L - 12, -Math.max(40, 0.08 * L) - 25),
        at(-0.12 * L - 25, 0),
        at(0.5 * L, 0.3 * L),
        at(0.5 * L, -0.3 * L),
        at(0.25 * L, 0.25 * L),
        at(0.25 * L, -0.25 * L),
        at(0.8 * L, 0.2 * L),
        at(0.8 * L, -0.2 * L),
      ],
    };
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
          for (const p of [...Object.values(lay.marks), lay.boat]) min = Math.min(min, clearance(p) + 5);
          if (min < 30) continue;
          const score = min - Math.abs(d) * 0.5;
          if (!best || score > best.score) best = { score, dir, L, c0: [cx, cy] };
        }
    }
  }
  if (!best) throw new Error(`${spec.id}: no course fits`);

  const lay = layout(best.dir, best.L, best.c0);

  // Keep only the water connected to the course (drops ponds and canals elsewhere in the box).
  const reach = new Uint8Array(nCells * nCells);
  const startCell = Math.floor((lay.boat[1] + h) / cell) * nCells + Math.floor((lay.boat[0] + h) / cell);
  const queue = [startCell];
  reach[startCell] = 1;
  while (queue.length) {
    const i = queue.pop()!;
    const ix = i % nCells;
    const iy = (i - ix) / nCells;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const jx = ix + dx!;
      const jy = iy + dy!;
      if (jx < 0 || jy < 0 || jx >= nCells || jy >= nCells) continue;
      const j = jy * nCells + jx;
      if (!reach[j] && clear[j]! >= 0) {
        reach[j] = 1;
        queue.push(j);
      }
    }
  }
  const touchesReach = (rings: XY[][]) => {
    const xs = rings[0]!.map((p) => p[0]);
    const ys = rings[0]!.map((p) => p[1]);
    const ix0 = Math.max(0, Math.floor((Math.min(...xs) + h) / cell));
    const ix1 = Math.min(nCells - 1, Math.floor((Math.max(...xs) + h) / cell));
    const iy0 = Math.max(0, Math.floor((Math.min(...ys) + h) / cell));
    const iy1 = Math.min(nCells - 1, Math.floor((Math.max(...ys) + h) / cell));
    const probe: CourseData = { ...course, water: [rings], land: [] };
    for (let iy = iy0; iy <= iy1; iy++)
      for (let ix = ix0; ix <= ix1; ix++) {
        if (!reach[iy * nCells + ix]) continue;
        if (landProbe(probe, -h + (ix + 0.5) * cell, -h + (iy + 0.5) * cell).water) return true;
      }
    return false;
  };
  course.water = water.filter(touchesReach);
  course.land = land.filter((ring) => touchesReach([ring]));
  const marks = Object.fromEntries(Object.entries(lay.marks).map(([k, v]) => [k, p3(v)])) as CourseData["marks"];
  const rnd = rng(spec.id);
  const phase = () => r3(rnd() * Math.PI * 2);
  course.marks = marks;
  course.rays = { windward: p3(lay.u), offset: p3([-lay.r[0], -lay.r[1]]) };
  const [cx, cy] = marks.committee;
  const [px, py] = marks.pin;
  const down = lay.at(-30, 0);
  course.preSign = (px - cx) * (down[1] - cy) - (py - cy) * (down[0] - cx) > 0 ? 1 : -1;
  // Start the pre-start luffing head to wind below the line, like boats holding position.
  course.boat = { x: r3(lay.boat[0]), y: r3(lay.boat[1]), heading: Math.round(best.dir) % 360 };
  course.legM = best.L;
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
  const vertices = course.water.flat().reduce((n, r) => n + r.length, 0) + course.land.reduce((n, r) => n + r.length, 0);
  console.log(
    `${spec.id}: wind ${best.dir}° ${spec.wind[2]} kn, leg ${best.L} m, clearance ${Math.round(best.score)} m, ${vertices} vertices → bot ${bot.final.status} ${bot.final.finishTime ?? "-"} s, ${bot.final.tacks} tacks, ${bot.final.gybes} gybes`,
  );
  if (bot.final.status !== "finished") {
    const f = bot.final;
    throw new Error(`${spec.id}: the autopilot could not finish (${f.status}) leg=${f.leg} ocs=${f.ocs} t=${f.t} at ${Math.round(f.x)},${Math.round(f.y)} marks=${JSON.stringify(course.marks)}`);
  }
  return { meta: { id: spec.id, name: spec.name, area: spec.area, botTime: bot.final.finishTime }, course };
}

const out: { meta: { id: string; name: string; area: string; botTime: number | null }; course: CourseData }[] = [];
for (const spec of SPECS.filter((s) => !ONLY || s.id === ONLY)) {
  out.push(await build(spec));
  await new Promise((r) => setTimeout(r, 2000));
}

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
        i === 0 ? "true" : "false",
      ].join(", ")}) on conflict (id) do update set name = excluded.name, area = excluded.area, data = excluded.data, sort = excluded.sort;`,
  ),
  "",
].join("\n");
writeFileSync(join(root, "supabase/migrations/0004_race_courses.sql"), sql);
console.log("wrote courses.json and 0004_race_courses.sql");
