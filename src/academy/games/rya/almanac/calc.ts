import type { DiamondRow, LatLon, LegSpec, Scenario, SecondaryPort, TideEvent } from './scenario'

const DEG = Math.PI / 180
export const r1 = (v: number) => Math.round(v * 10) / 10
export const mod = (a: number, n: number) => ((a % n) + n) % n

/** Minutes → "HHMM" (wraps round midnight). */
export function fmtHM(min: number): string {
  const m = mod(Math.round(min), 1440)
  return `${String(Math.floor(m / 60)).padStart(2, '0')}${String(m % 60).padStart(2, '0')}`
}
export const fmtLocal = (s: Scenario, utMin: number) => fmtHM(utMin + s.offset)
export const fmtDiff = (min: number) => `${min < 0 ? '−' : '+'}${fmtHM(Math.abs(min))}`
export const fmtBrg = (deg: number) => `${String(mod(Math.round(deg), 360)).padStart(3, '0')}°`
export const hourLabel = (k: number) => (k === 0 ? 'HW' : `HW${k > 0 ? '+' : '−'}${Math.abs(k)}`)

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
export function heightDifference(s: Scenario, stdH: number, kind: 'HW' | 'LW'): number {
  const L = s.tidal!.standard.levels
  const d = s.tidal!.secondary!.hDiff
  if (kind === 'HW') return d.mhwn + ((d.mhws - d.mhwn) * (stdH - L.mhwn)) / (L.mhws - L.mhwn)
  return d.mlws + ((d.mlwn - d.mlws) * (stdH - L.mlws)) / (L.mlwn - L.mlws)
}

export interface SecondaryEvent extends TideEvent {
  std: TideEvent
  tDiff: number
  hDiff: number
}

export function secEvent(s: Scenario, std: TideEvent): SecondaryEvent {
  const sec = s.tidal!.secondary as SecondaryPort
  const raw = std.kind === 'HW' ? timeDifference(std.t, sec.hwTimes, sec.hwDiff) : timeDifference(std.t, sec.lwTimes, sec.lwDiff)
  const tDiff = Math.round(raw)
  const hDiff = r1(heightDifference(s, std.h, std.kind))
  return { std, kind: std.kind, t: std.t + tDiff, h: r1(std.h + hDiff), tDiff, hDiff }
}

/** Standard-port events of the day with the neighbouring days attached (times relative to this day's midnight). */
export function stdEvents(s: Scenario, day: number): TideEvent[] {
  const out: TideEvent[] = []
  for (const row of s.tidal!.standard.table) {
    const off = (row.day - day) * 1440
    if (Math.abs(row.day - day) <= 1) for (const e of row.events) out.push({ ...e, t: e.t + off })
  }
  return out.sort((a, b) => a.t - b.t)
}

export const secEvents = (s: Scenario, day: number): SecondaryEvent[] => stdEvents(s, day).map((e) => secEvent(s, e))

export function dayEvents(s: Scenario, day: number): TideEvent[] {
  return s.tidal!.standard.table.find((r) => r.day === day)?.events ?? []
}

