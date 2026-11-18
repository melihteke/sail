import {
  APPROACH_TO_BAR,
  BAR_TO_ANCHOR,
  BOAT,
  DIAMONDS,
  GANNET,
  HALYARD,
  HALYARD_TABLE,
  HARBOUR_OUT,
  LEG_DIAMOND,
  SUMMER_OFFSET_MIN,
  VARIATION_W,
  WAYPOINTS,
  type DiamondRow,
  type LatLon,
  type TideEvent,
} from './data'

const DEG = Math.PI / 180
export const r1 = (v: number) => Math.round(v * 10) / 10
export const mod = (a: number, n: number) => ((a % n) + n) % n

/** 0–1439 minutes → "HHMM". */
export function fmtHM(min: number): string {
  const m = mod(Math.round(min), 1440)
  return `${String(Math.floor(m / 60)).padStart(2, '0')}${String(m % 60).padStart(2, '0')}`
}
export const fmtLocal = (utMin: number) => fmtHM(utMin + SUMMER_OFFSET_MIN)
export const fmtDiff = (min: number) => `${min < 0 ? '−' : '+'}${fmtHM(Math.abs(min))}`
export const fmtBrg = (deg: number) => `${String(mod(Math.round(deg), 360)).padStart(3, '0')}°`
export const fmtH = (m: number) => m.toFixed(1)

/* ---------------- Secondary port ---------------- */

/** Interpolates a time difference from four reference times spaced round the clock. */
export function timeDifference(stdT: number, times: number[], diffs: number[]): number {
  const t = mod(stdT, 1440)
  const n = times.length
  for (let i = 0; i < n; i++) {
    const a = times[i]
    const b = i + 1 < n ? times[i + 1] : times[0] + 1440
    const tt = t < a ? t + 1440 : t
    if (tt >= a && tt <= b) {
      const f = (tt - a) / (b - a)
      return diffs[i] + (diffs[(i + 1) % n] - diffs[i]) * f
    }
  }
  return diffs[0]
}

/** Height difference at a secondary port, interpolated between neap and spring levels. */
export function heightDifference(stdH: number, kind: 'HW' | 'LW'): number {
  const L = HALYARD.levels
  const d = GANNET.hDiff
  if (kind === 'HW') return d.mhwn + ((d.mhws - d.mhwn) * (stdH - L.mhwn)) / (L.mhws - L.mhwn)
  return d.mlws + ((d.mlwn - d.mlws) * (stdH - L.mlws)) / (L.mlwn - L.mlws)
}

export interface SecondaryEvent extends TideEvent {
  std: TideEvent
  tDiff: number
  hDiff: number
}

export function gannetEvent(std: TideEvent): SecondaryEvent {
  const raw = std.kind === 'HW' ? timeDifference(std.t, GANNET.hwTimes, GANNET.hwDiff) : timeDifference(std.t, GANNET.lwTimes, GANNET.lwDiff)
  const tDiff = Math.round(raw)
  const hDiff = r1(heightDifference(std.h, std.kind))
  return { std, kind: std.kind, t: std.t + tDiff, h: r1(std.h + hDiff), tDiff, hDiff }
}

/** The day's events with the neighbouring days' events attached (times relative to this day's midnight). */
export function halyardEvents(day: number): TideEvent[] {
  const out: TideEvent[] = []
  for (const row of HALYARD_TABLE) {
    const off = (row.day - day) * 1440
    if (Math.abs(row.day - day) <= 1) for (const e of row.events) out.push({ ...e, t: e.t + off })
  }
  return out.sort((a, b) => a.t - b.t)
}

export const gannetEvents = (day: number): SecondaryEvent[] => halyardEvents(day).map(gannetEvent)

export function dayEvents(day: number): TideEvent[] {
  return HALYARD_TABLE.find((r) => r.day === day)?.events ?? []
}

/** Morning HW of the day (first HW after 0600 UT) and the LW before it. */
export function mainTide(day: number): { lw: TideEvent; hw: TideEvent; range: number } {
  const ev = halyardEvents(day)
  const i = ev.findIndex((e) => e.kind === 'HW' && e.t >= 360)
  const hw = ev[i]
  const lw = ev[i - 1]
  return { lw, hw, range: r1(hw.h - lw.h) }
}

/* ---------------- Height of tide ---------------- */

const TWELFTHS = [0, 1, 3, 6, 9, 11, 12]

