/**
 * Pure weather maths for the Day Skipper weather lesson: pressure fields, isobars (marching squares),
 * wind from isobars, fronts, the depression-passage model and the ocean-passage simulator.
 * Everything here is simplified for teaching.
 */

const DEG = Math.PI / 180
export const mod = (a: number, n: number) => ((a % n) + n) % n
export const r1 = (v: number) => Math.round(v * 10) / 10

export type Hemi = 'N' | 'S'

/* ---------------- Pressure fields ---------------- */

export interface PSystem {
  x: number
  y: number
  /** hPa added at the centre (negative for a low). */
  a: number
  sx: number
  sy: number
}

export type FrontKind = 'cold' | 'warm' | 'occluded' | 'stationary' | 'trough'
export interface Front {
  kind: FrontKind
  pts: [number, number][]
  /** Which side the symbols sit on (+1 / −1 relative to the drawing direction). */
  side: 1 | -1
}

export interface Field {
  base: number
  systems: PSystem[]
  /** Fronts drawn on the chart; the cold, warm and occluded ones also carry a pressure trough (kinked isobars). */
  fronts: Front[]
  /** Depth of the frontal trough, hPa. */
  trough?: number
  hemi: Hemi
  /** Latitude used for the Coriolis parameter, degrees. */
  lat: number
}

export function distToPolyline(x: number, y: number, pts: [number, number][]): number {
  let best = Infinity
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i]
    const [bx, by] = pts[i + 1]
    const dx = bx - ax
    const dy = by - ay
    const L = dx * dx + dy * dy
    const t = L ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L)) : 0
    best = Math.min(best, Math.hypot(x - ax - t * dx, y - ay - t * dy))
  }
  return best
}

export function pressureAt(f: Field, x: number, y: number): number {
  let p = f.base
  for (const s of f.systems) p += s.a * Math.exp(-(((x - s.x) / s.sx) ** 2 + ((y - s.y) / s.sy) ** 2))
  if (f.trough) {
    for (const fr of f.fronts) {
      if (fr.kind === 'stationary') continue
      const d = distToPolyline(x, y, fr.pts)
      p -= f.trough * Math.exp(-((d / 0.35) ** 2))
    }
  }
  return p
}

/** Pressure gradient (hPa per unit) by central differences. */
export function gradient(f: Field, x: number, y: number): [number, number] {
  const h = 0.02
  return [(pressureAt(f, x + h, y) - pressureAt(f, x - h, y)) / (2 * h), (pressureAt(f, x, y + h) - pressureAt(f, x, y - h)) / (2 * h)]
}

/**
 * Geostrophic wind speed in knots for a pressure gradient in hPa per `unitNm` nautical miles at latitude `lat`.
 * V = Δp / (ρ · f · Δn)
 */
export function geostrophicKn(hPaPerUnit: number, lat: number, unitNm = 100): number {
  const f = 2 * 7.2921e-5 * Math.sin(Math.max(5, Math.abs(lat)) * DEG)
  const ms = (hPaPerUnit * 100) / (1.25 * f * unitNm * 1852)
  return ms * 1.9438
}

/** Spacing (nm between 4 hPa isobars) → geostrophic wind in knots. */
export const spacingToKn = (nm: number, lat: number) => geostrophicKn(4, lat, nm)

export interface Wind {
  /** Direction the wind blows FROM, degrees true. */
  from: number
  kn: number
}

/**
 * Surface wind from the isobars: along the isobars with low pressure on the left (NH) or right (SH),
 * turned `inflow` degrees in towards the low and reduced by `factor` for friction.
 */
export function windFromGradient(g: [number, number], hemi: Hemi, lat: number, unitNm = 100, inflow = 15, factor = 0.7): Wind {
  const [gx, gy] = g
  const geo = geostrophicKn(Math.hypot(gx, gy), lat, unitNm)
  let vx = hemi === 'N' ? -gy : gy
  let vy = hemi === 'N' ? gx : -gx
  const a = (hemi === 'N' ? inflow : -inflow) * DEG
  ;[vx, vy] = [vx * Math.cos(a) - vy * Math.sin(a), vx * Math.sin(a) + vy * Math.cos(a)]
  const toward = mod(Math.atan2(vx, vy) / DEG, 360)
  return { from: mod(toward + 180, 360), kn: geo * factor }
}

export const windAt = (f: Field, x: number, y: number): Wind => windFromGradient(gradient(f, x, y), f.hemi, f.lat)

