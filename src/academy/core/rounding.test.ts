import { describe, expect, it } from 'vitest'
import { sailboat } from '../boats/sailboat'
import type { Environment } from './environment'
import { optimalRouteVia } from './optimal'
import { roundsMark, sweptAngle } from './rounding'
import { evaluateRoute } from './route'
import { vec } from './vec'

const env: Environment = { windFromDeg: 0, windSpeedKn: 12, currentSetDeg: 0, currentSpeedKn: 0 }

describe('rounding', () => {
  const mark = vec(0, 0)

  it('measures the swept angle (anticlockwise positive)', () => {
    // Passing a mark that is on our left while sailing north: anticlockwise.
    expect(sweptAngle([vec(50, -500), vec(50, 500)], mark)).toBeGreaterThan(160)
    expect(sweptAngle([vec(-50, -500), vec(-50, 500)], mark)).toBeLessThan(-160)
  })

  it('knows port from starboard rounding', () => {
    const leaveToPort = [vec(50, -500), vec(50, 500)]
    expect(roundsMark(leaveToPort, mark, 'port')).toBe(true)
    expect(roundsMark(leaveToPort, mark, 'starboard')).toBe(false)
    // Windward-leeward: up the right side, round anticlockwise, back down: about +360.
    const loop = [vec(0, -800), vec(40, 0), vec(0, 40), vec(-40, 0), vec(-10, -800)]
    expect(sweptAngle(loop, mark)).toBeGreaterThan(300)
    expect(roundsMark(loop, mark, 'port')).toBe(true)
  })

  it('ignores marks the route does not go round', () => {
    expect(roundsMark([vec(-500, -500), vec(-500, 500)], vec(400, 0), 'port')).toBe(false)
    expect(roundsMark([vec(-500, -500), vec(-500, 500)], vec(400, 0), 'starboard')).toBe(false)
  })
})

describe('optimalRouteVia', () => {
  const start = vec(0, 0)
  const finish = vec(60, 0)
  const markAt = vec(0, 1500)

  for (const side of ['port', 'starboard'] as const) {
    it(`windward-leeward leaving the mark to ${side}`, () => {
      const r = optimalRouteVia(start, { at: markAt, side }, finish, env, sailboat)
      expect(r).not.toBeNull()
      expect(r!.feasible).toBe(true)
      expect(roundsMark(r!.points, markAt, side)).toBe(true)
      // Not slower than a sensible hand-made route that keeps 40 m from the mark.
      const s = side === 'port' ? 1 : -1
      const hand = evaluateRoute([start, vec(s * 1300, 1500 - 1300 * 0.84), vec(s * 40, 1500), vec(0, 1540), vec(-s * 40, 1500), finish], env, sailboat)
      if (hand.feasible && roundsMark(hand.points, markAt, side)) {
        expect(r!.totalTimeS).toBeLessThanOrEqual(hand.totalTimeS + 1)
      }
    })
  }
})