/** Fraction (0–1) of the range covered after `x` tidal hours (0–6) by the rule of twelfths. */
export function twelfthsFraction(x: number): number {
  const c = Math.max(0, Math.min(6, x))
  const i = Math.min(5, Math.floor(c))
  return (TWELFTHS[i] + (TWELFTHS[i + 1] - TWELFTHS[i]) * (c - i)) / 12
}

/** Inverse: tidal hours needed to cover a fraction of the range. */
export function twelfthsHours(frac: number): number {
  const target = Math.max(0, Math.min(1, frac)) * 12
  for (let i = 0; i < 6; i++) {
    if (target <= TWELFTHS[i + 1]) return i + (target - TWELFTHS[i]) / (TWELFTHS[i + 1] - TWELFTHS[i])
  }
  return 6
}

/** Height at time t (minutes) between tide events, rule of twelfths with "tidal hours" = duration / 6. */
export function heightAt(events: TideEvent[], t: number): number {
  for (let i = 0; i + 1 < events.length; i++) {
    const a = events[i]
    const b = events[i + 1]
    if (t >= a.t && t <= b.t) {
      const hour = (b.t - a.t) / 6
      return a.h + (b.h - a.h) * twelfthsFraction((t - a.t) / hour)
    }
  }
  return t < events[0].t ? events[0].h : events[events.length - 1].h
}

/** First time between two events at which the tide reaches `need` (rising) or falls to it (falling). */
export function timeForHeight(a: TideEvent, b: TideEvent, need: number): number | null {
  const range = b.h - a.h
  const frac = (need - a.h) / range
  if (frac < 0 || frac > 1) return null
  return a.t + twelfthsHours(frac) * ((b.t - a.t) / 6)
}

export const neededHeight = () => r1(GANNET.barDrying + BOAT.draft + BOAT.clearance)

/** Window around the Gannet Cove HW that follows the morning Port Halyard HW. */
export function barWindow(day: number): { open: number; close: number; lw: TideEvent; hw: TideEvent; lw2: TideEvent; need: number } {
  const ev = gannetEvents(day)
  const main = mainTide(day)
  const i = ev.findIndex((e) => e.std.t === main.hw.t)
  const lw = ev[i - 1]
  const hw = ev[i]
  const lw2 = ev[i + 1]
  const need = neededHeight()
  return { open: Math.round(timeForHeight(lw, hw, need)!), close: Math.round(timeForHeight(hw, lw2, need)!), lw, hw, lw2, need }
}

/* ---------------- Tidal streams ---------------- */

export function rangeFactor(range: number): number {
  return (range - HALYARD.neapRange) / (HALYARD.springRange - HALYARD.neapRange)
}

export function streamRate(row: DiamondRow, range: number): number {
  return Math.max(0, r1(row.np + (row.sp - row.np) * rangeFactor(range)))
}

/** Hour of the stream table (−6…+6) for time t, relative to the nearest Port Halyard HW. */
export function streamHour(day: number, t: number): { hour: number; hw: TideEvent } {
  const hws = halyardEvents(day).filter((e) => e.kind === 'HW')
  let best = hws[0]
  for (const h of hws) if (Math.abs(t - h.t) < Math.abs(t - best.t)) best = h
  return { hour: Math.max(-6, Math.min(6, Math.round((t - best.t) / 60))), hw: best }
}

export const hourLabel = (k: number) => (k === 0 ? 'HW' : `HW${k > 0 ? '+' : '−'}${Math.abs(k)}`)

/* ---------------- Route ---------------- */

/** Plane sailing: true bearing (°) and distance (nm) between two positions in minutes. */
export function legGeometry(a: LatLon, b: LatLon): { dlat: number; dep: number; brg: number; nm: number } {
  const dlat = b.lat - a.lat
  const meanLat = (a.lat + b.lat) / 2 / 60
  const dep = (b.lon - a.lon) * Math.cos(meanLat * DEG)
  return { dlat, dep, brg: mod(Math.atan2(dep, dlat) / DEG, 360), nm: Math.hypot(dlat, dep) }
}

export const toMagnetic = (trueDeg: number) => mod(trueDeg + VARIATION_W, 360)