/** 8-point compass name index (0 = N, 1 = NE, …). */
export const compass8 = (deg: number) => Math.round(mod(deg, 360) / 45) % 8

/* ---------------- Beaufort ---------------- */

export const BEAUFORT_KN = [0, 1, 4, 7, 11, 17, 22, 28, 34, 41, 48, 56, 64]
export const BEAUFORT_WAVE = [0, 0.1, 0.2, 0.6, 1, 2, 3, 4, 5.5, 7, 9, 11.5, 14]

export function beaufort(kn: number): number {
  let f = 0
  for (let i = 0; i < BEAUFORT_KN.length; i++) if (kn >= BEAUFORT_KN[i] - 0.5) f = i
  return f
}

export const beaufortRange = (f: number) => (f >= 12 ? `${BEAUFORT_KN[12]}+` : f === 0 ? '<1' : `${BEAUFORT_KN[f]}–${BEAUFORT_KN[f + 1] - 1}`)

/** Met Office barometric tendency over 3 hours: 0 steady, 1 slowly, 2 (plain), 3 quickly, 4 very rapidly. */
export function tendencyIndex(change3h: number): number {
  const c = Math.abs(change3h)
  if (c < 0.1) return 0
  if (c < 1.6) return 1
  if (c < 3.6) return 2
  if (c <= 6) return 3
  return 4
}

/* ---------------- Isobars: marching squares ---------------- */

export interface Contour {
  level: number
  segs: [number, number, number, number][]
}

export function contours(fn: (x: number, y: number) => number, x0: number, x1: number, y0: number, y1: number, nx: number, ny: number, step: number): Contour[] {
  const dx = (x1 - x0) / nx
  const dy = (y1 - y0) / ny
  const v: number[][] = []
  let lo = Infinity
  let hi = -Infinity
  for (let j = 0; j <= ny; j++) {
    const row: number[] = []
    for (let i = 0; i <= nx; i++) {
      const p = fn(x0 + i * dx, y0 + j * dy)
      row.push(p)
      lo = Math.min(lo, p)
      hi = Math.max(hi, p)
    }
    v.push(row)
  }
  const out: Contour[] = []
  for (let level = Math.ceil(lo / step) * step; level <= hi; level += step) {
    const segs: Contour['segs'] = []
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const c = [v[j][i], v[j][i + 1], v[j + 1][i + 1], v[j + 1][i]]
        const P = [
          [x0 + i * dx, y0 + j * dy],
          [x0 + (i + 1) * dx, y0 + j * dy],
          [x0 + (i + 1) * dx, y0 + (j + 1) * dy],
          [x0 + i * dx, y0 + (j + 1) * dy],
        ]
        const pts: [number, number][] = []
        for (let e = 0; e < 4; e++) {
          const a = c[e]
          const b = c[(e + 1) % 4]
          if (a < level !== b < level) {
            const t = (level - a) / (b - a)
            pts.push([P[e][0] + t * (P[(e + 1) % 4][0] - P[e][0]), P[e][1] + t * (P[(e + 1) % 4][1] - P[e][1])])
          }
        }
        if (pts.length === 2) segs.push([pts[0][0], pts[0][1], pts[1][0], pts[1][1]])
        else if (pts.length === 4) {
          segs.push([pts[0][0], pts[0][1], pts[1][0], pts[1][1]])
          segs.push([pts[2][0], pts[2][1], pts[3][0], pts[3][1]])
        }
      }
    }
    if (segs.length) out.push({ level, segs })
  }
  return out
}

/* ---------------- A depression passing over a boat (NH) ---------------- */

/** Fronts relative to the centre of the low, in units of 100 nm (x east, y north). */
export const DEP_WARM: [number, number][] = [
  [0, 0],
  [1.4, -0.4],
  [2.8, -1.4],
  [3.8, -2.8],
  [4.4, -4.6],
]
export const DEP_COLD: [number, number][] = [
  [0, 0],
  [0.4, -1.4],
  [0.2, -2.8],
  [-0.4, -4.2],
  [-1.2, -5.6],
]
/** Speed of the low, units per hour (0.25 = 25 knots). */
export const DEP_SPEED = 0.25
export const DEP_OBS: [number, number] = [9, 3]
export const DEP_HOURS = 44

export const depCentre = (t: number): [number, number] => [-0.5 + DEP_SPEED * t, 5.2]

