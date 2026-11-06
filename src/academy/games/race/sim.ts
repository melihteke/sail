/**
 * Deterministic race simulation. The same model runs in the browser (live game) and in Postgres
 * (supabase/migrations/0003_race.sql, `race_simulate`), which re-sails every submitted race from the
 * player's helm commands. Keep both in step: every intermediate value is rounded to a fixed precision
 * so tiny libm differences cannot change a result.
 *
 * Units: metres (x east, y north, origin = middle of the start line), seconds, degrees, knots for wind.
 */

export const PRESTART = 60
export const TIME_LIMIT = 1800
export const TURN_RATE = 12
export const ACCEL = 0.3
/** Upper bound of boat speed (m/s), used to skip land checks while far from shore. */
export const MAX_SPEED = 4.5
/** Simulated seconds per real second in the browser. */
export const SPEEDUP = 8
const RAY = 400

const b64 = (s: string): Uint8Array => {
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
const maskCache = new WeakMap<CourseMask, { bits: Uint8Array; dist: Uint8Array }>()
function maskData(m: CourseMask) {
  let d = maskCache.get(m)
  if (!d) {
    d = { bits: b64(m.bits), dist: b64(m.dist) }
    maskCache.set(m, d)
  }
  return d
}

export type XY = [number, number]

export interface CourseWind {
  /** Mean direction the wind blows from (deg) and mean speed (kn). */
  dir: number
  speed: number
  /** Oscillating shifts: [amplitude deg, period s, phase rad]. */
  shifts: [number, number, number][]
  /** Persistent difference across the course: amplitude (deg) and wavelength (m). */
  spatialAmp: number
  spatialWave: number
  /** Slow change of strength: [fraction, period s, phase rad]. */
  gust: [number, number, number]
  /** Puffs moving downwind: [fraction, wavelength m, period s, cross wavelength m, cross phase rad]. */
  puff: [number, number, number, number, number]
}

/**
 * What to do after the start, in order. A mark is rounded when the track crosses its outward ray
 * (`ray`, unit vector) turning the right way: side 1 = leave it to port, -1 = to starboard.
 * A gate or the finish is passed by crossing the segment a→b while moving along `dir`.
 */
export type CourseLeg =
  | { kind: 'mark'; at: XY; ray: XY; side: number; label: string }
  | { kind: 'gate' | 'finish'; a: XY; b: XY; dir: XY; label: string }

/** Shown on the map only. */
export interface CourseObject {
  kind: 'mark' | 'committee' | 'pin' | 'finishBoat' | 'finishPin'
  at: XY
  label: string
  color: string
}

/** Land/water grid for sea courses: 10 m cells, bit set = water; `dist` is a coarse min-distance grid. */
export interface CourseMask {
  x0: number
  y0: number
  cell: number
  nx: number
  ny: number
  bits: string
  /** Per `coarse`×`coarse` block of cells: min Chebyshev distance to land in cells (capped 255). */
  coarse: number
  dist: string
}

export interface CourseData {
  id: string
  type: 'windward-leeward' | 'triangle'
  origin: { lat: number; lon: number }
  /** Race area [minX, minY, maxX, maxY]; leaving it ends the race. */
  bounds: [number, number, number, number]
  /** Water polygons: rings of [x, y]; ring 0 is the outline, the others are islands (holes). */
  water: XY[][][]
  /** Extra land inside the water (islands mapped separately). */
  land: XY[][]
  /** Sea courses use a land/water grid instead of polygons. */
  mask?: CourseMask
  wind: CourseWind
  start: { committee: XY; pin: XY }
  legs: CourseLeg[]
  objects: CourseObject[]
  /** Sign of cross(pin - committee, p - committee) on the pre-start side of the start line. */
  preSign: number
  boat: { x: number; y: number; heading: number }
  legM: number
}

/** Generic 6.5 m day sailer (same table as the academy's route planner). */
export const POLAR = {
  tws: [4, 6, 8, 10, 12, 16, 20],
  twa: [40, 45, 52, 60, 75, 90, 110, 120, 135, 150, 165, 180],
  speeds: [
    [2.4, 3.3, 3.9, 4.3, 4.5, 4.7, 4.8],
    [2.7, 3.6, 4.2, 4.6, 4.8, 5.0, 5.1],
    [3.0, 3.9, 4.5, 4.9, 5.1, 5.3, 5.4],
    [3.2, 4.1, 4.7, 5.1, 5.3, 5.5, 5.6],
    [3.4, 4.4, 5.0, 5.4, 5.6, 5.8, 6.0],
    [3.5, 4.5, 5.1, 5.5, 5.8, 6.1, 6.4],
    [3.4, 4.4, 5.0, 5.5, 5.9, 6.4, 6.9],
    [3.3, 4.3, 4.9, 5.4, 5.8, 6.4, 7.0],
    [3.0, 4.0, 4.6, 5.1, 5.5, 6.1, 6.8],
    [2.6, 3.6, 4.3, 4.8, 5.2, 5.8, 6.4],
    [2.3, 3.3, 4.0, 4.5, 4.9, 5.5, 6.1],
    [2.1, 3.1, 3.8, 4.3, 4.7, 5.3, 5.9],
  ],
}

export const q = (v: number, scale: number) => Math.floor(v * scale + 0.5) / scale
export const norm360 = (a: number) => a - 360 * Math.floor(a / 360)
export const norm180 = (a: number) => {
  const n = norm360(a)
  return n > 180 ? n - 360 : n
}
const rad = (deg: number) => (deg * Math.PI) / 180
const TWO_PI = 2 * Math.PI

/** Linear interpolation in the polar; below 40° TWA the boat stops, below 4 kn it scales down. */
export function polarSpeedKn(twaAbs: number, tws: number): number {
  const P = POLAR
  if (twaAbs < P.twa[0] || tws <= 0) return 0
  let i = 0
  let ti = 0
  if (twaAbs >= P.twa[P.twa.length - 1]) {
    i = P.twa.length - 2
    ti = 1
  } else {
    while (P.twa[i + 1] < twaAbs) i++
    ti = (twaAbs - P.twa[i]) / (P.twa[i + 1] - P.twa[i])
  }
  let factor = 1
  let w = tws
  if (w < P.tws[0]) {
    factor = w / P.tws[0]
    w = P.tws[0]
  }
  let j = 0
  let tj = 0
  if (w >= P.tws[P.tws.length - 1]) {
    j = P.tws.length - 2
    tj = 1
  } else {
    while (P.tws[j + 1] < w) j++
    tj = (w - P.tws[j]) / (P.tws[j + 1] - P.tws[j])
  }
  const s = P.speeds
  const top = s[i][j] + (s[i][j + 1] - s[i][j]) * tj
  const bottom = s[i + 1][j] + (s[i + 1][j + 1] - s[i + 1][j]) * tj
  return (top + (bottom - top) * ti) * factor
}

/** Wind (from-direction deg, speed kn) at a time (s after the gun, negative before) and place. */
export function windAt(w: CourseWind, t: number, x: number, y: number): { dir: number; tws: number } {
  const a = rad(w.dir)
  const cross = x * Math.cos(a) - y * Math.sin(a)
  const along = -(x * Math.sin(a) + y * Math.cos(a))
  let dir = w.dir
  for (const [amp, period, phase] of w.shifts) dir += amp * Math.sin((TWO_PI * t) / period + phase)
  dir += w.spatialAmp * Math.sin((TWO_PI * cross) / w.spatialWave)
  const [ga, gp, gph] = w.gust
  const [pa, pw, pp, cw, cph] = w.puff
  const wave = Math.sin(TWO_PI * (along / pw - t / pp))
  const puff = wave > 0 ? wave * wave : 0
  const spread = 0.6 + 0.4 * Math.sin((TWO_PI * cross) / cw + cph)
  const tws = w.speed * (1 + ga * Math.sin((TWO_PI * t) / gp + gph) + pa * puff * spread)
  return { dir: q(norm360(dir), 1e6), tws: q(tws, 1e6) }
}

const crossOf = (ax: number, ay: number, bx: number, by: number) => ax * by - ay * bx

/** Segment p1→p2 against segment a→b: fraction along p1→p2 where they cross, or -1. */
function segHit(p1x: number, p1y: number, p2x: number, p2y: number, ax: number, ay: number, bx: number, by: number): number {
  const rx = p2x - p1x
  const ry = p2y - p1y
  const sx = bx - ax
  const sy = by - ay
  const den = crossOf(rx, ry, sx, sy)
  if (den === 0) return -1
  const t = crossOf(ax - p1x, ay - p1y, sx, sy) / den
  const u = crossOf(ax - p1x, ay - p1y, rx, ry) / den
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? t : -1
}

/** Point-in-polygon (even-odd per polygon) plus distance to the nearest edge. */
export function landProbe(c: CourseData, x: number, y: number): { water: boolean; dist: number } {
  if (c.mask) {
    const m = c.mask
    const ix = Math.floor((x - m.x0) / m.cell)
    const iy = Math.floor((y - m.y0) / m.cell)
    if (ix < 0 || iy < 0 || ix >= m.nx || iy >= m.ny) return { water: false, dist: 0 }
    const { bits, dist } = maskData(m)
    const idx = iy * m.nx + ix
    const water = (bits[idx >> 3]! & (1 << (idx & 7))) !== 0
    const cn = Math.ceil(m.nx / m.coarse)
    const v = dist[Math.floor(iy / m.coarse) * cn + Math.floor(ix / m.coarse)]!
    return { water, dist: (v > 1 ? v - 1 : 0) * m.cell }
  }
  let inWater = false
  let dist = Infinity
  const scan = (ring: XY[]): boolean => {
    let inside = false
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i]
      const [xj, yj] = ring[j]
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
      const dx = xi - xj
      const dy = yi - yj
      const len2 = dx * dx + dy * dy
      let f = len2 > 0 ? ((x - xj) * dx + (y - yj) * dy) / len2 : 0
      if (f < 0) f = 0
      else if (f > 1) f = 1
      const ex = xj + f * dx - x
      const ey = yj + f * dy - y
      const d = Math.sqrt(ex * ex + ey * ey)
      if (d < dist) dist = d
    }
    return inside
  }
  for (const poly of c.water) {
    let inside = false
    for (const ring of poly) if (scan(ring)) inside = !inside
    if (inside) inWater = true
  }
  for (const ring of c.land) if (scan(ring)) inWater = false
  return { water: inWater, dist }
}

