import type { Vec2 } from '../../../core/vec'
import { step, toWorld, type BodyPoint, type Conditions, type MooringLine, type Obstacle, type YachtState } from '../../../core/yacht'
import { mooredBoat, rect } from '../harbour/levels'

export type LinesLevelId = 'calm' | 'surge' | 'onshore' | 'offshore'
export type Role = 'bowLine' | 'sternLine' | 'bowSpring' | 'sternSpring' | 'breast'
export type FenderSpot = 'bow' | 'mid' | 'quarter'

export const START: YachtState = { x: 4.85, y: 20, heading: 0, u: 0, v: 0, r: 0 }

export const BOAT_CLEATS: Record<'bow' | 'mid' | 'stern', BodyPoint> = {
  bow: { a: 4.6, b: -1.1 },
  mid: { a: 0, b: -1.7 },
  stern: { a: -4.7, b: -1.4 },
}

export const SHORE_CLEATS: Vec2[] = [6, 12, 17, 23, 28, 34].map((y) => ({ x: 2.8, y }))

export const OBSTACLES: Obstacle[] = [
  { id: 'pontoon', kind: 'pontoon', poly: rect(0, 0, 3, 40) },
  { ...mooredBoat(4.85, 8.5, 0), id: 'astern' },
  { ...mooredBoat(4.85, 31.5, 0), id: 'ahead' },
]

/** Port-side hull point index → the fender spot that protects it (see yacht hullPoints). */
const FENDER_FOR_POINT: Record<number, FenderSpot> = { 8: 'bow', 7: 'mid', 6: 'mid', 5: 'quarter' }

export interface LinesLevel {
  id: LinesLevelId
  recommended: Role[]
  fenders: FenderSpot[]
}

export const linesLevels: LinesLevel[] = [
  { id: 'calm', recommended: ['bowLine', 'sternLine'], fenders: ['mid'] },
  { id: 'surge', recommended: ['bowLine', 'sternLine', 'bowSpring', 'sternSpring'], fenders: ['mid'] },
  { id: 'onshore', recommended: ['bowLine', 'sternLine'], fenders: ['bow', 'mid', 'quarter'] },
  { id: 'offshore', recommended: ['bowLine', 'sternLine', 'bowSpring', 'sternSpring'], fenders: ['mid'] },
]

export function conditionsAt(level: LinesLevelId, t: number): Conditions {
  const gust = 1 + 0.25 * Math.sin(t * 0.9) + 0.15 * Math.sin(t * 2.3)
  switch (level) {
    case 'calm':
      return { windFromDeg: 270, windKn: 10 * gust, streamSetDeg: 0, streamKn: 0 }
    case 'surge':
      return { windFromDeg: 0, windKn: 0, streamSetDeg: 0, streamKn: 1.8 * Math.cos((2 * Math.PI * t) / 30) }
    case 'onshore':
      return { windFromDeg: 90, windKn: 22 * gust, streamSetDeg: 0, streamKn: 0 }
    case 'offshore':
      return { windFromDeg: 260, windKn: 22 * gust, streamSetDeg: 0, streamKn: 0.8 * Math.cos((2 * Math.PI * t) / 30) }
  }
}

export interface PlacedLine {
  id: string
  from: keyof typeof BOAT_CLEATS
  to: number
}

export function toMooringLine(l: PlacedLine): MooringLine {
  const at = BOAT_CLEATS[l.from]
  const anchor = SHORE_CLEATS[l.to]
  const p = toWorld(START, at)
  const len = Math.hypot(anchor.x - p.x, anchor.y - p.y)
  return { id: l.id, at, anchor, length: len + 0.15 }
}

/** What a line does, judged from where it leads when the boat is in her berth (heading north). */
export function roleOf(l: PlacedLine): Role {
  const p = toWorld(START, BOAT_CLEATS[l.from])
  const dy = SHORE_CLEATS[l.to].y - p.y
  if (Math.abs(dy) < 2) return 'breast'
  if (l.from === 'bow') return dy > 0 ? 'bowLine' : 'bowSpring'
  if (l.from === 'stern') return dy < 0 ? 'sternLine' : 'sternSpring'
  return 'breast'
}

export interface TestResult {
  shift: number
  yaw: number
  hitBoat: boolean
  unfendered: boolean
  passed: boolean
  missingRoles: Role[]
  missingFenders: FenderSpot[]
  stars: 0 | 2 | 3
}

export const TEST_SECONDS = 30

export interface Tracker {
  shift: number
  yaw: number
  hitBoat: boolean
  unfendered: boolean
}

export function newTracker(): Tracker {
  return { shift: 0, yaw: 0, hitBoat: false, unfendered: false }
}

export function testStep(state: YachtState, level: LinesLevelId, t: number, lines: MooringLine[], fenders: FenderSpot[], tr: Tracker, dt: number): YachtState {
  const r = step(state, { controls: { throttle: 0, rudder: 0 }, conditions: conditionsAt(level, t), lines, obstacles: OBSTACLES }, dt)
  for (const c of r.contacts) {
    if (c.obstacle !== 'pontoon') {
      if (c.speed > 0.05) tr.hitBoat = true
    } else if (c.speed > 0.03) {
      const spot = FENDER_FOR_POINT[c.point]
      if (!spot || !fenders.includes(spot)) tr.unfendered = true
    }
  }
  const s = r.state
  tr.shift = Math.max(tr.shift, Math.hypot(s.x - START.x, s.y - START.y))
  const yaw = Math.abs(s.heading > 180 ? s.heading - 360 : s.heading)
  tr.yaw = Math.max(tr.yaw, yaw)
  return s
}

export function judge(level: LinesLevel, placed: PlacedLine[], fenders: FenderSpot[], tr: Tracker): TestResult {
  const roles = new Set(placed.map(roleOf))
  const missingRoles = level.recommended.filter((r) => !roles.has(r))
  const missingFenders = level.fenders.filter((f) => !fenders.includes(f))
  const passed = !tr.hitBoat && !tr.unfendered && tr.shift < 1.2 && tr.yaw < 16
  const stars = !passed ? 0 : missingRoles.length === 0 && missingFenders.length === 0 ? 3 : 2
  return { ...tr, passed, missingRoles, missingFenders, stars }
}

/** Runs the whole test without drawing (for tests). */
export function runTest(level: LinesLevel, placed: PlacedLine[], fenders: FenderSpot[]): TestResult {
  const lines = placed.map(toMooringLine)
  const tr = newTracker()
  let s = START
  const dt = 1 / 60
  for (let t = 0; t < TEST_SECONDS; t += dt) s = testStep(s, level.id, t, lines, fenders, tr, dt)
  return judge(level, placed, fenders, tr)
}
