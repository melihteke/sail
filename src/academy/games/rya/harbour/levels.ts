import type { Vec2 } from '../../../core/vec'
import { hullPoints, toWorld, type Conditions, type MooringLine, type Obstacle, type YachtState } from '../../../core/yacht'

export interface BerthGoal {
  kind: 'berth'
  zone: Vec2[]
  heading: number
  /** Allowed heading error in degrees. */
  tol: number
}

export interface ExitGoal {
  kind: 'exit'
  zone: Vec2[]
  heading?: number
  tol?: number
}

export interface HarbourLevel {
  id: string
  w: number
  h: number
  start: YachtState
  conditions: Conditions
  obstacles: Obstacle[]
  lines?: MooringLine[]
  goal: BerthGoal | ExitGoal
  /** Seconds for three stars. */
  par: number
  /** Stern-to: the anchor should be dropped this many metres from the quay (y of the quay face). */
  anchor?: { quayY: number; min: number; max: number }
}

export const rect = (x0: number, y0: number, x1: number, y1: number): Vec2[] => [
  { x: x0, y: y0 },
  { x: x1, y: y0 },
  { x: x1, y: y1 },
  { x: x0, y: y1 },
]

const pose = (x: number, y: number, heading: number): YachtState => ({ x, y, heading, u: 0, v: 0, r: 0 })

let boatSeq = 0
/** A moored yacht as a hard obstacle. */
export function mooredBoat(x: number, y: number, heading: number): Obstacle {
  const s = pose(x, y, heading)
  return { id: `boat${boatSeq++}`, kind: 'boat', poly: hullPoints.map((p) => toWorld(s, p)) }
}

const calm: Conditions = { windFromDeg: 0, windKn: 0, streamSetDeg: 0, streamKn: 0 }

/** Long pontoon along the west edge (x 0..3). Boats lie port-side-to with their centre at x = 5.2. */
const westPontoon = (h: number): Obstacle => ({ id: 'pontoon', kind: 'pontoon', poly: rect(0, 0, 3, h) })
const ALONGSIDE_X = 5.2

function finger(gapFrom: number, gapTo: number, h: number): Obstacle[] {
  const out: Obstacle[] = [westPontoon(h)]
  for (let y = gapFrom - 6; y > 3; y -= 11) out.push(mooredBoat(ALONGSIDE_X, y, 0))
  for (let y = gapTo + 6; y < h - 3; y += 11) out.push(mooredBoat(ALONGSIDE_X, y, 0))
  return out
}

function berthZone(yMid: number, half: number): Vec2[] {
  return rect(ALONGSIDE_X - 0.8, yMid - half, ALONGSIDE_X + 1, yMid + half)
}

function fairway(): Obstacle[] {
  const out: Obstacle[] = [{ id: 'quay', kind: 'hard', poly: rect(0, 76, 40, 80) }]
  for (let y = 6; y <= 72; y += 4.2) {
    out.push(mooredBoat(5.5, y, 90))
    out.push(mooredBoat(34.5, y, 270))
  }
  return out
}

function sternToQuay(): Obstacle[] {
  const out: Obstacle[] = [{ id: 'quay', kind: 'pontoon', poly: rect(0, 60, 48, 64) }]
  for (const x of [4, 8, 12, 16, 19.6, 28.4, 32, 36, 40, 44]) out.push(mooredBoat(x, 54.5, 180))
  return out
}

export const harbourLevels: HarbourLevel[] = [
  {
    id: 'first-steps',
    w: 80,
    h: 60,
    start: pose(20, 10, 20),
    conditions: calm,
    obstacles: [{ id: 'quay', kind: 'hard', poly: rect(0, 56, 80, 60) }, { id: 'pile1', kind: 'hard', poly: rect(44, 36, 45, 37) }, { id: 'pile2', kind: 'hard', poly: rect(61, 36, 62, 37) }],
    goal: { kind: 'berth', zone: rect(46, 38, 60, 48), heading: 0, tol: 180 },
    par: 60,
  },
  {
    id: 'astern',
    w: 60,
    h: 60,
    start: pose(30, 40, 0),
    conditions: calm,
    obstacles: [{ id: 'quay', kind: 'pontoon', poly: rect(0, 0, 60, 2) }, mooredBoat(23.5, 8, 0), mooredBoat(36.5, 8, 0), mooredBoat(19.5, 8, 0), mooredBoat(40.5, 8, 0)],
    goal: { kind: 'berth', zone: rect(28.5, 6.5, 31.5, 12), heading: 0, tol: 15 },
    par: 70,
  },
  {
    id: 'alongside',
    w: 60,
    h: 70,
    start: pose(35, 8, 340),
    conditions: calm,
    obstacles: finger(23, 43, 70),
    goal: { kind: 'berth', zone: berthZone(33, 6), heading: 0, tol: 12 },
    par: 75,
  },
  {
    id: 'onshore',
    w: 60,
    h: 70,
    start: pose(35, 8, 340),
    conditions: { windFromDeg: 90, windKn: 12, streamSetDeg: 0, streamKn: 0 },
    obstacles: finger(25, 39, 70),
    goal: { kind: 'berth', zone: berthZone(32, 3), heading: 0, tol: 12 },
    par: 75,
  },
  {
    id: 'stream',
    w: 60,
    h: 70,
    start: pose(35, 62, 180),
    conditions: { windFromDeg: 225, windKn: 5, streamSetDeg: 180, streamKn: 1.3 },
    obstacles: finger(24, 40, 70),
    goal: { kind: 'berth', zone: berthZone(32, 4), heading: 0, tol: 15 },
    par: 90,
  },
  {
    id: 'spring-off',
    w: 60,
    h: 60,
    start: pose(4.8, 30, 0),
    conditions: { windFromDeg: 90, windKn: 16, streamSetDeg: 0, streamKn: 0 },
    obstacles: [westPontoon(60), mooredBoat(ALONGSIDE_X, 18.5, 0), mooredBoat(ALONGSIDE_X, 41.5, 0), mooredBoat(ALONGSIDE_X, 7.5, 0), mooredBoat(ALONGSIDE_X, 52.5, 0)],
    lines: [
      { id: 'bowSpring', at: { a: 4.6, b: -1.1 }, anchor: { x: 3, y: 27 }, length: 7.8 },
      { id: 'bowLine', at: { a: 4.6, b: -1.1 }, anchor: { x: 3, y: 37 }, length: 2.8 },
      { id: 'sternLine', at: { a: -4.7, b: -1.4 }, anchor: { x: 3, y: 21 }, length: 4.6 },
    ],
    goal: { kind: 'exit', zone: rect(17, 8, 60, 60) },
    par: 90,
  },
  {
    id: 'turn',
    w: 40,
    h: 80,
    start: pose(20, 62, 0),
    conditions: { windFromDeg: 270, windKn: 8, streamSetDeg: 0, streamKn: 0 },
    obstacles: fairway(),
    goal: { kind: 'exit', zone: rect(10, 0, 30, 10), heading: 180, tol: 40 },
    par: 80,
  },
  {
    id: 'stern-to',
    w: 48,
    h: 64,
    start: pose(24, 18, 180),
    conditions: { windFromDeg: 90, windKn: 8, streamSetDeg: 0, streamKn: 0 },
    obstacles: sternToQuay(),
    goal: { kind: 'berth', zone: rect(23, 51.5, 25, 55.5), heading: 180, tol: 10 },
    par: 100,
    anchor: { quayY: 60, min: 30, max: 40 },
  },
]

export function findHarbourLevel(id: string | null): HarbourLevel | undefined {
  return harbourLevels.find((l) => l.id === id)
}