export function depField(t: number, hemi: Hemi = 'N'): Field {
  const [cx, cy] = depCentre(t)
  const sh = (pts: [number, number][]): [number, number][] => pts.map(([x, y]) => [x + cx, y + cy])
  return {
    base: 1018,
    systems: [
      { x: cx, y: cy, a: -22, sx: 4.6, sy: 4 },
      { x: 15, y: -2, a: 10, sx: 6, sy: 5 },
    ],
    fronts: [
      { kind: 'warm', pts: sh(DEP_WARM), side: 1 },
      { kind: 'cold', pts: sh(DEP_COLD), side: 1 },
    ],
    trough: 3,
    hemi,
    lat: 50,
  }
}

/** x of a front polyline at latitude y (null if the front does not reach it). */
export function frontXAt(pts: [number, number][], y: number): number | null {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i]
    const [bx, by] = pts[i + 1]
    if ((y <= ay && y >= by) || (y >= ay && y <= by)) {
      const k = by === ay ? 0 : (y - ay) / (by - ay)
      return ax + k * (bx - ax)
    }
  }
  return null
}

export type ZoneId = 'far' | 'ahead' | 'warmFront' | 'warmSector' | 'coldFront' | 'behind'

export interface DepState {
  zone: ZoneId
  /** Distance to the warm front ahead (nm), or to the cold front ahead in the warm sector. */
  aheadNm: number
  p: number
  /** Change over 3 hours, hPa. */
  tendency: number
  wind: Wind
}

export function depState(t: number): DepState {
  const [ox, oy] = DEP_OBS
  const [cx, cy] = depCentre(t)
  const wx = frontXAt(DEP_WARM, oy - cy)! + cx
  const kx = frontXAt(DEP_COLD, oy - cy)! + cx
  const f = depField(t)
  const p = pressureAt(f, ox, oy)
  const tendency = pressureAt(depField(t + 1.5), ox, oy) - pressureAt(depField(t - 1.5), ox, oy)
  let zone: ZoneId
  let ahead = 0
  if (ox > wx + 0.25) {
    ahead = (ox - wx) * 100
    zone = ahead > 350 ? 'far' : 'ahead'
  } else if (ox > wx - 0.25) zone = 'warmFront'
  else if (ox > kx + 0.25) {
    zone = 'warmSector'
    ahead = (ox - kx) * 100
  } else if (ox > kx - 0.25) zone = 'coldFront'
  else zone = 'behind'
  // The frontal trough only kinks the drawn isobars; the observer's wind comes from the smooth field,
  // with the classic shifts: backing ahead of the warm front, a sharp veer and squalls at the cold front.
  const w = windAt({ ...f, trough: 0 }, ox, oy)
  const shift = zone === 'ahead' ? -25 * (1 - ahead / 350) : zone === 'warmFront' ? -10 : zone === 'coldFront' ? 25 : zone === 'behind' ? 45 : 0
  const gust = zone === 'coldFront' ? 1.4 : 1
  return { zone, aheadNm: Math.round(ahead), p, tendency, wind: { from: mod(w.from + shift, 360), kn: w.kn * gust } }
}

/* ---------------- Ocean passage: Canaries → Caribbean ---------------- */

export type LatLon = [number, number]

export interface Season {
  id: 'nov' | 'feb' | 'jul' | 'sep'
  /** Centre of the Azores high. */
  high: LatLon
  /** Latitude of the ITCZ (doldrums). */
  itcz: number
  scale: number
  hurricanes: boolean
}

export const SEASONS: Season[] = [
  { id: 'nov', high: [35, -35], itcz: 6, scale: 1, hurricanes: false },
  { id: 'feb', high: [33, -32], itcz: 3, scale: 1.1, hurricanes: false },
  { id: 'jul', high: [38, -40], itcz: 9, scale: 0.9, hurricanes: true },
  { id: 'sep', high: [37, -42], itcz: 10, scale: 0.8, hurricanes: true },
]

export const OCEAN = { latMin: 0, latMax: 45, lonMin: -70, lonMax: -5 }
export const START: LatLon = [28.13, -15.43]
export const FINISH: LatLon = [14.08, -60.95]

/** Distance from the centre of the high in "degrees" with longitude scaled for latitude. */
function highR(s: Season, lat: number, lon: number): [number, number, number] {
  const k = Math.cos(((lat + s.high[0]) / 2) * DEG)
  const dx = (lon - s.high[1]) * k
  const dy = lat - s.high[0]
  return [dx, dy, Math.hypot(dx, dy)]
}

