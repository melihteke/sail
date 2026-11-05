/**
 * A small "nautical almanac" for the sun, computed with Meeus' low-precision solar theory
 * (good to about 0.5′, plenty for training). Angles in degrees, longitude east positive.
 */

const RAD = Math.PI / 180
const DEG = 180 / Math.PI

export const norm360 = (x: number) => ((x % 360) + 360) % 360
export const wrap180 = (x: number) => norm360(x + 180) - 180

export function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5
}

export interface SunData {
  /** Greenwich hour angle */
  gha: number
  /** Declination, north positive */
  dec: number
  /** Semi-diameter in arc minutes */
  sdMin: number
  /** Equation of time in minutes (apparent − mean solar time) */
  eotMin: number
}

export function sunAt(date: Date): SunData {
  const jd = julianDay(date)
  const T = (jd - 2451545) / 36525
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
  const e = 0.016708634 - 0.000042037 * T
  const Mr = M * RAD
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) + 0.000289 * Math.sin(3 * Mr)
  const v = (M + C) * RAD
  const R = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(v))
  const omega = (125.04 - 1934.136 * T) * RAD
  const lambda = (L0 + C - 0.00569 - 0.00478 * Math.sin(omega)) * RAD
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - 0.001813 * T))) / 60) / 60
  const eps = (eps0 + 0.00256 * Math.cos(omega)) * RAD
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)) * DEG
  const dec = Math.asin(Math.sin(eps) * Math.sin(lambda)) * DEG
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - (T * T * T) / 38710000
  const gha = norm360(gmst - ra)
  const utHours = (((date.getTime() / 3600000) % 24) + 24) % 24
  const eotMin = wrap180(gha - (utHours * 15 - 180)) * 4
  return { gha, dec, sdMin: 959.63 / R / 60, eotMin }
}

/** UTC of local apparent noon (sun on the meridian) at a longitude, on the UTC day of `day`. */
export function localNoon(day: Date, lon: number): Date {
  const base = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate())
  let t = base + (12 - lon / 15) * 3600000
  for (let i = 0; i < 5; i++) {
    const { gha } = sunAt(new Date(t))
    // GHA grows ~15° per hour; on the meridian GHA + lon = 0.
    t -= (wrap180(gha + lon) / 15) * 3600000
  }
  return new Date(t)
}

/** Time of meridian passage at Greenwich, as printed on the almanac daily page (UTC). */
export const meridianPassage = (day: Date) => localNoon(day, 0)

export interface AltAz {
  /** Geometric altitude of the centre */
  alt: number
  /** True azimuth */
  zn: number
  lha: number
}

/** Calculated altitude (Hc) and azimuth (Zn) of a body for a position: the sight reduction formula. */
export function altAz(lat: number, lon: number, gha: number, dec: number): AltAz {
  const lha = norm360(gha + lon)
  const phi = lat * RAD
  const d = dec * RAD
  const h = lha * RAD
  const sinAlt = Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(h)
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * DEG
  const zn = norm360(Math.atan2(-Math.cos(d) * Math.sin(h), Math.sin(d) * Math.cos(phi) - Math.cos(d) * Math.sin(phi) * Math.cos(h)) * DEG)
  return { alt, zn, lha }
}

export function sunAltAt(date: Date, lat: number, lon: number): AltAz {
  const s = sunAt(date)
  return altAz(lat, lon, s.gha, s.dec)
}

/** Almanac daily page row: GHA and Dec at the whole hour, d = hourly change of Dec (arc minutes). */
export interface HourRow {
  hour: number
  gha: number
  dec: number
}

export function dailyPage(day: Date): { rows: HourRow[]; d: number; sdMin: number; merPass: Date; eotMin: number } {
  const base = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate())
  const rows: HourRow[] = []
  for (let hour = 0; hour <= 24; hour++) {
    const s = sunAt(new Date(base + hour * 3600000))
    rows.push({ hour, gha: s.gha, dec: s.dec })
  }
  const d = ((rows[13].dec - rows[12].dec) * 60)
  const noon = sunAt(new Date(base + 12 * 3600000))
  return { rows: rows.slice(0, 24), d, sdMin: noon.sdMin, merPass: meridianPassage(day), eotMin: noon.eotMin }
}

/** Increment of GHA for the sun/planets: 15° per hour exactly. */
export const sunIncrement = (minutes: number, seconds: number) => (minutes + seconds / 60) * 0.25

/** "v or d correction" table: correction (arc minutes) for a d value over `minutes` minutes. */
export const dCorrection = (dMin: number, minutes: number) => (dMin * minutes) / 60

/** Fit h = a·t² + b·t + c (least squares) and return the vertex: the time and height of the sun's maximum. */
export function fitMaximum(points: { t: number; h: number }[]): { t: number; h: number } | null {
  if (points.length < 3) return null
  const t0 = points.reduce((s, p) => s + p.t, 0) / points.length
  let s0 = 0, s1 = 0, s2 = 0, s3 = 0, s4 = 0, y0 = 0, y1 = 0, y2 = 0
  for (const p of points) {
    const x = p.t - t0
    s0 += 1
    s1 += x
    s2 += x * x
    s3 += x * x * x
    s4 += x * x * x * x
    y0 += p.h
    y1 += x * p.h
    y2 += x * x * p.h
  }
  // Solve the 3×3 normal equations with Cramer's rule.
  const det = (m: number[][]) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  const A = [
    [s4, s3, s2],
    [s3, s2, s1],
    [s2, s1, s0],
  ]
  const D = det(A)
  if (Math.abs(D) < 1e-12) return null
  const a = det([[y2, s3, s2], [y1, s2, s1], [y0, s1, s0]]) / D
  const b = det([[s4, y2, s2], [s3, y1, s1], [s2, y0, s0]]) / D
  const c = det([[s4, s3, y2], [s3, s2, y1], [s2, s1, y0]]) / D
  if (a >= 0) return null
  const x = -b / (2 * a)
  const ts = points.map((p) => p.t)
  if (x + t0 < Math.min(...ts) || x + t0 > Math.max(...ts)) return null
  return { t: x + t0, h: a * x * x + b * x + c }
}

/** Great-circle distance in nautical miles. */
export function distanceNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = lat1 * RAD
  const p2 = lat2 * RAD
  const dp = p2 - p1
  const dl = (lon2 - lon1) * RAD
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return 2 * Math.asin(Math.sqrt(a)) * DEG * 60
}

/** Round to 0.1′ like an almanac. */
export const roundTenthMin = (deg: number) => Math.round(deg * 600) / 600