export function fmtPos(p: LatLon): string {
  const f = (v: number, pos: string, neg: string, w: number) => {
    const a = Math.abs(v)
    const d = Math.floor(a / 60 + 1e-9)
    const m = a - d * 60
    return `${String(d).padStart(w, '0')}°${m.toFixed(1).padStart(4, '0')}′${v >= 0 ? pos : neg}`
  }
  return `${f(p.lat, 'N', 'S', 2)} ${f(p.lon, 'E', 'W', 3)}`
}

export interface CtsResult {
  /** True heading to steer. */
  heading: number
  sog: number
  /** Degrees the bow points up-stream of the track (+ = to starboard of track). */
  offset: number
}

/** Course to steer so that water track + stream lies along `track`. Null if the stream is too strong. */
export function courseToSteer(track: number, set: number, rate: number, speed: number): CtsResult | null {
  const cross = (rate * Math.sin((set - track) * DEG)) / speed
  if (Math.abs(cross) > 1) return null
  const offset = -Math.asin(cross) / DEG
  const heading = mod(track + offset, 360)
  const sog = speed * Math.cos(offset * DEG) + rate * Math.cos((set - track) * DEG)
  return { heading, sog, offset }
}

export interface LegPlan {
  from: string
  to: string
  track: number
  nm: number
  start: number
  hour: number
  diamond: 'A' | 'B'
  row: DiamondRow
  rate: number
  cts: number
  ctsM: number
  offset: number
  sog: number
  minutes: number
  end: number
}

export interface PassagePlan {
  day: number
  range: number
  factor: number
  castOff: number
  legs: LegPlan[]
  barEta: number
  barHeight: number
  need: number
  window: { open: number; close: number }
  anchor: number
  /** Stream against us on any leg. */
  foul: boolean
  barOk: boolean
}

export function legs() {
  return WAYPOINTS.slice(1).map((b, i) => {
    const a = WAYPOINTS[i]
    const g = legGeometry(a, b)
    return { from: a.id, to: b.id, track: Math.round(g.brg), nm: r1(g.nm), dlat: g.dlat, dep: g.dep }
  })
}

const minutesFor = (nm: number, kn: number) => Math.round((nm / kn) * 60)

/** Runs the passage from WPT1 at `depart` (UT minutes). */
export function planPassage(day: number, depart: number): PassagePlan {
  const { range } = mainTide(day)
  let t = depart
  const plan: LegPlan[] = legs().map((leg, i) => {
    const id = LEG_DIAMOND[i]
    const d = DIAMONDS.find((x) => x.id === id)!
    // The stream is taken for the hour containing the middle of the leg; iterate because the leg time depends on it.
    let minutes = minutesFor(leg.nm, BOAT.speed)
    let hour = 0
    let row = d.rows[6]
    let rate = 0
    let c = courseToSteer(leg.track, 0, 0, BOAT.speed)!
    let sog = BOAT.speed
    for (let k = 0; k < 4; k++) {
      hour = streamHour(day, t + minutes / 2).hour
      row = d.rows[hour + 6]
      rate = streamRate(row, range)
      c = courseToSteer(leg.track, row.set, rate, BOAT.speed) ?? { heading: leg.track, sog: BOAT.speed - rate, offset: 0 }
      sog = Math.max(0.5, r1(c.sog))
      minutes = minutesFor(leg.nm, sog)
    }
    const cts = Math.round(c.heading)
    const lp: LegPlan = { from: leg.from, to: leg.to, track: leg.track, nm: leg.nm, start: t, hour, diamond: id, row, rate, cts, ctsM: Math.round(toMagnetic(cts)), offset: c.offset, sog, minutes, end: t + minutes }
    t += minutes
    return lp
  })
  const barEta = t + minutesFor(APPROACH_TO_BAR.nm, APPROACH_TO_BAR.kn)
  const w = barWindow(day)
  const barHeight = r1(heightAt(gannetEvents(day), barEta))
  return {
    day,
    range,
    factor: rangeFactor(range),
    castOff: depart - minutesFor(HARBOUR_OUT.nm, HARBOUR_OUT.kn),
    legs: plan,
    barEta,
    barHeight,
    need: w.need,
    window: { open: w.open, close: w.close },
    anchor: barEta + minutesFor(BAR_TO_ANCHOR.nm, BAR_TO_ANCHOR.kn),
    foul: plan.some((l) => l.sog < BOAT.speed),
    barOk: barEta >= w.open && barEta <= w.close,
  }
}

/** The plan used throughout the worked example: leave WPT1 at 0630 UT (0730 local) on 13 June. */
export const PLAN_DEPART = 6 * 60 + 30
