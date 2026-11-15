import { pointInPolygon } from './polygon'
import { knotsToMs, norm360, toDeg, toRad } from './units'
import { add, dot, fromBearing, length, scale, sub, type Vec2 } from './vec'

/**
 * Simple 3-degree-of-freedom model of a ~10 m cruising yacht under engine, for harbour handling games.
 * World frame: metres, x = east, y = north. Heading is a compass bearing in degrees.
 * Body frame: u = speed forward through the water, v = speed to starboard, r = yaw rate (rad/s, + = clockwise).
 * All force terms are per unit mass and tuned for believable gameplay, not measured data.
 */
export interface YachtState {
  x: number
  y: number
  heading: number
  u: number
  v: number
  r: number
}

export interface Controls {
  /** -1 (full astern) .. 1 (full ahead). */
  throttle: number
  /** -1 (wheel hard to port) .. 1 (wheel hard to starboard). */
  rudder: number
}

export interface Conditions {
  windFromDeg: number
  windKn: number
  /** Direction the stream flows TO. */
  streamSetDeg: number
  streamKn: number
}

/** A point on the hull: a = metres forward of the centre, b = metres to starboard. */
export interface BodyPoint {
  a: number
  b: number
}

export interface MooringLine {
  id: string
  at: BodyPoint
  anchor: Vec2
  length: number
}

export type ObstacleKind = 'pontoon' | 'boat' | 'hard'

export interface Obstacle {
  id: string
  kind: ObstacleKind
  poly: Vec2[]
}

export interface ContactEvent {
  obstacle: string
  kind: ObstacleKind
  /** Closing speed (m/s) at impact. */
  speed: number
  /** Index into hullPoints of the touching point. */
  point: number
}

export const YACHT = { length: 10, beam: 3.4 }
const GYRATION2 = (YACHT.length * 0.3) ** 2

/** Outline of the hull, clockwise from the bow. Used for drawing and for contact checks. */
export const hullPoints: BodyPoint[] = (() => {
  const L = YACHT.length / 2
  const B = YACHT.beam / 2
  return [
    { a: L, b: 0 },
    { a: L * 0.62, b: B * 0.72 },
    { a: L * 0.2, b: B },
    { a: -L * 0.35, b: B },
    { a: -L * 0.97, b: B * 0.86 },
    { a: -L * 0.97, b: -B * 0.86 },
    { a: -L * 0.35, b: -B },
    { a: L * 0.2, b: -B },
    { a: L * 0.62, b: -B * 0.72 },
  ]
})()

export const forward = (headingDeg: number): Vec2 => fromBearing(headingDeg)
export const starboard = (headingDeg: number): Vec2 => fromBearing(headingDeg + 90)

export function toWorld(s: YachtState, p: BodyPoint): Vec2 {
  const f = forward(s.heading)
  const st = starboard(s.heading)
  return { x: s.x + f.x * p.a + st.x * p.b, y: s.y + f.y * p.a + st.y * p.b }
}

export function streamVector(c: Conditions): Vec2 {
  return fromBearing(c.streamSetDeg, knotsToMs(c.streamKn))
}

/** Velocity over the ground of the boat's centre. */
export function groundVelocity(s: YachtState, c: Conditions): Vec2 {
  const f = forward(s.heading)
  const st = starboard(s.heading)
  return add(add(scale(f, s.u), scale(st, s.v)), streamVector(c))
}

export function speedOverGround(s: YachtState, c: Conditions): number {
  return length(groundVelocity(s, c))
}

/** Signed relative angle the wind comes FROM (deg, + = from starboard). */
function relativeWindFrom(headingDeg: number, windFromDeg: number): number {
  const d = norm360(windFromDeg - headingDeg)
  return d > 180 ? d - 360 : d
}

export interface Forces {
  du: number
  dv: number
  dr: number
  /** Yaw acceleration parts, exposed for teaching overlays. */
  propWalk: number
  windYaw: number
}

export function forces(s: YachtState, ctl: Controls, c: Conditions): Forces {
  const throttle = Math.max(-1, Math.min(1, ctl.throttle))
  const rudder = Math.max(-1, Math.min(1, ctl.rudder))
  const f = forward(s.heading)
  const st = starboard(s.heading)
  const windTo = fromBearing(c.windFromDeg + 180, knotsToMs(c.windKn))
  const rel = sub(windTo, groundVelocity(s, c))
  const wf = dot(rel, f)
  const ws = dot(rel, st)
  const w2 = dot(rel, rel)

  const thrust = throttle >= 0 ? throttle * 0.28 : throttle * 0.18
  const du = thrust - 0.03 * s.u * Math.abs(s.u) - 0.03 * s.u + 0.0012 * wf * Math.abs(wf)

  const lateralDamping = 0.25 + 0.6 * Math.abs(s.u)
  const dv = -lateralDamping * s.v - 0.6 * s.v * Math.abs(s.v) + 0.002 * ws * Math.abs(ws)

  // Propwash only flows over the rudder when going ahead; astern the rudder needs sternway.
  const flow = s.u + (throttle > 0 ? 1.1 * throttle : 0)
  const rudderYaw = 0.1 * rudder * flow * Math.abs(flow)
  // Right-handed propeller: astern kicks the stern to port (bow to starboard). Fades once the boat moves.
  const fade = 1 / (1 + (s.u / 0.6) ** 2)
  const propWalk = (throttle < 0 ? 0.09 * -throttle : -0.012 * throttle) * fade
  // The bow has more windage and less grip: it blows off until the wind is on the quarter.
  const theta = relativeWindFrom(s.heading, c.windFromDeg)
  const grip = (1 / (1 + 0.7 * Math.abs(s.u))) * (s.u < -0.05 ? 1.4 : 1)
  const windYaw = -0.0012 * w2 * Math.sin(toRad(theta)) * Math.cos(toRad(Math.abs(theta) - 40)) * grip
  const dr = rudderYaw + propWalk + windYaw - 0.9 * s.r - 1.5 * s.r * Math.abs(s.r)
  return { du, dv, dr, propWalk, windYaw }
}

