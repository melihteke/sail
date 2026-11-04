/** SVG-space point (y down). Wind always blows from the top of the picture (north). */
export interface P {
  x: number
  y: number
}

export interface ManeuverStep {
  /** Index of the path point where this step starts. */
  at: number
  key: string
}

export interface Maneuver {
  id: 'quickStop' | 'figure8' | 'lifesling'
  mob: P
  /** Index of the point where the person falls overboard. */
  mobAt: number
  path: P[]
  steps: ManeuverStep[]
}

const p = (x: number, y: number): P => ({ x, y })

export const maneuvers: Maneuver[] = [
  {
    id: 'quickStop',
    mob: p(200, 236),
    mobAt: 1,
    path: [
      p(50, 230), p(200, 230), p(240, 225), p(268, 208), p(280, 185), p(272, 163), p(248, 152), p(220, 158), p(196, 176),
      p(180, 205), p(172, 245), p(170, 280), p(180, 305), p(200, 315), p(218, 305), p(222, 280), p(214, 258), p(205, 248),
    ],
    steps: [
      { at: 0, key: 'qs1' },
      { at: 1, key: 'qs2' },
      { at: 2, key: 'qs3' },
      { at: 6, key: 'qs4' },
      { at: 11, key: 'qs5' },
      { at: 14, key: 'qs6' },
      { at: 17, key: 'qs7' },
    ],
  },
  {
    id: 'figure8',
    mob: p(160, 236),
    mobAt: 1,
    path: [
      p(40, 230), p(160, 230), p(250, 230), p(330, 230), p(358, 224), p(373, 205), p(366, 186), p(345, 178), p(315, 186),
      p(280, 205), p(240, 232), p(205, 262), p(180, 285), p(165, 276), p(160, 260), p(160, 249),
    ],
    steps: [
      { at: 0, key: 'f1' },
      { at: 1, key: 'f2' },
      { at: 2, key: 'f3' },
      { at: 4, key: 'f4' },
      { at: 8, key: 'f5' },
      { at: 12, key: 'f6' },
      { at: 15, key: 'f7' },
    ],
  },
  {
    id: 'lifesling',
    mob: p(200, 236),
    mobAt: 1,
    path: [
      p(50, 230), p(200, 230), p(236, 222), p(256, 200), p(250, 174), p(225, 160), p(195, 163), p(170, 180), p(157, 208),
      p(160, 240), p(178, 263), p(208, 270), p(236, 258), p(246, 238), p(240, 220),
    ],
    steps: [
      { at: 0, key: 'ls1' },
      { at: 1, key: 'ls2' },
      { at: 2, key: 'ls3' },
      { at: 5, key: 'ls4' },
      { at: 11, key: 'ls5' },
      { at: 14, key: 'ls6' },
    ],
  },
]

/** The first actions after someone falls overboard, in order. */
export const firstActions = ['fa1', 'fa2', 'fa3', 'fa4', 'fa5', 'fa6']

export function pathLengths(path: P[]): number[] {
  const out = [0]
  for (let i = 1; i < path.length; i++) out.push(out[i - 1] + Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y))
  return out
}

/** Position and heading at fraction f (0..1) of the path length. */
export function samplePath(path: P[], f: number): { pos: P; heading: number; index: number } {
  const lens = pathLengths(path)
  const total = lens[lens.length - 1]
  const d = Math.max(0, Math.min(1, f)) * total
  let i = 1
  while (i < lens.length - 1 && lens[i] < d) i++
  const a = path[i - 1]
  const b = path[i]
  const seg = lens[i] - lens[i - 1] || 1
  const tt = (d - lens[i - 1]) / seg
  const pos = { x: a.x + (b.x - a.x) * tt, y: a.y + (b.y - a.y) * tt }
  // Smooth heading: blend this segment with the next one near its end.
  const c = path[Math.min(i + 1, path.length - 1)]
  const h1 = Math.atan2(b.x - a.x, -(b.y - a.y))
  const h2 = Math.atan2(c.x - b.x, -(c.y - b.y))
  let dh = h2 - h1
  if (dh > Math.PI) dh -= 2 * Math.PI
  if (dh < -Math.PI) dh += 2 * Math.PI
  const blend = Math.max(0, (tt - 0.5) * 2) * 0.5
  const heading = (((h1 + dh * blend) * 180) / Math.PI + 360) % 360
  return { pos, heading, index: i - 1 }
}

/**
 * Quality of a final approach to a person in the water, by true wind angle of the approach heading.
 * A close reach lets you slow down by easing the sails while keeping steerage.
 */
export function approachQuality(twaAbs: number): 'tooHigh' | 'good' | 'beam' | 'downwind' {
  if (twaAbs < 40) return 'tooHigh'
  if (twaAbs <= 80) return 'good'
  if (twaAbs <= 105) return 'beam'
  return 'downwind'
}
