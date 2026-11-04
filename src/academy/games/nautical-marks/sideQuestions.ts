import type { MarkId } from './marks'
import { markById } from './marks'
import { expectedLateralSide, bearingVec } from './passage'

export type SideQuestion =
  | { kind: 'cardinal'; markId: MarkId; answer: 'N' | 'E' | 'S' | 'W' }
  | { kind: 'lateral'; markId: MarkId; direction: 'in' | 'out'; answer: 'port' | 'starboard' }

const CARDINALS: MarkId[] = ['north', 'east', 'south', 'west']
const LATERALS: MarkId[] = ['port', 'starboard', 'port-spar', 'starboard-spar', 'pref-starboard', 'pref-port']

export function sideQuestion(markId: MarkId, direction: 'in' | 'out' = 'in'): SideQuestion {
  const rule = markById(markId).rule
  if (rule.kind === 'cardinal') return { kind: 'cardinal', markId, answer: rule.safeSide }
  if (rule.kind !== 'lateral') throw new Error(`${markId} has no side rule`)
  // The boat heads north; the harbour (direction of buoyage) is ahead when entering, behind when leaving.
  const buoyage = direction === 'in' ? 0 : 180
  return { kind: 'lateral', markId, direction, answer: expectedLateralSide(rule.keepOn, bearingVec(0), buoyage) }
}

export function makeSideDrill(count: number, rnd: () => number): SideQuestion[] {
  const out: SideQuestion[] = []
  for (let i = 0; i < count; i++) {
    let q: SideQuestion
    do {
      const pool = rnd() < 0.45 ? CARDINALS : LATERALS
      const id = pool[Math.floor(rnd() * pool.length)]
      q = sideQuestion(id, rnd() < 0.5 ? 'in' : 'out')
    } while (out.length && out[out.length - 1].markId === q.markId)
    out.push(q)
  }
  return out
}
