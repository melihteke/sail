import { landProbe, norm180, norm360, type CourseData, type HelmEvent, type RaceState, type XY } from './sim'

/**
 * A simple autopilot that sails the course by the book (close-hauled upwind, VMG angles downwind,
 * marks on the correct side). Used to check that every course can be sailed and in tests.
 */
export function waypoints(c: CourseData): XY[][] {
  const out: XY[][] = []
  let prev: XY = [(c.start.committee[0] + c.start.pin[0]) / 2, (c.start.committee[1] + c.start.pin[1]) / 2]
  for (const L of c.legs) {
    if (L.kind === 'mark') {
      const dx = L.at[0] - prev[0]
      const dy = L.at[1] - prev[1]
      const len = Math.hypot(dx, dy) || 1
      const a: XY = [dx / len, dy / len]
      // Keep the mark on the required side: approach just to the other side of it, then swing out along the ray.
      const side: XY = L.side > 0 ? [a[1], -a[0]] : [-a[1], a[0]]
      out.push([
        [L.at[0] - a[0] * 10 + side[0] * 14, L.at[1] - a[1] * 10 + side[1] * 14],
        // Swing out along the ray, then cross it turning the right way (counter-clockwise for port).
        [L.at[0] + L.ray[0] * 16 + L.ray[1] * L.side * 16, L.at[1] + L.ray[1] * 16 - L.ray[0] * L.side * 16],
        [L.at[0] + L.ray[0] * 16 - L.ray[1] * L.side * 24, L.at[1] + L.ray[1] * 16 + L.ray[0] * L.side * 24],
      ])
      prev = L.at
    } else {
      const mid: XY = [(L.a[0] + L.b[0]) / 2, (L.a[1] + L.b[1]) / 2]
      out.push([mid, [mid[0] + L.dir[0] * 18, mid[1] + L.dir[1] * 18]])
      prev = mid
    }
  }
  return out
}
export interface Bot {
  helm: (s: RaceState) => number
}

export function createBot(c: CourseData, opts: { upwindTwa?: number; downwindTwa?: number } = {}): Bot {
  const upTwa = opts.upwindTwa ?? 45
  const downTwa = opts.downwindTwa ?? 150
  const wps = waypoints(c)
  let leg = -1
  let idx = 0
  let tack = 0
  const preStart: XY = (() => {
    const mid: XY = [(c.start.committee[0] + c.start.pin[0]) / 2, (c.start.committee[1] + c.start.pin[1]) / 2]
    const a = (c.wind.dir * Math.PI) / 180
    return [mid[0] - Math.sin(a) * 35, mid[1] - Math.cos(a) * 35]
  })()

  const toward = (s: RaceState, p: XY) => norm360((Math.atan2(p[0] - s.x, p[1] - s.y) * 180) / Math.PI)

  /** True when sailing on `heading` would hit the shore within `ahead` metres. */
  const blocked = (s: RaceState, heading: number, ahead = 45) => {
    const h = (heading * Math.PI) / 180
    for (const d of [ahead / 2, ahead]) {
      const x = s.x + Math.sin(h) * d
      const y = s.y + Math.cos(h) * d
      const [bx0, by0, bx1, by1] = c.bounds
      if (x < bx0 || x > bx1 || y < by0 || y > by1 || !landProbe(c, x, y).water) return true
    }
    return false
  }

  const steer = (s: RaceState, bearing: number, dist = Infinity) => {
    const W = s.windDir
    const rb = norm180(bearing - W)
    if (Math.abs(rb) < upTwa) {
      if (tack === 0) tack = rb < 0 ? 1 : -1
      if (tack === 1 && (rb >= upTwa - 6 || blocked(s, W - upTwa))) tack = -1
      else if (tack === -1 && (rb <= -(upTwa - 6) || blocked(s, W + upTwa))) tack = 1
      return tack === 1 ? W - upTwa : W + upTwa
    }
    const db = norm180(bearing - (W + 180))
    // Close to a downwind waypoint, just steer for it (a dead run is allowed).
    if (Math.abs(db) < 180 - downTwa && dist > 35) {
      if (tack === 0) tack = db > 0 ? -1 : 1
      if (tack === 1 && (db <= -(180 - downTwa - 6) || blocked(s, W - downTwa))) tack = -1
      else if (tack === -1 && (db >= 180 - downTwa - 6 || blocked(s, W + downTwa))) tack = 1
      return tack === 1 ? W - downTwa : W + downTwa
    }
    tack = 0
    return bearing
  }

  return {
    helm(s) {
      if (s.leg === 0) {
        if (s.t < -12 && !s.ocs) {
          const d = Math.hypot(preStart[0] - s.x, preStart[1] - s.y)
          return Math.round(norm360(d < 12 ? s.windDir : steer(s, toward(s, preStart))))
        }
        tack = 1
        return Math.round(norm360(s.ocs ? s.windDir + 180 : s.windDir - upTwa))
      }
      if (s.leg !== leg) {
        leg = s.leg
        idx = 0
        tack = 0
      }
      const list = wps[leg - 1]
      if (!list) return Math.round(s.target)
      let p = list[Math.min(idx, list.length - 1)]!
      if (Math.hypot(p[0] - s.x, p[1] - s.y) < 12) {
        // Reached the last point without completing the leg: go round again.
        idx = idx < list.length - 1 ? idx + 1 : 0
        tack = 0
        p = list[idx]
      }
      return Math.round(norm360(steer(s, toward(s, p), Math.hypot(p[0] - s.x, p[1] - s.y))))
    },
  }
}

/** Sail a course with the bot, returning the helm events (only changes) and the final state. */
export function botRace(c: CourseData, step: (c: CourseData, s: RaceState, target: number) => RaceState, init: RaceState, opts?: Parameters<typeof createBot>[1]) {
  const bot = createBot(c, opts)
  const events: HelmEvent[] = []
  let s = init
  let last = s.target
  while (s.status === 'racing') {
    const h = bot.helm(s)
    if (h !== last) {
      events.push([s.t, h])
      last = h
    }
    s = step(c, s, h)
  }
  return { events, final: s }
}
