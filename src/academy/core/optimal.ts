import type { BoatProfile } from '../boats/sailboat'
import type { Environment } from './environment'
import { groundVelocity, type LegSolution } from './leg'
import { hitsAny } from './polygon'
import { roundsMark, type RoundingSide } from './rounding'
import { classifyTurn, evaluateRoute, maneuverPenalty, type EvaluatedRoute } from './route'
import { add, cross, fromBearing, scale, sub, type Vec2 } from './vec'

interface HeadingVel {
  h: number
  g: Vec2
}

function headingGrid(env: Environment, boat: BoatProfile, step: number): HeadingVel[] {
  const out: HeadingVel[] = []
  for (let h = 0; h < 360; h += step) {
    const g = groundVelocity(h, env, boat)
    if (g) out.push({ h, g })
  }
  return out
}

/**
 * Candidate routes from start to finish under uniform wind and current: the direct leg (if sailable)
 * and the fastest two-leg route in both orders (tack first one way or the other).
 *
 * With uniform conditions the set of reachable points per unit time is convex, so the
 * fastest route is either a direct leg or two legs (one tack or gybe). Extra legs only add
 * maneuver time. We solve start→finish = a·g1 + b·g2 (a, b = seconds on each heading) over
 * heading pairs, then refine.
 */
export function routeCandidates(start: Vec2, finish: Vec2, env: Environment, boat: BoatProfile, grid?: HeadingVel[]): Vec2[][] {
  const target = sub(finish, start)
  const out: Vec2[][] = []
  if (evaluateRoute([start, finish], env, boat).feasible) out.push([start, finish])

  const twoLeg = (h1: number, g1: Vec2, h2: number, g2: Vec2): { t: number; a: number; b: number } | null => {
    const det = cross(g1, g2)
    if (Math.abs(det) < 1e-9) return null
    const a = cross(target, g2) / det
    const b = cross(g1, target) / det
    if (a < 1 || b < 1) return null
    return { t: a + b + maneuverPenalty(classifyTurn(h1, h2, env.windFromDeg), boat), a, b }
  }

  const candidates = grid ?? headingGrid(env, boat, 1)
  let bestPair: { h1: number; h2: number; t: number } | null = null
  for (const c1 of candidates) {
    for (const c2 of candidates) {
      const r = twoLeg(c1.h, c1.g, c2.h, c2.g)
      if (r && (!bestPair || r.t < bestPair.t)) bestPair = { h1: c1.h, h2: c2.h, t: r.t }
    }
  }
  if (!bestPair) return out

  let { h1, h2 } = bestPair
  let bestT = bestPair.t
  let bestA = 0
  let bestB = 0
  for (const step of [0.5, 0.25, 0.05, 0.01]) {
    const c1 = h1
    const c2 = h2
    for (let i = -5; i <= 5; i++) {
      for (let j = -5; j <= 5; j++) {
        const a1 = c1 + i * step
        const a2 = c2 + j * step
        const g1 = groundVelocity(a1, env, boat)
        const g2 = groundVelocity(a2, env, boat)
        if (!g1 || !g2) continue
        const r = twoLeg(a1, g1, a2, g2)
        if (r && r.t <= bestT) {
          bestT = r.t
          bestA = r.a
          bestB = r.b
          h1 = a1
          h2 = a2
        }
      }
    }
  }
  const g1 = groundVelocity(h1, env, boat)
  const g2 = groundVelocity(h2, env, boat)
  if (g1 && g2 && bestA > 0) {
    out.push([start, add(start, scale(g1, bestA)), finish])
    out.push([start, add(start, scale(g2, bestB)), finish])
  }
  return out
}

function fastest(routes: Vec2[][], env: Environment, boat: BoatProfile, accept: (pts: Vec2[]) => boolean = () => true) {
  let best: EvaluatedRoute | null = null
  for (const pts of routes) {
    if (!accept(pts)) continue
    const r = evaluateRoute(pts, env, boat)
    if (r.feasible && (!best || r.totalTimeS < best.totalTimeS)) best = r
  }
  return best
}

/** Fastest route from start to finish under uniform wind and current. Exact for the game model. */
export function optimalRoute(start: Vec2, finish: Vec2, env: Environment, boat: BoatProfile): EvaluatedRoute | null {
  return fastest(routeCandidates(start, finish, env, boat), env, boat)
}

export interface RoundingMark {
  at: Vec2
  side: RoundingSide
}

/** Clearance (m) kept from a rounding mark by the reference route. */
export const ROUNDING_CLEARANCE_M = 15

interface Piece {
  points: Vec2[]
  legs: LegSolution[]
  /** Sailing time plus maneuvers inside the piece. */
  timeS: number
}

function makePiece(points: Vec2[], env: Environment, boat: BoatProfile, land: Vec2[][]): Piece | null {
  if (land.length && hitsAny(points, land)) return null
  const r = evaluateRoute(points, env, boat)
  if (!r.feasible) return null
  return { points, legs: r.legs as LegSolution[], timeS: r.totalTimeS }
}