export function oceanPressure(s: Season, lat: number, lon: number): number {
  const [, , r] = highR(s, lat, lon)
  return 1010 + 26 * Math.exp(-((r / 24) ** 4)) - 3 * Math.exp(-(((lat - s.itcz) / 3) ** 2))
}

/** Surface wind: clockwise round the Azores high, out of it by 20°, calm near its centre and in the doldrums. */
export function oceanWind(s: Season, lat: number, lon: number): Wind {
  const [dx, dy, r] = highR(s, lat, lon)
  const dpdr = r === 0 ? 0 : 26 * 4 * r ** 3 / 24 ** 4 * Math.exp(-((r / 24) ** 4))
  let kn = 13 * dpdr * s.scale
  kn *= 1 - 0.85 * Math.exp(-(((lat - s.itcz) / 2.5) ** 2))
  // Pressure rises towards the centre: gradient points at the high.
  const gx = r ? -dx / r : 0
  const gy = r ? -dy / r : 0
  let vx = -gy
  let vy = gx
  const a = 20 * DEG
  ;[vx, vy] = [vx * Math.cos(a) - vy * Math.sin(a), vx * Math.sin(a) + vy * Math.cos(a)]
  const toward = mod(Math.atan2(vx, vy) / DEG, 360)
  return { from: mod(toward + 180, 360), kn: Math.max(0, kn) }
}

/** Boat speed through the water for a true wind speed and angle (degrees off the bow). */
export function boatSpeed(tws: number, twa: number): number {
  if (tws < 4) return 1.5
  const base = Math.min(7.5, 0.5 * tws ** 0.9)
  const a = Math.abs(twa)
  if (a < 45) return (base * 0.62 * Math.cos(45 * DEG)) / Math.cos(a * DEG)
  const pts: [number, number][] = [
    [45, 0.62],
    [60, 0.82],
    [90, 1],
    [120, 1],
    [150, 0.9],
    [180, 0.78],
  ]
  for (let i = 0; i + 1 < pts.length; i++) {
    if (a <= pts[i + 1][0]) {
      const k = (a - pts[i][0]) / (pts[i + 1][0] - pts[i][0])
      return base * (pts[i][1] + k * (pts[i + 1][1] - pts[i][1]))
    }
  }
  return base * 0.78
}

export function nmBetween(a: LatLon, b: LatLon): number {
  const k = Math.cos(((a[0] + b[0]) / 2) * DEG)
  return Math.hypot((b[0] - a[0]) * 60, (b[1] - a[1]) * 60 * k)
}

export function courseBetween(a: LatLon, b: LatLon): number {
  const k = Math.cos(((a[0] + b[0]) / 2) * DEG)
  return mod(Math.atan2((b[1] - a[1]) * k, b[0] - a[0]) / DEG, 360)
}

/* Simplified coastlines (lat, lon) for the ocean chart and the land check. */
export const OCEAN_LAND: LatLon[][] = [
  [
    [45, -5],
    [43.5, -5],
    [43.6, -8],
    [43, -9.2],
    [42, -8.9],
    [40, -8.8],
    [38.7, -9.5],
    [37, -9],
    [36.9, -7.5],
    [36.2, -6.2],
    [35.8, -5.9],
    [35.2, -6.2],
    [33, -8.5],
    [31, -9.8],
    [28, -12.5],
    [26, -14.5],
    [24, -16],
    [21, -17],
    [18, -16.2],
    [15, -17.4],
    [12, -16.8],
    [10, -14.5],
    [8, -13.2],
    [6, -10.8],
    [4.8, -8],
    [4.6, -5],
    [0, -5],
    [0, -5],
  ],
  [
    [0, -50],
    [1.7, -50],
    [4, -51.8],
    [5.8, -54.5],
    [6.8, -58.2],
    [8.5, -60],
    [10.1, -61.8],
    [10.7, -62],
    [10.6, -64.5],
    [10.5, -66.5],
    [11.5, -68.5],
    [12, -70],
    [0, -70],
  ],
  [
    [45, -61],
    [44.6, -63],
    [43.5, -65.7],
    [44.3, -67],
    [43.9, -69],
    [43, -70],
    [45, -70],
  ],
  [
    [18.5, -67.3],
    [18.5, -65.6],
    [17.9, -65.6],
    [17.9, -67.3],
  ],
  [
    [19.9, -70],
    [19.8, -69],
    [18.4, -68.3],
    [18.1, -70],
  ],
  [
    [10.85, -61.95],
    [10.85, -60.9],
    [10.05, -60.9],
    [10.05, -61.95],
  ],
]

