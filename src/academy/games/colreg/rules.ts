import { norm180, norm360 } from '../../core/units'
import type { RowAnswer, RowScenario, VesselKind } from './data'

/** Rule 18 responsibilities: higher rank = more privileged. */
const RANK: Record<VesselKind, number> = { nuc: 6, ram: 5, cbd: 4, fishing: 3, sail: 2, power: 1, motorsail: 1, tanker: 1 }

const isSail = (k: VesselKind) => k === 'sail'

/** Positive TWA = wind over starboard (starboard tack); |twa| > 170 counts as "cannot tell". */
function tack(heading: number, windFrom: number): 'port' | 'starboard' | 'unknown' {
  const twa = norm180(windFrom - heading)
  if (Math.abs(twa) > 170) return 'unknown'
  return twa > 0 ? 'starboard' : 'port'
}

/** More than 22.5° abaft the beam of a vessel with heading h, seen from that vessel. */
function abaftBeam(relBearing: number): boolean {
  const r = norm360(relBearing)
  return r > 112.5 && r < 247.5
}

/**
 * Decide what the OWN vessel (heading 000) must do. Simplified to the situations used in the
 * practice set: overtaking, narrow channels/TSS, Rule 18 hierarchy, Rule 12 between sailing
 * vessels, and Rules 14/15 between power-driven vessels.
 */
export function decide(s: RowScenario): RowAnswer {
  const otherFromUs = s.bearing
  const usFromOther = norm360(s.bearing + 180 - s.otherHeading)
  const similarCourse = Math.abs(norm180(s.otherHeading)) < 67.5

  // Rule 13: overtaking overrides everything else.
  if (similarCourse && abaftBeam(otherFromUs)) return 'standOn'
  if (similarCourse && abaftBeam(usFromOther)) return 'giveWay'

  // Rules 9 and 10: do not impede a vessel confined to a channel or lane.
  if (s.channel && (isSail(s.own) || s.own === 'motorsail')) return 'giveWay'

  if (RANK[s.own] !== RANK[s.other]) return RANK[s.own] < RANK[s.other] ? 'giveWay' : 'standOn'

  if (isSail(s.own) && isSail(s.other)) {
    const ownTack = tack(0, s.windFromDeg)
    const otherTack = tack(s.otherHeading, s.windFromDeg)
    const rad = (s.bearing * Math.PI) / 180
    const rel = { x: Math.sin(rad), y: Math.cos(rad) }
    const wr = (s.windFromDeg * Math.PI) / 180
    const otherIsWindward = rel.x * Math.sin(wr) + rel.y * Math.cos(wr) > 0
    if (otherTack === 'unknown') return ownTack === 'port' && otherIsWindward ? 'giveWay' : 'standOn'
    if (ownTack !== otherTack) return ownTack === 'port' ? 'giveWay' : 'standOn'
    return otherIsWindward ? 'standOn' : 'giveWay'
  }

  // Power-driven vessels.
  const headOn = Math.abs(norm180(s.bearing)) <= 6 && Math.abs(norm180(s.otherHeading - 180)) <= 10
  if (headOn) return 'bothStarboard'
  return norm360(s.bearing) < 180 ? 'giveWay' : 'standOn'
}
