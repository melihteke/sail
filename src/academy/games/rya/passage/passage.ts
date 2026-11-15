import { pointInPolygon, segmentsIntersect } from '../../../core/polygon'
import { norm180, norm360, toDeg, toRad } from '../../../core/units'

/* ---------------- Tidal gate ---------------- */

export const PASSAGE = {
  distance: 18,
  boatSpeed: 5,
  /** HW at the destination, minutes after midnight. */
  hw: 13 * 60,
  hwHeight: 5.0,
  lwHeight: 0.8,
  /** The bar dries this much above chart datum. */
  barDries: 1.5,
  draft: 1.8,
  clearance: 0.5,
}

/** Tidal stream along the route (kn, + = fair) for each hour from HW-6 to HW+6. */
export const STREAM = [-0.5, 0.3, 1.2, 2.0, 2.2, 1.5, 0.4, -0.8, -1.8, -2.2, -1.9, -1.0, -0.3]

export function streamAt(minutes: number): number {
  const rel = (minutes - PASSAGE.hw) / 60 + 6
  if (rel <= 0) return STREAM[0]
  if (rel >= 12) return STREAM[12]
  const i = Math.floor(rel)
  return STREAM[i] + (STREAM[i + 1] - STREAM[i]) * (rel - i)
}

const TWELFTHS = [0, 1, 3, 6, 9, 11, 12]

/** Height of tide by the rule of twelfths, LW six hours either side of HW. */
export function heightAt(minutes: number, p = PASSAGE): number {
  const fromHw = Math.min(6, Math.abs(minutes - p.hw) / 60)
  const hoursFromLw = 6 - fromHw
  const i = Math.floor(hoursFromLw)
  const f = i >= 6 ? 12 : TWELFTHS[i] + (TWELFTHS[i + 1] - TWELFTHS[i]) * (hoursFromLw - i)
  return p.lwHeight + ((p.hwHeight - p.lwHeight) * f) / 12
}

export const NEEDED_HEIGHT = PASSAGE.barDries + PASSAGE.draft + PASSAGE.clearance

export interface PassageResult {
  depart: number
  arrive: number
  avgSog: number
  fairShare: number
  heightAtBar: number
  barOk: boolean
}

export function simulatePassage(depart: number): PassageResult {
  let t = depart
  let d = 0
  let fair = 0
  let n = 0
  while (d < PASSAGE.distance && t < depart + 12 * 60) {
    const s = streamAt(t)
    d += Math.max(0.5, PASSAGE.boatSpeed + s) / 60
    if (s > 0) fair++
    n++
    t++
  }
  const heightAtBar = heightAt(t)
  return { depart, arrive: t, avgSog: PASSAGE.distance / ((t - depart) / 60), fairShare: n ? fair / n : 0, heightAtBar, barOk: heightAtBar >= NEEDED_HEIGHT }
}

export function gateStars(r: PassageResult): 0 | 1 | 2 | 3 {
  if (!r.barOk) return 0
  if (r.avgSog >= 6.6) return 3
  if (r.avgSog >= 5.4) return 2
  return 1
}

export const fmtTime = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.round(m % 60)).padStart(2, '0')}`

/* ---------------- Clearing bearing ---------------- */

export interface Pt {
  x: number
  y: number
}

/** Chart in NM: x = east, y = north. The coast is to the east; a rocky ledge sticks out from it. */
export const CHURCH: Pt = { x: 2.6, y: 3.2 }
export const DANGER: Pt[] = [
  { x: 1.9, y: 0.6 },
  { x: 2.2, y: 0.35 },
  { x: 2.55, y: 0.7 },
  { x: 2.5, y: 1.25 },
  { x: 2.05, y: 1.1 },
]
export const LAND: Pt[] = [
  { x: 2.6, y: -3 },
  { x: 4, y: -3 },
  { x: 4, y: 4.5 },
  { x: 2.45, y: 4.5 },
  { x: 2.4, y: 3.0 },
  { x: 2.55, y: 1.4 },
  { x: 2.7, y: 0.8 },
  { x: 2.75, y: -1 },
]

export function bearingFrom(p: Pt, to: Pt): number {
  return norm360(toDeg(Math.atan2(to.x - p.x, to.y - p.y)))
}

export type ClearingCheck = { ok: true; rule: 'nmt' | 'nlt'; margin: number } | { ok: false; reason: 'crosses' | 'tooWide' | 'inside' }

/** A clearing line through the church that keeps us outside (west of) the ledge, hugging it within 8°. */
export function checkClearing(clearing: number): ClearingCheck {
  const back = toRad(clearing + 180)
  const far = { x: CHURCH.x + Math.sin(back) * 8, y: CHURCH.y + Math.cos(back) * 8 }
  for (let i = 0; i < DANGER.length; i++) {
    if (segmentsIntersect(CHURCH, far, DANGER[i], DANGER[(i + 1) % DANGER.length])) return { ok: false, reason: 'crosses' }
  }
  const off = DANGER.map((v) => norm180(bearingFrom(v, CHURCH) - clearing))
  if (off.every((o) => o > 0)) return { ok: false, reason: 'inside' }
  if (!off.every((o) => o < 0)) return { ok: false, reason: 'crosses' }
  const margin = Math.min(...off.map(Math.abs))
  if (margin > 8) return { ok: false, reason: 'tooWide' }
  return { ok: true, rule: 'nlt', margin }
}

/** Safe side of a "NOT LESS THAN" clearing bearing, using the bearing read on the compass (whole degrees). */
export function isSafe(bearing: number, clearing: number): boolean {
  return norm180(Math.round(bearing) - clearing) >= 0
}

export const PILOT_START: Pt = { x: 0.3, y: -2.2 }
export const END_Y = 1.6
/** Each leg the boat makes 0.55 NM north while the flood sets her 0.35 NM east. */
export const LEG = { dx: 0.35, dy: 0.55 }
export type Decision = 'hold' | 'port' | 'starboard'

export function nextPosition(p: Pt, d: Decision): Pt {
  const alter = d === 'port' ? -0.9 : d === 'starboard' ? 0.5 : 0
  return { x: p.x + LEG.dx + alter, y: p.y + LEG.dy }
}

export function inDanger(p: Pt): boolean {
  return pointInPolygon(p, DANGER) || pointInPolygon(p, LAND)
}

export function decisionCorrect(bearing: number, clearing: number, d: Decision): boolean {
  return isSafe(bearing, clearing) ? d === 'hold' : d === 'port'
}