/** The HW that governs the plan and the LW before it. */
export function mainTide(s: Scenario, day: number): { lw: TideEvent; hw: TideEvent; range: number } {
  const ev = stdEvents(s, day)
  const i = ev.findIndex((e) => e.kind === 'HW' && e.t >= s.tidal!.mainHwAfter)
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

/** Height at time t between tide events: rule of twelfths with "tidal hours" = duration / 6. */
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

/** Time between two events at which the tide reaches `need`. */
export function timeForHeight(a: TideEvent, b: TideEvent, need: number): number | null {
  const frac = (need - a.h) / (b.h - a.h)
  if (frac < 0 || frac > 1) return null
  return a.t + twelfthsHours(frac) * ((b.t - a.t) / 6)
}

export const gateEvents = (s: Scenario, day: number): TideEvent[] => (s.tidal?.gate?.port === 'secondary' ? secEvents(s, day) : stdEvents(s, day))
export const gatePortName = (s: Scenario) => (s.tidal?.gate?.port === 'secondary' ? s.tidal.secondary!.name : s.tidal!.standard.name)
export const neededHeight = (s: Scenario) => r1(s.tidal!.gate!.drying + s.boat.draft + s.boat.clearance)

export interface GateWindow {
  open: number
  close: number
  lw: TideEvent
  hw: TideEvent
  lw2: TideEvent
  need: number
}

/** Window round the gate-port HW nearest to `around` (default: the HW that goes with the main tide). */
export function gateWindow(s: Scenario, day: number, around?: number): GateWindow | null {
  if (!s.tidal?.gate) return null
  const ev = gateEvents(s, day)
  const ref = around ?? mainTide(s, day).hw.t + 30
  let i = -1
  for (let k = 1; k + 1 < ev.length; k++) if (ev[k].kind === 'HW' && (i < 0 || Math.abs(ev[k].t - ref) < Math.abs(ev[i].t - ref))) i = k
  if (i < 0) return null
  const need = neededHeight(s)
  const open = timeForHeight(ev[i - 1], ev[i], need)
  const close = timeForHeight(ev[i], ev[i + 1], need)
  if (open === null || close === null) return null
  return { open: Math.round(open), close: Math.round(close), lw: ev[i - 1], hw: ev[i], lw2: ev[i + 1], need }
}

/* ---------------- Tidal streams ---------------- */

export function rangeFactor(s: Scenario, range: number): number {
  const t = s.tidal!.standard
  return (range - t.neapRange) / (t.springRange - t.neapRange)
}

export function streamRate(s: Scenario, row: DiamondRow, range: number): number {
  return Math.max(0, r1(row.np + (row.sp - row.np) * rangeFactor(s, range)))
}

/** Hour of the stream table (−6…+6) for time t, relative to the nearest standard-port HW. */
export function streamHour(s: Scenario, day: number, t: number): { hour: number; hw: TideEvent } {
  const hws = stdEvents(s, day).filter((e) => e.kind === 'HW')
  let best = hws[0]
  for (const h of hws) if (Math.abs(t - h.t) < Math.abs(t - best.t)) best = h
  return { hour: Math.max(-6, Math.min(6, Math.round((t - best.t) / 60))), hw: best }
}

export const diamondOf = (s: Scenario, id: string) => s.diamonds.find((d) => d.id === id)!

/** Is the stream in this diamond row going our way? */
export function isFair(s: Scenario, row: DiamondRow): boolean {
  return Math.cos((row.set - s.overallTrack) * DEG) > 0.2
}

/* ---------------- Route ---------------- */

/** Plane sailing: true bearing (°) and distance (nm) between two positions in minutes. */
export function legGeometry(a: LatLon, b: LatLon): { dlat: number; dep: number; dlong: number; brg: number; nm: number } {
  const dlat = b.lat - a.lat
  const meanLat = (a.lat + b.lat) / 2 / 60
  const dlong = b.lon - a.lon
  const dep = dlong * Math.cos(meanLat * DEG)
  return { dlat, dep, dlong, brg: mod(Math.atan2(dep, dlat) / DEG, 360), nm: Math.hypot(dlat, dep) }
}

/** Moves a position `nm` miles towards `brg` (°T). */
export function moveBy(p: LatLon, brg: number, nm: number): LatLon {
  const dlat = nm * Math.cos(brg * DEG)
  const dep = nm * Math.sin(brg * DEG)
  return { lat: p.lat + dlat, lon: p.lon + dep / Math.cos(((p.lat + dlat / 2) / 60) * DEG) }
}

export const toMagnetic = (s: Scenario, trueDeg: number) => mod(trueDeg - s.variation, 360)
export const fmtVariation = (s: Scenario) => `${Math.abs(s.variation)}°${s.variation < 0 ? 'W' : 'E'}`

export function fmtPos(p: LatLon): string {
  const f = (v: number, pos: string, neg: string, w: number) => {
    const a = Math.abs(v)
    const d = Math.floor(a / 60 + 1e-9)
    const m = Math.round((a - d * 60) * 100) / 100
    const ms = m % 0.1 < 0.001 || m % 0.1 > 0.099 ? m.toFixed(1) : m.toFixed(2)
    return `${String(d).padStart(w, '0')}°${ms.padStart(ms.length === 3 ? 4 : 5, '0')}′${v >= 0 ? pos : neg}`
  }
  return `${f(p.lat, 'N', 'S', 2)} ${f(p.lon, 'E', 'W', 3)}`
}

export interface CtsResult {
  /** True heading to steer. */
  heading: number
  sog: number
  /** Degrees the bow points off the track (+ = to starboard of track). */
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
  a: LatLon
  b: LatLon
  track: number
  nm: number
  start: number
  /** Stream table hour, or null for a steady current. */
  hour: number | null
  diamond: string | null
  set: number
  rate: number
  sp?: number
  np?: number
  cts: number
  ctsM: number
  offset: number
  sog: number
  minutes: number
  end: number
  /** Fixed-heading leg across a traffic separation scheme. */
  fixed: boolean
  /** Sideways set while crossing the lane (miles, + = to starboard of the heading). */
  setNm?: number
}

export interface PassagePlan {
  day: number
  range: number | null
  factor: number | null
  castOff: number
  depart: number
  legs: LegPlan[]
  /** Time at the depth gate (arrival bar, or departure sill = cast-off). */
  barEta: number
  barHeight: number | null
  need: number | null
  window: { open: number; close: number } | null
  /** Arrival at the berth or anchorage. */
  anchor: number
  /** Stream against us on any course-to-steer leg. */
  foul: boolean
  barOk: boolean
}

const minutesFor = (nm: number, kn: number) => Math.round((nm / kn) * 60)

function streamFor(s: Scenario, spec: LegSpec, day: number, t: number, range: number | null, scale: number) {
  if ('current' in spec) return { hour: null, diamond: null, set: spec.current.set, rate: r1(spec.current.rate * scale) }
  const d = diamondOf(s, spec.diamond)
  const { hour } = streamHour(s, day, t)
  const row = d.rows[hour + 6]
  return { hour, diamond: d.id, set: row.set, rate: streamRate(s, row, range!), sp: row.sp, np: row.np }
}

/** Runs the whole passage from WPT1 at `depart` (UT minutes). `scale` multiplies steady currents. */
export function planPassage(s: Scenario, day: number, depart: number, scale = 1): PassagePlan {
  const range = s.tidal ? mainTide(s, day).range : null
  const speed = s.boat.speed
  let t = depart
  let pos: LatLon = s.waypoints[0]
  let fromId = s.waypoints[0].id
  const plan: LegPlan[] = s.legs.map((spec) => {
    const start = t
    if ('heading' in spec) {
      // Hold the heading across the lane and accept the sideways set of the stream.
      let minutes = minutesFor(spec.crossNm, speed)
      let st = streamFor(s, spec, day, t + minutes / 2, range, scale)
      for (let k = 0; k < 4; k++) {
        st = streamFor(s, spec, day, t + minutes / 2, range, scale)
        const along = speed + st.rate * Math.cos((st.set - spec.heading) * DEG)
        minutes = Math.round((spec.crossNm / along) * 60)
      }
      const h = minutes / 60
      const east = speed * Math.sin(spec.heading * DEG) + st.rate * Math.sin(st.set * DEG)
      const north = speed * Math.cos(spec.heading * DEG) + st.rate * Math.cos(st.set * DEG)
      const track = mod(Math.atan2(east, north) / DEG, 360)
      const sog = Math.hypot(east, north)
      const b = moveBy(pos, track, sog * h)
      const lp: LegPlan = {
        from: fromId,
        to: 'TSS',
        a: pos,
        b,
        track: Math.round(track),
        nm: r1(sog * h),
        start,
        ...st,
        cts: spec.heading,
        ctsM: Math.round(toMagnetic(s, spec.heading)),
        offset: mod(spec.heading - track + 180, 360) - 180,
        sog: r1(sog),
        minutes,
        end: start + minutes,
        fixed: true,
        setNm: r1(st.rate * Math.sin((st.set - spec.heading) * DEG) * h),
      }
      pos = b
      fromId = 'TSS'
      t += minutes
      return lp
    }
    const target = s.waypoints[spec.to]
    const g = legGeometry(pos, target)
    const track = Math.round(g.brg)
    const nm = r1(g.nm)
    // The stream is taken for the hour containing the middle of the leg; iterate because the leg time depends on it.
    let minutes = minutesFor(nm, speed)
    let st = streamFor(s, spec, day, t + minutes / 2, range, scale)
    let c = courseToSteer(track, st.set, st.rate, speed) ?? { heading: track, sog: speed - st.rate, offset: 0 }
    let sog = speed
    for (let k = 0; k < 4; k++) {
      st = streamFor(s, spec, day, t + minutes / 2, range, scale)
      c = courseToSteer(track, st.set, st.rate, speed) ?? { heading: track, sog: speed - st.rate, offset: 0 }
      sog = Math.max(0.5, r1(c.sog))
      minutes = minutesFor(nm, sog)
    }
    const cts = Math.round(c.heading)
    const lp: LegPlan = { from: fromId, to: target.id, a: pos, b: target, track, nm, start, ...st, cts, ctsM: Math.round(toMagnetic(s, cts)), offset: c.offset, sog, minutes, end: start + minutes, fixed: false }
    pos = target
    fromId = target.id
    t += minutes
    return lp
  })
  const castOff = depart - minutesFor(s.harbourOut.nm, s.harbourOut.kn)
  const gate = s.tidal?.gate
  const barEta = gate?.at === 'depart' ? castOff : t + minutesFor(s.approach.nm, s.approach.kn)
  const w = gate ? gateWindow(s, day, barEta) : null
  const arrive = (gate?.at === 'depart' ? t + minutesFor(s.approach.nm, s.approach.kn) : barEta) + minutesFor(s.final.nm, s.final.kn)
  return {
    day,
    range,
    factor: range === null ? null : rangeFactor(s, range),
    castOff,
    depart,
    legs: plan,
    barEta,
    barHeight: gate ? r1(heightAt(gateEvents(s, day), barEta)) : null,
    need: gate ? neededHeight(s) : null,
    window: w ? { open: w.open, close: w.close } : null,
    anchor: arrive,
    foul: s.tidal ? plan.some((l) => !l.fixed && l.sog < speed) : false,
    barOk: !gate || (!!w && barEta >= w.open && barEta <= w.close),
  }
}

export const totalMinutes = (p: PassagePlan) => p.legs.reduce((a, l) => a + l.minutes, 0)
export const totalNm = (p: PassagePlan) => r1(p.legs.reduce((a, l) => a + l.nm, 0))
