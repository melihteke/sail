import { describe, expect, it } from 'vitest'
import { pointInPolygon } from '../../../core/polygon'
import { norm180 } from '../../../core/units'
import { groundVelocity, step, type MooringLine, type YachtState } from '../../../core/yacht'
import { findHarbourLevel, harbourLevels, type HarbourLevel } from './levels'

interface Segment {
  seconds: number
  throttle: number
  rudder: number
  slip?: string[]
}

/** Runs a scripted manoeuvre and reports the worst impact and whether the goal was reached. */
function play(level: HarbourLevel, script: Segment[]) {
  let s: YachtState = level.start
  let lines: MooringLine[] = level.lines ?? []
  let worstHard = 0
  let worstPontoon = 0
  let reached = false
  let still = 0
  for (const seg of script) {
    lines = lines.filter((l) => !seg.slip?.includes(l.id))
    for (let t = 0; t < seg.seconds; t += 1 / 60) {
      const r = step(s, { controls: { throttle: seg.throttle, rudder: seg.rudder }, conditions: level.conditions, lines, obstacles: level.obstacles }, 1 / 60)
      s = r.state
      for (const c of r.contacts) {
        if (c.kind === 'pontoon') worstPontoon = Math.max(worstPontoon, c.speed)
        else worstHard = Math.max(worstHard, c.speed)
      }
      const g = level.goal
      const v = groundVelocity(s, level.conditions)
      const headingOk = g.heading === undefined || g.tol === undefined || Math.abs(norm180(s.heading - g.heading)) <= g.tol
      const ok = pointInPolygon(s, g.zone) && headingOk && (g.kind === 'exit' || Math.hypot(v.x, v.y) < 0.25)
      still = ok ? still + 1 / 60 : 0
      if (still > (g.kind === 'exit' ? 0.2 : 1.5)) reached = true
    }
  }
  return { reached, worstHard, worstPontoon, state: s }
}

describe('harbour levels', () => {
  it('start in a safe position', () => {
    for (const level of harbourLevels) {
      const r = play(level, [{ seconds: 3, throttle: 0, rudder: 0 }])
      expect(r.worstHard, level.id).toBeLessThan(0.05)
      expect(r.worstPontoon, level.id).toBeLessThan(0.3)
    }
  })

  it('first steps: motor to the box and stop', () => {
    const r = play(findHarbourLevel('first-steps')!, [
      { seconds: 4, throttle: 0.4, rudder: 0.4 },
      { seconds: 12, throttle: 0.4, rudder: 0 },
      { seconds: 10, throttle: 0, rudder: 0 },
      { seconds: 3, throttle: -0.4, rudder: 0 },
      { seconds: 6, throttle: 0, rudder: 0 },
    ])
    expect(r.worstHard).toBeLessThan(0.05)
    expect(r.state.y).toBeGreaterThan(30)
  })

  it('spring-off: motoring ahead against the bow spring swings the stern out, then reverse clear', () => {
    const level = findHarbourLevel('spring-off')!
    const r = play(level, [
      { seconds: 1, throttle: 0, rudder: 0, slip: ['bowLine', 'sternLine'] },
      { seconds: 12, throttle: 0.6, rudder: -1 },
      { seconds: 0.5, throttle: 0, rudder: 0 },
      { seconds: 30, throttle: -0.6, rudder: 0.8, slip: ['bowSpring'] },
    ])
    expect(r.worstHard).toBeLessThan(0.3)
    expect(r.worstPontoon).toBeLessThan(0.6)
    expect(r.reached).toBe(true)
  })

  it('spring-off without the spring: the onshore wind keeps the boat pinned', () => {
    const level = findHarbourLevel('spring-off')!
    const r = play(level, [{ seconds: 20, throttle: -0.5, rudder: 0, slip: ['bowLine', 'sternLine', 'bowSpring'] }])
    expect(r.reached).toBe(false)
  })
})
