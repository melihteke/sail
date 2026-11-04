import { describe, expect, it } from 'vitest'
import { sailTrim } from './sail'

describe('sailTrim', () => {
  it('sets the sail to leeward', () => {
    expect(sailTrim(45).side).toBe('port')
    expect(sailTrim(-45).side).toBe('starboard')
  })

  it('eases the sail as the wind goes aft', () => {
    const close = sailTrim(42).boomDeg
    const beam = sailTrim(90).boomDeg
    const run = sailTrim(175).boomDeg
    expect(close).toBeLessThan(beam)
    expect(beam).toBeLessThan(run)
    expect(run).toBeLessThanOrEqual(85)
  })

  it('luffs on the centreline head to wind', () => {
    expect(sailTrim(5)).toEqual({ boomDeg: 0, side: 'centre' })
  })
})
