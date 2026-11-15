import { describe, expect, it } from 'vitest'
import { speedOverGround, step, toWorld, type Conditions, type Controls, type Obstacle, type StepInput, type YachtState } from './yacht'

const calm: Conditions = { windFromDeg: 0, windKn: 0, streamSetDeg: 0, streamKn: 0 }
const rest: YachtState = { x: 0, y: 0, heading: 0, u: 0, v: 0, r: 0 }

function run(s: YachtState, input: StepInput, seconds: number): YachtState {
  let cur = s
  for (let t = 0; t < seconds; t += 1 / 60) cur = step(cur, input, 1 / 60).state
  return cur
}

const ctl = (throttle: number, rudder = 0): Controls => ({ throttle, rudder })
const signedHeading = (h: number) => (h > 180 ? h - 360 : h)

describe('yacht under engine', () => {
  it('goes ahead and reaches a sensible top speed', () => {
    const s = run(rest, { controls: ctl(1), conditions: calm }, 60)
    expect(s.y).toBeGreaterThan(50)
    expect(s.u).toBeGreaterThan(2.5)
    expect(s.u).toBeLessThan(3.5)
  })

  it('prop walk kicks the stern to port when going astern (bow swings to starboard)', () => {
    const s = run(rest, { controls: ctl(-0.6), conditions: calm }, 4)
    expect(s.u).toBeLessThan(0)
    expect(signedHeading(s.heading)).toBeGreaterThan(3)
  })

  it('turns to starboard with the wheel to starboard going ahead, and to port going astern', () => {
    const ahead = run(rest, { controls: ctl(0.5, 1), conditions: calm }, 6)
    expect(signedHeading(ahead.heading)).toBeGreaterThan(20)
    const astern = run({ ...rest, u: -1.2 }, { controls: ctl(-0.2, 1), conditions: calm }, 4)
    expect(signedHeading(astern.heading)).toBeLessThan(signedHeading(run({ ...rest, u: -1.2 }, { controls: ctl(-0.2, 0), conditions: calm }, 4).heading))
  })

  it('a stopped boat drifts downwind and its bow blows off downwind first', () => {
    const wind: Conditions = { ...calm, windFromDeg: 270, windKn: 15 }
    const s = run(rest, { controls: ctl(0), conditions: wind }, 8)
    expect(s.x).toBeGreaterThan(1)
    expect(signedHeading(s.heading)).toBeGreaterThan(10)
  })

  it('moves with the stream like a conveyor belt', () => {
    const s = run(rest, { controls: ctl(0), conditions: { ...calm, streamSetDeg: 90, streamKn: 2 } }, 10)
    expect(s.x).toBeCloseTo(10.29, 0)
    expect(speedOverGround(s, { ...calm, streamSetDeg: 90, streamKn: 2 })).toBeCloseTo(1.03, 1)
  })

  it('a mooring line holds the boat against the stream', () => {
    const bow = { a: 5, b: 0 }
    const anchor = toWorld(rest, bow)
    const s = run(rest, {
      controls: ctl(0),
      conditions: { ...calm, streamSetDeg: 180, streamKn: 1.5 },
      lines: [{ id: 'bow', at: bow, anchor, length: 3 }],
    }, 30)
    expect(s.y).toBeGreaterThan(-4)
  })

  it('stops against a pontoon instead of passing through it', () => {
    const pontoon: Obstacle = { id: 'p', kind: 'pontoon', poly: [{ x: -20, y: 10 }, { x: 20, y: 10 }, { x: 20, y: 12 }, { x: -20, y: 12 }] }
    let cur = rest
    let maxImpact = 0
    for (let t = 0; t < 20; t += 1 / 60) {
      const r = step(cur, { controls: ctl(0.3), conditions: calm, obstacles: [pontoon] }, 1 / 60)
      cur = r.state
      for (const c of r.contacts) maxImpact = Math.max(maxImpact, c.speed)
    }
    expect(toWorld(cur, { a: 5, b: 0 }).y).toBeLessThan(10.5)
    expect(maxImpact).toBeGreaterThan(0.5)
  })
})
