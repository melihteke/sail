import { pointInPolygon, polylineHitsPolygon } from '../../core/polygon'
import { markById, type MarkId } from './marks'

/** Chart coordinates: x to the east, y to the SOUTH (SVG convention), north is up. */
export interface Pt {
  x: number
  y: number
}

export type Poly = Pt[]

export interface PlacedMark {
  id: MarkId
  at: Pt
}

export interface ChartLevel {
  id: string
  region: 'nl' | 'med' | 'generic'
  night?: boolean
  width: number
  height: number
  land: Poly[]
  shoals: Poly[]
  /** Swimming / no-entry zones. */
  zones: Poly[]
  marks: PlacedMark[]
  start: Pt
  finish: Pt
  /** Direction of buoyage (compass bearing): the direction you travel when entering from sea. */
  buoyageDeg: number
}

export type ViolationKind = 'land' | 'shoal' | 'zone' | 'hitMark' | 'lateral' | 'cardinal' | 'danger'

export interface Violation {
  kind: ViolationKind
  /** Index into marks, or into land/shoals/zones for area hits. */
  index: number
  /** Where it happened, for highlighting. */
  at: Pt
  /** Lateral: the side the mark should have been left on. Cardinal: the safe side. */
  expected?: string
  /** Lateral: whether the boat was sailing with the direction of buoyage. */
  withBuoyage?: boolean
}

/** Distance within which a boat is considered to "pass" a lateral or cardinal mark. */
export const PASS_RADIUS = 130
export const HIT_RADIUS = 8

const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y })
const dot = (a: Pt, b: Pt) => a.x * b.x + a.y * b.y
const cross = (a: Pt, b: Pt) => a.x * b.y - a.y * b.x

/** Unit vector for a compass bearing in chart coordinates (y down). */
export function bearingVec(deg: number): Pt {
  const r = (deg * Math.PI) / 180
  return { x: Math.sin(r), y: -Math.cos(r) }
}

export { pointInPolygon, polylineHitsPolygon }

export interface ClosestApproach {
  point: Pt
  distance: number
  /** Unit direction of travel at that point. */
  dir: Pt
}

export function closestApproach(path: Pt[], target: Pt): ClosestApproach {
  let best: ClosestApproach = { point: path[0], distance: Infinity, dir: { x: 0, y: -1 } }
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]
    const ab = sub(path[i + 1], a)
    const len2 = dot(ab, ab)
    if (len2 === 0) continue
    const t = Math.max(0, Math.min(1, dot(sub(target, a), ab) / len2))
    const point = { x: a.x + ab.x * t, y: a.y + ab.y * t }
    const distance = Math.hypot(target.x - point.x, target.y - point.y)
    if (distance < best.distance) {
      const len = Math.sqrt(len2)
      best = { point, distance, dir: { x: ab.x / len, y: ab.y / len } }
    }
  }
  return best
}

/** Which side of the boat a point is on. In y-down coordinates, a positive cross product means to the right. */
export function sideOf(dir: Pt, boat: Pt, mark: Pt): 'port' | 'starboard' {
  return cross(dir, sub(mark, boat)) > 0 ? 'starboard' : 'port'
}

/** Is the boat on the safe side of a cardinal mark? Lenient: only the opposite half-plane is wrong. */
export function cardinalOk(safeSide: 'N' | 'E' | 'S' | 'W', mark: Pt, boat: Pt): boolean {
  switch (safeSide) {
    case 'N':
      return boat.y <= mark.y
    case 'S':
      return boat.y >= mark.y
    case 'E':
      return boat.x >= mark.x
    case 'W':
      return boat.x <= mark.x
  }
}

/** Expected side to leave a lateral mark, given the travel direction and the direction of buoyage. */
export function expectedLateralSide(keepOn: 'port' | 'starboard', travel: Pt, buoyageDeg: number): 'port' | 'starboard' {
  const withBuoyage = dot(travel, bearingVec(buoyageDeg)) >= 0
  if (withBuoyage) return keepOn
  return keepOn === 'port' ? 'starboard' : 'port'
}

export function checkPassage(level: ChartLevel, waypoints: Pt[]): Violation[] {
  const path = [level.start, ...waypoints, level.finish]
  const out: Violation[] = []

  const areas: [ViolationKind, Poly[]][] = [
    ['land', level.land],
    ['shoal', level.shoals],
    ['zone', level.zones],
  ]
  for (const [kind, polys] of areas) {
    polys.forEach((poly, index) => {
      const at = polylineHitsPolygon(path, poly)
      if (at) out.push({ kind, index, at })
    })
  }

  level.marks.forEach((pm, index) => {
    const ca = closestApproach(path, pm.at)
    if (ca.distance < HIT_RADIUS) {
      out.push({ kind: 'hitMark', index, at: pm.at })
      return
    }
    const rule = markById(pm.id).rule
    if (rule.kind === 'danger' && ca.distance < rule.radius) out.push({ kind: 'danger', index, at: ca.point })
    if (rule.kind === 'lateral' && ca.distance <= PASS_RADIUS) {
      const expected = expectedLateralSide(rule.keepOn, ca.dir, level.buoyageDeg)
      if (sideOf(ca.dir, ca.point, pm.at) !== expected) {
        const withBuoyage = dot(ca.dir, bearingVec(level.buoyageDeg)) >= 0
        out.push({ kind: 'lateral', index, at: ca.point, expected, withBuoyage })
      }
    }
    if (rule.kind === 'cardinal' && ca.distance <= PASS_RADIUS && !cardinalOk(rule.safeSide, pm.at, ca.point)) {
      out.push({ kind: 'cardinal', index, at: ca.point, expected: rule.safeSide })
    }
  })

  return out
}

export function pathLength(path: Pt[]): number {
  let d = 0
  for (let i = 0; i < path.length - 1; i++) d += Math.hypot(path[i + 1].x - path[i].x, path[i + 1].y - path[i].y)
  return d
}
