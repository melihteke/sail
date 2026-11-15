import { pointInPolygon } from '../../../core/polygon'
import { fromBearing, type Vec2 } from '../../../core/vec'

/** Bay in metres: x = east, y = north. Depths are charted depths (below chart datum); negative = dries. */
export interface AnchorLevel {
  id: string
  w: number
  h: number
  land: Vec2[][]
  rocks: { c: Vec2; r: number }[]
  /** Distance from land (m) per metre of depth and the depth right at the shoreline. */
  slope: number
  /** Height of tide on arrival and at the lowest point of the night. */
  tideNow: number
  tideLow: number
  /** Wind directions (FROM) through the night, evenly spaced over 12 h. */
  winds: number[]
  boats: { at: Vec2; chain: number }[]
}

export const BOAT_LENGTH = 10
export const DRAFT = 1.8
export const CLEARANCE = 0.5
export const NIGHT_HOURS = 12

export const anchorLevels: AnchorLevel[] = [
  {
    id: 'cove',
    w: 300,
    h: 220,
    land: [[{ x: 0, y: 0 }, { x: 300, y: 0 }, { x: 300, y: 150 }, { x: 250, y: 120 }, { x: 210, y: 40 }, { x: 90, y: 40 }, { x: 50, y: 130 }, { x: 0, y: 160 }]],
    rocks: [{ c: { x: 230, y: 150 }, r: 6 }],
    slope: 9,
    tideNow: 0.3,
    tideLow: 0.1,
    winds: [180, 200, 260, 320, 340],
    boats: [{ at: { x: 110, y: 120 }, chain: 30 }, { at: { x: 200, y: 150 }, chain: 25 }],
  },
  {
    id: 'tidal',
    w: 300,
    h: 220,
    land: [[{ x: 0, y: 0 }, { x: 300, y: 0 }, { x: 300, y: 60 }, { x: 0, y: 70 }]],
    rocks: [{ c: { x: 70, y: 150 }, r: 8 }],
    slope: 14,
    tideNow: 4.2,
    tideLow: 0.6,
    winds: [200, 220, 240, 250, 270],
    boats: [{ at: { x: 200, y: 175 }, chain: 45 }],
  },
  {
    id: 'crowded',
    w: 300,
    h: 220,
    land: [[{ x: 0, y: 0 }, { x: 300, y: 0 }, { x: 300, y: 110 }, { x: 240, y: 80 }, { x: 160, y: 50 }, { x: 60, y: 70 }, { x: 0, y: 120 }]],
    rocks: [{ c: { x: 150, y: 150 }, r: 7 }, { c: { x: 250, y: 165 }, r: 5 }],
    slope: 11,
    tideNow: 3.0,
    tideLow: 0.4,
    winds: [90, 140, 200, 250, 300],
    boats: [
      { at: { x: 90, y: 135 }, chain: 30 },
      { at: { x: 200, y: 120 }, chain: 30 },
      { at: { x: 110, y: 190 }, chain: 40 },
      { at: { x: 225, y: 195 }, chain: 40 },
    ],
  },
]

function distToSegment(p: Vec2, a: Vec2, b: Vec2): number {
  const ex = b.x - a.x
  const ey = b.y - a.y
  const l2 = ex * ex + ey * ey
  const t = l2 ? Math.max(0, Math.min(1, ((p.x - a.x) * ex + (p.y - a.y) * ey) / l2)) : 0
  return Math.hypot(p.x - (a.x + ex * t), p.y - (a.y + ey * t))
}

export function onLand(level: AnchorLevel, p: Vec2): boolean {
  return level.land.some((poly) => pointInPolygon(p, poly))
}

/** Charted depth (m below chart datum) at a point. Negative values dry out at chart datum. */
export function chartDepth(level: AnchorLevel, p: Vec2): number {
  if (onLand(level, p)) return -2
  let d = Infinity
  for (const poly of level.land) for (let i = 0; i < poly.length; i++) d = Math.min(d, distToSegment(p, poly[i], poly[(i + 1) % poly.length]))
  let depth = d / level.slope - 1 + 0.4 * Math.sin(p.x / 23) * Math.cos(p.y / 31)
  for (const r of level.rocks) {
    const dr = Math.hypot(p.x - r.c.x, p.y - r.c.y)
    if (dr < r.r) return -0.8
    if (dr < r.r + 25) depth = Math.min(depth, ((dr - r.r) / 25) * depth + 0.2)
  }
  return Math.round(depth * 10) / 10
}