export const OCEAN_ISLANDS: { name: string; pos: LatLon }[] = [
  { name: 'Gran Canaria', pos: [28.0, -15.6] },
  { name: '', pos: [28.3, -16.6] },
  { name: '', pos: [29.0, -13.6] },
  { name: 'Madeira', pos: [32.7, -17.0] },
  { name: 'Azores', pos: [38.5, -28.0] },
  { name: '', pos: [37.8, -25.5] },
  { name: '', pos: [39.4, -31.2] },
  { name: 'Cabo Verde', pos: [16.0, -24.0] },
  { name: '', pos: [16.8, -25.0] },
  { name: '', pos: [15.0, -23.5] },
  { name: 'Bermuda', pos: [32.3, -64.8] },
  { name: 'Antigua', pos: [17.07, -61.8] },
  { name: '', pos: [16.2, -61.6] },
  { name: '', pos: [15.4, -61.35] },
  { name: '', pos: [14.6, -61.0] },
  { name: '', pos: [13.9, -60.97] },
  { name: '', pos: [13.1, -59.55] },
  { name: '', pos: [13.25, -61.2] },
  { name: '', pos: [12.1, -61.7] },
  { name: '', pos: [17.3, -62.7] },
  { name: '', pos: [18.2, -63.05] },
]

export function inPolygon(p: LatLon, poly: LatLon[]): boolean {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]
    const b = poly[j]
    if (a[0] > p[0] !== b[0] > p[0] && p[1] < ((b[1] - a[1]) * (p[0] - a[0])) / (b[0] - a[0]) + a[1]) c = !c
  }
  return c
}

export function legOnLand(a: LatLon, b: LatLon): boolean {
  const n = Math.max(4, Math.ceil(nmBetween(a, b) / 20))
  for (let i = 1; i < n; i++) {
    const q: LatLon = [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]
    if (OCEAN_LAND.some((poly) => inPolygon(q, poly))) return true
  }
  return false
}

export interface SimResult {
  days: number
  nm: number
  avg: number
  calmH: number
  galeH: number
  /** Hours spent south of 25°N and west of 40°W in the hurricane season. */
  hurricaneH: number
  onLand: boolean
  /** Positions every step, for the animation. */
  track: LatLon[]
  /** Wind met every step. */
  winds: Wind[]
}

/** Sails the route in 3-hour steps along straight legs through the season's wind field. */
export function sailRoute(season: Season, route: LatLon[], stepH = 3): SimResult {
  const track: LatLon[] = [route[0]]
  const winds: Wind[] = []
  let hours = 0
  let calmH = 0
  let galeH = 0
  let hurricaneH = 0
  let nm = 0
  let onLand = false
  for (let i = 0; i + 1 < route.length; i++) {
    const a = route[i]
    const b = route[i + 1]
    if (legOnLand(a, b)) onLand = true
    const legNm = nmBetween(a, b)
    nm += legNm
    let done = 0
    const crs = courseBetween(a, b)
    while (done < legNm - 1e-6) {
      const k = done / legNm
      const pos: LatLon = [a[0] + k * (b[0] - a[0]), a[1] + k * (b[1] - a[1])]
      const w = oceanWind(season, pos[0], pos[1])
      const twa = mod(w.from - crs + 180, 360) - 180
      const v = boatSpeed(w.kn, twa)
      const go = Math.min(v * stepH, legNm - done)
      const h = go / v
      hours += h
      if (w.kn < 5) calmH += h
      if (w.kn >= 34) galeH += h
      if (season.hurricanes && pos[0] < 25 && pos[1] < -40) hurricaneH += h
      done += go
      const k2 = done / legNm
      track.push([a[0] + k2 * (b[0] - a[0]), a[1] + k2 * (b[1] - a[1])])
      winds.push(w)
      if (hours > 24 * 90) break
    }
  }
  return { days: hours / 24, nm, avg: nm / Math.max(1e-6, hours), calmH, galeH, hurricaneH, onLand, track, winds }
}

export const PRESET_ROUTES: { id: 'rhumb' | 'butter' | 'south' | 'north'; pts: LatLon[] }[] = [
  { id: 'rhumb', pts: [START, FINISH] },
  {
    id: 'butter',
    pts: [START, [23.5, -19.5], [18.5, -28], [15.5, -45], FINISH],
  },
  { id: 'south', pts: [START, [16, -21], [7, -30], [9, -50], FINISH] },
  { id: 'north', pts: [START, [33, -25], [33, -50], FINISH] },
]