function pointVelocityBody(s: YachtState, p: BodyPoint, c: Conditions): { vf: number; vs: number } {
  const cur = streamVector(c)
  return {
    vf: s.u - s.r * p.b + dot(cur, forward(s.heading)),
    vs: s.v + s.r * p.a + dot(cur, starboard(s.heading)),
  }
}

/** Apply an impulse (per unit mass) at body point p along body direction (nf, ns). */
function applyImpulse(s: YachtState, p: BodyPoint, nf: number, ns: number, j: number) {
  s.u += j * nf
  s.v += j * ns
  s.r += (j * (p.a * ns - p.b * nf)) / GYRATION2
}

function effectiveMass(p: BodyPoint, nf: number, ns: number): number {
  const arm = p.a * ns - p.b * nf
  return 1 + (arm * arm) / GYRATION2
}

function toBody(heading: number, n: Vec2): { nf: number; ns: number } {
  return { nf: dot(n, forward(heading)), ns: dot(n, starboard(heading)) }
}

/** Outward normal and depth of point q inside polygon, using the nearest edge. */
function nearestEdge(q: Vec2, poly: Vec2[]): { n: Vec2; depth: number } {
  let best = { n: { x: 0, y: 1 }, depth: Infinity }
  let area = 0
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    area += a.x * b.y - b.x * a.y
  }
  const ccw = area > 0
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const e = sub(b, a)
    const len = length(e)
    if (len < 1e-9) continue
    const t = Math.max(0, Math.min(1, dot(sub(q, a), e) / (len * len)))
    const closest = add(a, scale(e, t))
    const d = length(sub(q, closest))
    if (d < best.depth) {
      // Outward normal: right of the edge for a counter-clockwise polygon.
      const n = ccw ? { x: e.y / len, y: -e.x / len } : { x: -e.y / len, y: e.x / len }
      best = { n, depth: d }
    }
  }
  return best
}

export interface StepInput {
  controls: Controls
  conditions: Conditions
  lines?: MooringLine[]
  obstacles?: Obstacle[]
}

export interface StepResult {
  state: YachtState
  contacts: ContactEvent[]
  /** Line ids that are taut this step. */
  taut: string[]
}

/** Advance the yacht by dt seconds (use small steps, e.g. 1/60 s). */
export function step(prev: YachtState, input: StepInput, dt: number): StepResult {
  const { controls, conditions } = input
  const s: YachtState = { ...prev }
  const f = forces(s, controls, conditions)
  s.u += f.du * dt
  s.v += f.dv * dt
  s.r += f.dr * dt

  const contacts: ContactEvent[] = []
  const taut = new Set<string>()
  for (let iter = 0; iter < 4; iter++) {
    for (const line of input.lines ?? []) {
      const pw = toWorld(s, line.at)
      const d = sub(line.anchor, pw)
      const dist = length(d)
      if (dist <= line.length || dist < 1e-6) continue
      taut.add(line.id)
      const { nf, ns } = toBody(s.heading, scale(d, 1 / dist))
      const pv = pointVelocityBody(s, line.at, conditions)
      const vn = pv.vf * nf + pv.vs * ns
      const target = Math.min(0.5, ((dist - line.length) * 0.3) / dt)
      const j = (target - vn) / effectiveMass(line.at, nf, ns)
      if (j > 0) applyImpulse(s, line.at, nf, ns, j)
    }
    for (const ob of input.obstacles ?? []) {
      hullPoints.forEach((hp, idx) => {
        const pw = toWorld(s, hp)
        if (!pointInPolygon(pw, ob.poly)) return
        const { n, depth } = nearestEdge(pw, ob.poly)
        const { nf, ns } = toBody(s.heading, n)
        const pv = pointVelocityBody(s, hp, conditions)
        const vn = pv.vf * nf + pv.vs * ns
        if (iter === 0 && vn < -0.02) contacts.push({ obstacle: ob.id, kind: ob.kind, speed: -vn, point: idx })
        const pushOut = Math.min(0.15, (depth * 0.2) / dt)
        const j = (pushOut - vn) / effectiveMass(hp, nf, ns)
        if (j <= 0) return
        applyImpulse(s, hp, nf, ns, j)
        // Fender friction slows sliding along the obstacle.
        const tf = -ns
        const ts = nf
        const pv2 = pointVelocityBody(s, hp, conditions)
        const vt = pv2.vf * tf + pv2.vs * ts
        const jt = Math.max(-0.3 * j, Math.min(0.3 * j, -vt / effectiveMass(hp, tf, ts)))
        applyImpulse(s, hp, tf, ts, jt)
      })
    }
  }

  const g = groundVelocity(s, conditions)
  s.x += g.x * dt
  s.y += g.y * dt
  s.heading = norm360(s.heading + toDeg(s.r) * dt)
  return { state: s, contacts, taut: [...taut] }
}

/** Predict the centre track for the next `seconds` with fixed controls (teaching overlay). */
export function predictTrack(s: YachtState, input: StepInput, seconds: number, dt = 0.1): Vec2[] {
  const out: Vec2[] = [{ x: s.x, y: s.y }]
  let cur = s
  for (let t = 0; t < seconds; t += dt) {
    cur = step(cur, { ...input, obstacles: [] }, dt).state
    out.push({ x: cur.x, y: cur.y })
  }
  return out
}

export const msToKn = (ms: number) => ms / knotsToMs(1)