/** Height of tide at hour h of the night: falls from tideNow to tideLow at 6 h, then rises again. */
export function tideAt(level: AnchorLevel, h: number): number {
  const mid = (level.tideNow + level.tideLow) / 2
  const amp = (level.tideNow - level.tideLow) / 2
  return mid + amp * Math.cos((Math.PI * h) / 6)
}

export function windAt(level: AnchorLevel, h: number): number {
  const n = level.winds.length - 1
  const f = Math.min(n, (h / NIGHT_HOURS) * n)
  const i = Math.min(n - 1, Math.floor(f))
  const a = level.winds[i]
  const b = level.winds[i + 1]
  let d = b - a
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return (a + d * (f - i) + 360) % 360
}

/** How far downwind of the anchor the boat's centre lies: horizontal chain length plus half a boat. */
export function swingRadius(chain: number, depthWater: number): number {
  return Math.sqrt(Math.max(0, chain * chain - depthWater * depthWater)) + BOAT_LENGTH / 2
}

export function boatPosition(anchor: Vec2, chain: number, depthWater: number, windFrom: number): Vec2 {
  const d = fromBearing(windFrom + 180, swingRadius(chain, depthWater))
  return { x: anchor.x + d.x, y: anchor.y + d.y }
}

export type AnchorEvent =
  | { kind: 'land' }
  | { kind: 'tooShallow'; depth: number }
  | { kind: 'drag'; scope: number; hour: number }
  | { kind: 'aground'; hour: number; underKeel: number }
  | { kind: 'rock'; hour: number }
  | { kind: 'boat'; hour: number; boat: number }
  | { kind: 'ok'; scope: number; minUnderKeel: number }

export interface Frame {
  hour: number
  pos: Vec2
  others: Vec2[]
  tide: number
  wind: number
  underKeel: number
}

/** Plays the night through and reports the first problem (or success). */
export function playNight(level: AnchorLevel, anchor: Vec2, chain: number, steps = 240): { frames: Frame[]; event: AnchorEvent } {
  const frames: Frame[] = []
  if (onLand(level, anchor)) return { frames, event: { kind: 'land' } }
  const depthHW = chartDepth(level, anchor) + level.tideNow
  if (depthHW < DRAFT + CLEARANCE) return { frames, event: { kind: 'tooShallow', depth: depthHW } }
  const scope = chain / depthHW
  let minUnderKeel = Infinity
  for (let i = 0; i <= steps; i++) {
    const hour = (i / steps) * NIGHT_HOURS
    const tide = tideAt(level, hour)
    const wind = windAt(level, hour)
    const water = chartDepth(level, anchor) + tide
    const pos = boatPosition(anchor, chain, water, wind)
    const others = level.boats.map((b) => boatPosition(b.at, b.chain, chartDepth(level, b.at) + tide, wind))
    const underKeel = chartDepth(level, pos) + tide - DRAFT
    minUnderKeel = Math.min(minUnderKeel, underKeel)
    frames.push({ hour, pos, others, tide, wind, underKeel })
    // The wind freshens in the small hours: a short scope lets the anchor drag.
    if (scope < 4 && hour >= 3) return { frames, event: { kind: 'drag', scope, hour } }
    if (onLand(level, pos) || underKeel < 0) return { frames, event: { kind: 'aground', hour, underKeel } }
    if (level.rocks.some((r) => Math.hypot(pos.x - r.c.x, pos.y - r.c.y) < r.r + 4)) return { frames, event: { kind: 'rock', hour } }
    const hit = others.findIndex((o) => Math.hypot(o.x - pos.x, o.y - pos.y) < BOAT_LENGTH + 2)
    if (hit >= 0) return { frames, event: { kind: 'boat', hour, boat: hit } }
  }
  return { frames, event: { kind: 'ok', scope, minUnderKeel } }
}

export function anchorStars(e: AnchorEvent): 0 | 2 | 3 {
  if (e.kind !== 'ok') return 0
  return e.scope <= 7 && e.minUnderKeel >= CLEARANCE ? 3 : 2
}
