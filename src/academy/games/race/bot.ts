import { landProbe, norm180, norm360, type CourseData, type HelmEvent, type RaceState, type XY } from './sim'

/**
 * A simple autopilot that sails the course by the book (close-hauled upwind, VMG angles downwind,
 * marks on the correct side). Used to check that every course can be sailed and in tests.
 */
export function waypoints(c: CourseData): Record<string, XY[]> {
  const a = (c.wind.dir * Math.PI) / 180
  const u: XY = [Math.sin(a), Math.cos(a)]
  const r: XY = [Math.cos(a), -Math.sin(a)]
  const at = (p: XY, du: number, dr: number): XY => [p[0] + u[0] * du + r[0] * dr, p[1] + u[1] * du + r[1] * dr]
  const m = c.marks
  const gate: XY = [(m.gateS[0] + m.gateP[0]) / 2, (m.gateS[1] + m.gateP[1]) / 2]
  const finish: XY = [(m.finishBoat[0] + m.finishPin[0]) / 2, (m.finishBoat[1] + m.finishPin[1]) / 2]
  return {
    windward: [at(m.windward, -8, 14), at(m.windward, 14, 0)],
    offset: [at(m.offset, 14, 0), at(m.offset, 0, -14)],
    gate: [at(gate, 0, 0), at(gate, -18, 0)],
    finish: [at(finish, 18, 0)],
  }
}

export interface Bot {
  helm: (s: RaceState) => number
}

export function createBot(c: CourseData, opts: { upwindTwa?: number; downwindTwa?: number } = {}): Bot {
  const upTwa = opts.upwindTwa ?? 45
  const downTwa = opts.downwindTwa ?? 150
  const wps = waypoints(c)
  let leg = ''
  let idx = 0
  let tack = 0
  const preStart: XY = (() => {
    const mid: XY = [(c.marks.committee[0] + c.marks.pin[0]) / 2, (c.marks.committee[1] + c.marks.pin[1]) / 2]
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
      if (s.leg === 'start') {
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
      const list = wps[leg]
      if (!list) return Math.round(s.target)
      let p = list[Math.min(idx, list.length - 1)]
      if (Math.hypot(p[0] - s.x, p[1] - s.y) < 12 && idx < list.length - 1) {
        idx++
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
