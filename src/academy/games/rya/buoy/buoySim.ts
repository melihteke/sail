import { sailboat } from '../../../boats/sailboat'
import { boatSpeedKn } from '../../../core/polar'
import { knotsToMs, norm180, norm360 } from '../../../core/units'
import { add, fromBearing, scale, type Vec2 } from '../../../core/vec'

export type SailPlan = 'both' | 'main' | 'jib'

export interface BuoyLevel {
  id: string
  windFrom: number
  windKn: number
  streamSet: number
  streamKn: number
  start: { x: number; y: number; heading: number }
  buoy: Vec2
  best: SailPlan
}

export const buoyLevels: BuoyLevel[] = [
  { id: 'light', windFrom: 0, windKn: 10, streamSet: 0, streamKn: 0, start: { x: 60, y: 40, heading: 60 }, buoy: { x: 140, y: 170 }, best: 'main' },
  { id: 'with-stream', windFrom: 0, windKn: 12, streamSet: 180, streamKn: 1.2, start: { x: 40, y: 50, heading: 70 }, buoy: { x: 140, y: 170 }, best: 'main' },
  { id: 'against-stream', windFrom: 180, windKn: 12, streamSet: 180, streamKn: 1.5, start: { x: 80, y: 30, heading: 20 }, buoy: { x: 140, y: 170 }, best: 'jib' },
]

export interface SailState {
  x: number
  y: number
  heading: number
  /** Speed through the water, m/s. */
  stw: number
}

export interface SailControls {
  /** -1 .. 1, + turns to starboard. */
  helm: number
  /** 0 = sheeted for best speed, 1 = fully eased (spilling). */
  mainEase: number
  /** 0 = jib fully out, 1 = furled. */
  jibFurl: number
}

/** Power the mainsail gives: it can only spill wind when the wind is forward of about the beam. */
export function mainPower(twaAbs: number, ease: number): number {
  const max = 0.62
  const min = twaAbs <= 95 ? 0 : twaAbs >= 125 ? 0.55 : ((twaAbs - 95) / 30) * 0.55
  return min + (max - min) * (1 - Math.max(0, Math.min(1, ease)))
}

export function jibPower(furl: number): number {
  return 0.45 * (1 - Math.max(0, Math.min(1, furl)))
}

export function targetSpeed(level: BuoyLevel, plan: SailPlan, heading: number, c: SailControls): number {
  const twa = Math.abs(norm180(level.windFrom - heading))
  let power = 0
  if (plan !== 'jib') power += mainPower(twa, c.mainEase)
  if (plan !== 'main') power += jibPower(c.jibFurl)
  const sail = knotsToMs(boatSpeedKn(sailboat.polar, twa, level.windKn)) * Math.min(1, power)
  // With no drive the hull's windage still pushes her slowly downwind.
  const bare = twa > 110 ? knotsToMs(0.5) * ((twa - 110) / 70) : 0
  return Math.max(sail, bare)
}

export function stepSail(s: SailState, level: BuoyLevel, plan: SailPlan, c: SailControls, dt: number): SailState {
  const target = targetSpeed(level, plan, s.heading, c)
  const tau = target > s.stw ? 5 : 9
  const stw = s.stw + ((target - s.stw) * dt) / tau
  const turnRate = c.helm * 14 * Math.min(1, 0.25 + stw / 1.2)
  const heading = norm360(s.heading + turnRate * dt)
  const v = add(fromBearing(heading, stw), streamVec(level))
  return { x: s.x + v.x * dt, y: s.y + v.y * dt, heading, stw }
}

export const streamVec = (level: BuoyLevel): Vec2 => fromBearing(level.streamSet, knotsToMs(level.streamKn))

export function groundSpeed(s: SailState, level: BuoyLevel): number {
  const v = add(fromBearing(s.heading, s.stw), streamVec(level))
  return Math.hypot(v.x, v.y)
}

export function bowOf(s: SailState): Vec2 {
  return add({ x: s.x, y: s.y }, scale(fromBearing(s.heading), 4))
}

export const PICKUP_RANGE = 3
export const PICKUP_SPEED = 0.4

export type Approach = 'none' | 'pickedUp' | 'tooFast'

export function checkApproach(s: SailState, level: BuoyLevel): Approach {
  const b = bowOf(s)
  const d = Math.hypot(b.x - level.buoy.x, b.y - level.buoy.y)
  if (d > PICKUP_RANGE) return 'none'
  return groundSpeed(s, level) <= PICKUP_SPEED ? 'pickedUp' : 'tooFast'
}

export function buoyStars(misses: number, plan: SailPlan, best: SailPlan): 1 | 2 | 3 {
  if (misses === 0 && plan === best) return 3
  return misses <= 2 ? 2 : 1
}
