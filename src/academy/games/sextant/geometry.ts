/**
 * Optics of a sextant in its own plane (x = towards the horizon, y = up), used by the 3D model.
 * Principle of double reflection: the altitude read on the arc is twice the angle between the mirrors.
 */

export type V2 = { x: number; y: number }

const len = (v: V2) => Math.hypot(v.x, v.y)
const unit = (v: V2): V2 => {
  const l = len(v)
  return { x: v.x / l, y: v.y / l }
}
const sub = (a: V2, b: V2): V2 => ({ x: a.x - b.x, y: a.y - b.y })
const dot = (a: V2, b: V2) => a.x * b.x + a.y * b.y
const rotate = (v: V2, deg: number): V2 => {
  const r = (deg * Math.PI) / 180
  return { x: v.x * Math.cos(r) - v.y * Math.sin(r), y: v.x * Math.sin(r) + v.y * Math.cos(r) }
}
/** Mirror reflection of a travelling direction about a surface normal. */
export const reflect = (d: V2, n: V2): V2 => {
  const k = 2 * dot(d, n)
  return { x: d.x - k * n.x, y: d.y - k * n.y }
}

/** Index mirror sits on the pivot; horizon mirror and eye are on the line of sight (y = EYE_Y). */
export const PIVOT: V2 = { x: 0, y: 0 }
export const EYE_Y = -0.62
export const HORIZON_MIRROR: V2 = { x: -0.32, y: EYE_Y }
export const EYE: V2 = { x: -1.25, y: EYE_Y }
/** Radius of the arc around the pivot. */
export const ARC_R = 1.55
/** Direction of the index arm at a reading of 0°. */
const ARM_ZERO: V2 = unit({ x: -0.18, y: -1 })

/** Normal of the half-silvered horizon mirror: reflects light from the index mirror into the telescope. */
export const HORIZON_NORMAL: V2 = (() => {
  const incoming = unit(sub(HORIZON_MIRROR, PIVOT))
  const outgoing: V2 = { x: -1, y: 0 }
  return unit(sub(incoming, outgoing))
})()

export interface SextantPose {
  /** Arm rotation from the zero mark (half the reading) */
  armDeg: number
  /** Unit vector of the index arm (pivot → arc) */
  armDir: V2
  /** Normal of the index mirror */
  indexNormal: V2
  /** Direction in the sky that the observer sees reflected in the horizon mirror */
  skyDir: V2
  /** Altitude of that direction above the horizon, i.e. what the arc reads */
  altitude: number
}

/**
 * Pose for a reading. The mirror and arm turn by half the reading (`readingDeg / 2`);
 * the reflected line of sight then points `readingDeg` above the horizon.
 */
export function poseFor(readingDeg: number): SextantPose {
  const armDeg = readingDeg / 2
  const indexNormal = rotate(HORIZON_NORMAL, armDeg)
  const armDir = rotate(ARM_ZERO, armDeg)
  // Trace the line of sight backwards: eye → horizon mirror → index mirror → sky.
  const toIndex = reflect({ x: 1, y: 0 }, HORIZON_NORMAL)
  const skyDir = unit(reflect(toIndex, indexNormal))
  const altitude = (Math.atan2(skyDir.y, skyDir.x) * 180) / Math.PI
  return { armDeg, armDir, indexNormal, skyDir, altitude }
}

/** Points along the arc (pivot-centred) for arm rotations from `fromDeg` to `toDeg`. */
export function arcPoints(fromDeg: number, toDeg: number, steps = 48, r = ARC_R): V2[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const d = rotate(ARM_ZERO, fromDeg + ((toDeg - fromDeg) * i) / steps)
    return { x: PIVOT.x + d.x * r, y: PIVOT.y + d.y * r }
  })
}

export const armZero = () => ARM_ZERO
