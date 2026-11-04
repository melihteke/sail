import { describe, expect, it } from 'vitest'
import { dipMin, noonLatitude, reduceSunLL, refractionMin, sextantFor, toDegMin } from './sextantModel'

describe('sextant reduction', () => {
  it('uses the usual dip and refraction values', () => {
    expect(dipMin(4)).toBeCloseTo(3.52, 2)
    expect(refractionMin(45)).toBeCloseTo(1.0, 1)
    expect(refractionMin(10)).toBeCloseTo(5.4, 1)
  })

  it('reduces a lower-limb sun sight', () => {
    // Hs 52°10.0', IE 2.0' on the arc, height of eye 4 m.
    const r = reduceSunLL(52 + 10 / 60, 2, 4)
    expect(r.icMin).toBe(-2)
    const hoMin = (r.ho - 52) * 60
    // 10.0 - 2.0 - 3.5 - 0.8 + 16.0 ≈ 19.7'
    expect(hoMin).toBeCloseTo(19.7, 0)
  })

  it('finds latitude from a noon sight', () => {
    expect(noonLatitude(50, 10, 'S')).toBeCloseTo(50)
    expect(noonLatitude(60, -10, 'S')).toBeCloseTo(20)
    expect(noonLatitude(70, 20, 'N')).toBeCloseTo(0)
  })

  it('inverts the reduction', () => {
    const hs = sextantFor(40.5, 1.5, 3)
    expect(reduceSunLL(hs, 1.5, 3).ho).toBeCloseTo(40.5, 6)
  })

  it('formats degrees and minutes', () => {
    expect(toDegMin(52.5)).toEqual({ sign: 1, d: 52, m: 30 })
    expect(toDegMin(-0.25)).toEqual({ sign: -1, d: 0, m: 15 })
    expect(toDegMin(10.99999)).toEqual({ sign: 1, d: 11, m: 0 })
  })
})
