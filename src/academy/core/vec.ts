import { norm360, toDeg, toRad } from './units'

/** Local planar vector in metres (or m/s): x = east, y = north. */
export interface Vec2 {
  x: number
  y: number
}

export const vec = (x: number, y: number): Vec2 => ({ x, y })
export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y })
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y })
export const scale = (a: Vec2, k: number): Vec2 => ({ x: a.x * k, y: a.y * k })
export const dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y
/** z-component of a × b. Positive when b points to the left (anticlockwise) of a. */
export const cross = (a: Vec2, b: Vec2): number => a.x * b.y - a.y * b.x
export const length = (a: Vec2): number => Math.hypot(a.x, a.y)
export const lerp = (a: Vec2, b: Vec2, t: number): Vec2 => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
})

/** Vector pointing TOWARDS a compass bearing (0 = north, clockwise). */
export function fromBearing(bearingDeg: number, magnitude = 1): Vec2 {
  const r = toRad(bearingDeg)
  return { x: Math.sin(r) * magnitude, y: Math.cos(r) * magnitude }
}

/** Compass bearing (0..360) of the direction a vector points to. */
export function bearingOf(v: Vec2): number {
  return norm360(toDeg(Math.atan2(v.x, v.y)))
}
