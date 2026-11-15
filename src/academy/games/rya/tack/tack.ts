/** Timing rules for the crew during a tack and a controlled gybe. Angles are signed true wind angles. */

export type TackStep = 'loadWinch' | 'prepRelease' | 'ready' | 'letFly' | 'haul' | 'trim'
export type GybeStep = 'releasePreventer' | 'centreMain' | 'ready' | 'boomCross' | 'easeMain' | 'jibOver'

export const TACK_FROM = 45
export const TACK_TO = -45
export const GYBE_FROM = 150
export const GYBE_TO = -150

/** Where the bow is relative to the wind when the crew lets fly the old jib sheet. */
export function letFlyVerdict(twa: number): 'early' | 'good' | 'late' {
  if (twa > 12) return 'early'
  if (twa < -12) return 'late'
  return 'good'
}

/** The trim band where both jib telltales stream. */
export const TRIM_BAND: [number, number] = [0.82, 0.97]

export function trimVerdict(v: number): 'under' | 'good' | 'over' {
  if (v < TRIM_BAND[0]) return 'under'
  if (v > TRIM_BAND[1]) return 'over'
  return 'good'
}

/** Boom angle (degrees off the centreline) that counts as "centred" for a controlled gybe. */
export const CENTRED_BOOM = 15

export function gybeVerdict(boomDeg: number): 'controlled' | 'crash' {
  return boomDeg <= CENTRED_BOOM ? 'controlled' : 'crash'
}

/** Angle of the wind across the bow during a turn: from `from` to `to` going through 0 (tack) or 180 (gybe). */
export function turnAngle(from: number, to: number, f: number, through: 0 | 180): number {
  const k = Math.max(0, Math.min(1, f))
  if (through === 0) return from + (to - from) * k
  const a = from + (360 + to - from) * k
  return a > 180 ? a - 360 : a
}

export function penaltyStars(penalties: number): 1 | 2 | 3 {
  return penalties === 0 ? 3 : penalties <= 2 ? 2 : 1
}