export type RaceStatus = 'racing' | 'finished' | 'crashed' | 'outside' | 'timeout'

export interface RaceState {
  /** Time at the current position: seconds after the gun (negative before). */
  t: number
  x: number
  y: number
  heading: number
  speed: number
  target: number
  /** 0 = start, i = sailing to legs[i - 1], legs.length + 1 = finished. */
  leg: number
  ocs: boolean
  status: RaceStatus
  tacks: number
  gybes: number
  distance: number
  /** Side of the wind (+1 starboard tack, -1 port tack). */
  side: number
  nextLandCheck: number
  finishTime: number | null
  twa: number
  windDir: number
  tws: number
}

export function initialState(c: CourseData): RaceState {
  const w = windAt(c.wind, -PRESTART, c.boat.x, c.boat.y)
  const twa = norm180(w.dir - c.boat.heading)
  return {
    t: -PRESTART,
    x: c.boat.x,
    y: c.boat.y,
    heading: c.boat.heading,
    speed: q((polarSpeedKn(Math.abs(twa), w.tws) * 1852) / 3600, 1e6),
    target: c.boat.heading,
    leg: 0,
    ocs: false,
    status: 'racing',
    tacks: 0,
    gybes: 0,
    distance: 0,
    side: twa >= 0 ? 1 : -1,
    nextLandCheck: -PRESTART,
    finishTime: null,
    twa,
    windDir: w.dir,
    tws: w.tws,
  }
}

