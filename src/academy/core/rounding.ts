import { cross, dot, sub, type Vec2 } from './vec'

export type RoundingSide = 'port' | 'starboard'

/**
 * Total signed angle (degrees) swept by the line from `center` to a point moving along `path`.
 * Local frame is x = east, y = north, so anticlockwise is positive.
 */
export function sweptAngle(path: Vec2[], center: Vec2): number {
  let total = 0
  for (let i = 0; i < path.length - 1; i++) {
    const a = sub(path[i], center)
    const b = sub(path[i + 1], center)
    total += Math.atan2(cross(a, b), dot(a, b))
  }
  return (total * 180) / Math.PI
}

/** Minimum sweep to count as having gone round (or past) the mark. */
export const ROUNDING_MIN_DEG = 90

/**
 * Leaving a mark to port means it is on your left, so you travel anticlockwise round it.
 */
export function roundsMark(path: Vec2[], mark: Vec2, side: RoundingSide): boolean {
  const s = sweptAngle(path, mark)
  return side === 'port' ? s >= ROUNDING_MIN_DEG : s <= -ROUNDING_MIN_DEG
}
