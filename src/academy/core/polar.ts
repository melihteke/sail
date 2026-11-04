import { toRad } from './units'

/**
 * Boat speed table: speeds[i][j] is boat speed through water (knots) at
 * twa[i] (degrees, ascending, first entry = minimum sailable angle) and tws[j] (knots, ascending).
 * Below twa[0] the boat is in the no-go zone and makes no headway.
 * Between 0 and tws[0] speed scales linearly from zero; above the last tws it is clamped.
 */
export interface Polar {
  twa: number[]
  tws: number[]
  speeds: number[][]
}

function bracket(values: number[], v: number): [number, number, number] {
  if (v <= values[0]) return [0, 0, 0]
  const last = values.length - 1
  if (v >= values[last]) return [last, last, 0]
  let i = 0
  while (values[i + 1] < v) i++
  return [i, i + 1, (v - values[i]) / (values[i + 1] - values[i])]
}

export function minTwa(polar: Polar): number {
  return polar.twa[0]
}

/** Boat speed through water (knots) for an absolute TWA (degrees) and TWS (knots). */
export function boatSpeedKn(polar: Polar, twaAbs: number, twsKn: number): number {
  const a = Math.abs(twaAbs)
  if (a < polar.twa[0] || twsKn <= 0) return 0
  const [i0, i1, ti] = bracket(polar.twa, a)
  let windFactor = 1
  let w = twsKn
  if (twsKn < polar.tws[0]) {
    windFactor = twsKn / polar.tws[0]
    w = polar.tws[0]
  }
  const [j0, j1, tj] = bracket(polar.tws, w)
  const s = polar.speeds
  const top = s[i0][j0] + (s[i0][j1] - s[i0][j0]) * tj
  const bottom = s[i1][j0] + (s[i1][j1] - s[i1][j0]) * tj
  return (top + (bottom - top) * ti) * windFactor
}

export interface VmgOptimum {
  twa: number
  speedKn: number
  vmgKn: number
}

/** Best upwind angle: maximises speed * cos(TWA). */
export function bestBeat(polar: Polar, twsKn: number): VmgOptimum {
  return scanVmg(polar, twsKn, polar.twa[0], 90, 1)
}

/** Best downwind angle: maximises speed * -cos(TWA). */
export function bestRun(polar: Polar, twsKn: number): VmgOptimum {
  return scanVmg(polar, twsKn, 90, 180, -1)
}

function scanVmg(polar: Polar, tws: number, from: number, to: number, sign: 1 | -1): VmgOptimum {
  let best: VmgOptimum = { twa: from, speedKn: 0, vmgKn: -Infinity }
  for (let a = from; a <= to + 1e-9; a += 0.5) {
    const speed = boatSpeedKn(polar, a, tws)
    const vmg = speed * Math.cos(toRad(a)) * sign
    if (vmg > best.vmgKn) best = { twa: a, speedKn: speed, vmgKn: vmg }
  }
  return best
}