/** -1 on the pre-start side of the start line, 1 on the course side. */
export function sideOfStart(c: CourseData, x: number, y: number): number {
  const [cx, cy] = c.start.committee
  const [px, py] = c.start.pin
  return crossOf(px - cx, py - cy, x - cx, y - cy) * c.preSign > 0 ? -1 : 1
}

/** Advance one second. `target` is the heading the helm steers for (integer degrees). */
export function step(c: CourseData, s: RaceState, target: number): RaceState {
  if (s.status !== 'racing') return s
  const k = s.t
  const n: RaceState = { ...s, target }
  const diff = norm180(target - s.heading)
  const turn = diff > TURN_RATE ? TURN_RATE : diff < -TURN_RATE ? -TURN_RATE : diff
  n.heading = q(norm360(s.heading + turn), 1e6)
  const w = windAt(c.wind, k, s.x, s.y)
  const twa = norm180(w.dir - n.heading)
  const vt = (polarSpeedKn(Math.abs(twa), w.tws) * 1852) / 3600
  n.speed = q(s.speed + (vt - s.speed) * ACCEL, 1e6)
  const h = rad(n.heading)
  n.x = q(s.x + n.speed * Math.sin(h), 1e3)
  n.y = q(s.y + n.speed * Math.cos(h), 1e3)
  n.t = k + 1
  n.twa = twa
  n.windDir = w.dir
  n.tws = w.tws

  const side = twa > 0 ? 1 : twa < 0 ? -1 : s.side
  if (side !== s.side) {
    if (k >= 0) {
      if (Math.abs(twa) < 90) n.tacks++
      else n.gybes++
    }
    n.side = side
  }
  if (k >= 0) n.distance = q(s.distance + n.speed, 1e3)

  const [bx0, by0, bx1, by1] = c.bounds
  if (n.x < bx0 || n.x > bx1 || n.y < by0 || n.y > by1) {
    n.status = 'outside'
    return n
  }
  if (n.t >= s.nextLandCheck) {
    const probe = landProbe(c, n.x, n.y)
    if (!probe.water) {
      n.status = 'crashed'
      return n
    }
    n.nextLandCheck = n.t + Math.max(1, Math.floor(probe.dist / MAX_SPEED))
  }

  if (n.leg === 0) {
    const before = sideOfStart(c, s.x, s.y)
    const after = sideOfStart(c, n.x, n.y)
    const { committee, pin } = c.start
    if (k < 0) {
      if (n.t === 0 && after === 1) n.ocs = true
    } else if (n.ocs) {
      if (after === -1) n.ocs = false
    } else if (before === -1 && after === 1 && segHit(s.x, s.y, n.x, n.y, committee[0], committee[1], pin[0], pin[1]) >= 0) {
      n.leg = 1
    }
  } else if (n.leg <= c.legs.length) {
    const L = c.legs[n.leg - 1]!
    if (L.kind === 'mark') {
      const [ax, ay] = L.at
      const [dx, dy] = L.ray
      const hit = segHit(s.x, s.y, n.x, n.y, ax, ay, ax + dx * RAY, ay + dy * RAY)
      if (hit >= 0 && L.side * crossOf(dx, dy, n.x - s.x, n.y - s.y) > 0) n.leg++
    } else {
      const hit = segHit(s.x, s.y, n.x, n.y, L.a[0], L.a[1], L.b[0], L.b[1])
      if (hit >= 0 && (n.x - s.x) * L.dir[0] + (n.y - s.y) * L.dir[1] > 0) {
        n.leg++
        if (L.kind === 'finish') {
          n.status = 'finished'
          n.finishTime = q(k + hit, 10)
          return n
        }
      }
    }
  }  if (n.t >= TIME_LIMIT) n.status = 'timeout'
  return n
}