/**
 * Fastest route that leaves every mark on its required side, in order, without crossing land.
 * Each mark is rounded through 1–3 points of a small ring just outside it (arrive at one, step round
 * in the rounding direction); the gaps between them use the uniform-conditions candidates.
 */
export function optimalRouteViaMarks(
  start: Vec2,
  marks: RoundingMark[],
  finish: Vec2,
  env: Environment,
  boat: BoatProfile,
  land: Vec2[][] = [],
): EvaluatedRoute | null {
  const grid = headingGrid(env, boat, 2)
  const pieceCache = new Map<string, Piece[]>()
  const gapPieces = (a: Vec2, b: Vec2, key: string): Piece[] => {
    let v = pieceCache.get(key)
    if (!v) {
      v = routeCandidates(a, b, env, boat, grid)
        .map((pts) => makePiece(pts, env, boat, land))
        .filter((p): p is Piece => p !== null)
      pieceCache.set(key, v)
    }
    return v
  }

  const rings = marks.map((m) => [0, 90, 180, 270].map((b) => add(m.at, fromBearing(b, ROUNDING_CLEARANCE_M))))
  // Options per mark: entry ring index and the ring points visited (stepping in the rounding direction).
  const options = marks.map((m, i) => {
    const dir = m.side === 'port' ? -1 : 1
    const out: { entry: number; exit: number; hop: Piece | null; hopPts: Vec2[] }[] = []
    for (let e = 0; e < 4; e++) {
      for (let s = 0; s <= 2; s++) {
        const idx = Array.from({ length: s + 1 }, (_, k) => (e + dir * k + 8) % 4)
        const pts = idx.map((k) => rings[i][k])
        const hop = s === 0 ? null : makePiece(pts, env, boat, [])
        if (s > 0 && !hop) continue
        out.push({ entry: e, exit: idx[idx.length - 1], hop, hopPts: pts })
      }
    }
    return out
  })

  let best: { points: Vec2[]; t: number } | null = null
  const n = marks.length
  const chosen: (typeof options)[number] = []

  const penaltyBetween = (a: LegSolution | undefined, b: LegSolution | undefined) =>
    a && b ? maneuverPenalty(classifyTurn(a.headingDeg, b.headingDeg, env.windFromDeg), boat) : 0

  const evaluateChoice = () => {
    const gaps: Piece[][] = []
    for (let g = 0; g <= n; g++) {
      const from = g === 0 ? start : rings[g - 1][chosen[g - 1].exit]
      const to = g === n ? finish : rings[g][chosen[g].entry]
      const key = `${g === 0 ? 's' : `${g - 1}x${chosen[g - 1].exit}`}-${g === n ? 'f' : `${g}e${chosen[g].entry}`}`
      const ps = gapPieces(from, to, key)
      if (!ps.length) return
      gaps.push(ps)
    }
    const pick: Piece[] = new Array(n + 1)
    const rec = (g: number) => {
      if (g > n) {
        const seq: Piece[] = []
        for (let i = 0; i <= n; i++) {
          seq.push(pick[i])
          if (i < n && chosen[i].hop) seq.push(chosen[i].hop!)
        }
        let t = 0
        for (let i = 0; i < seq.length; i++) {
          t += seq[i].timeS
          if (i > 0) t += penaltyBetween(seq[i - 1].legs[seq[i - 1].legs.length - 1], seq[i].legs[0])
        }
        if (best && t >= best.t) return
        const points: Vec2[] = [...seq[0].points]
        for (let i = 1; i < seq.length; i++) points.push(...seq[i].points.slice(1))
        if (marks.every((m) => roundsMark(points, m.at, m.side))) best = { points, t }
        return
      }
      for (const p of gaps[g]) {
        pick[g] = p
        rec(g + 1)
      }
    }
    rec(0)
  }

  const choose = (i: number) => {
    if (i === n) {
      evaluateChoice()
      return
    }
    for (const o of options[i]) {
      chosen[i] = o
      choose(i + 1)
    }
  }
  choose(0)

  if (!best) return null
  return evaluateRoute((best as { points: Vec2[] }).points, env, boat)
}

/** Fastest route that leaves a single mark on the required side. */
export function optimalRouteVia(start: Vec2, mark: RoundingMark, finish: Vec2, env: Environment, boat: BoatProfile): EvaluatedRoute | null {
  return optimalRouteViaMarks(start, [mark], finish, env, boat)
}

/** Fastest route without marks that does not cross land. */
export function optimalRouteAvoiding(start: Vec2, finish: Vec2, env: Environment, boat: BoatProfile, land: Vec2[][]): EvaluatedRoute | null {
  if (!land.length) return optimalRoute(start, finish, env, boat)
  return fastest(routeCandidates(start, finish, env, boat), env, boat, (pts) => !hitsAny(pts, land))
}