export type HelmEvent = [tick: number, heading: number]

export interface RaceResult {
  status: Exclude<RaceStatus, 'racing'>
  time: number | null
  tacks: number
  gybes: number
  distance: number
}

/** Replays helm commands from the start of the pre-start: what the server does with a submission. */
export function simulate(c: CourseData, events: HelmEvent[]): RaceResult {
  let s = initialState(c)
  let e = 0
  let target = s.target
  while (s.status === 'racing') {
    while (e < events.length && events[e][0] <= s.t) {
      if (events[e][0] === s.t) target = events[e][1]
      e++
    }
    s = step(c, s, target)
  }
  return {
    status: s.status as RaceResult['status'],
    time: s.finishTime,
    tacks: s.tacks,
    gybes: s.gybes,
    distance: Math.round(s.distance),
  }
}

/** Projection between race metres and lat/lon (equirectangular around the course origin). */
export function toLatLon(c: CourseData, x: number, y: number): [number, number] {
  const lat = c.origin.lat + y / 111320
  const lon = c.origin.lon + x / (111320 * Math.cos(rad(c.origin.lat)))
  return [lat, lon]
}

export function fromLatLon(c: CourseData, lat: number, lon: number): XY {
  return [(lon - c.origin.lon) * 111320 * Math.cos(rad(c.origin.lat)), (lat - c.origin.lat) * 111320]
}
