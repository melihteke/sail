/**
 * Light characteristics (IALA / chart abbreviations) as on/off timelines.
 * Durations are representative values for practice; real lights vary within the IALA ranges.
 */
export type LightColor = 'W' | 'R' | 'G' | 'Y' | 'Bu'

export interface Phase {
  on: boolean
  dur: number
  color?: LightColor
}

export type LightKind = 'Fl' | 'FlGroup' | 'FlComposite' | 'LFl' | 'Iso' | 'Oc' | 'Q' | 'VQ' | 'QGroup' | 'VQGroup' | 'QLFl' | 'Mo' | 'Al'

export interface LightChar {
  id: string
  /** Chart abbreviation, e.g. "Fl(2) W 10s". */
  code: string
  kind: LightKind
  color: LightColor
  period: number
  phases: Phase[]
  /** Flashes per group (for descriptions). */
  count?: number
  /** Mark that typically shows this light. */
  markId?: string
}

const FLASH = 0.5
const FLASH_GAP = 1.0
const GROUP_GAP = 2.0
const LONG_FLASH = 2.0
const Q_ON = 0.4
const Q_OFF = 0.6
const VQ_ON = 0.2
const VQ_OFF = 0.3

function fill(phases: Phase[], period: number): Phase[] {
  const used = phases.reduce((s, p) => s + p.dur, 0)
  if (used > period + 1e-9) throw new Error(`light pattern (${used}s) longer than period (${period}s)`)
  const out = [...phases]
  const rest = period - used
  if (rest > 1e-9) {
    const last = out[out.length - 1]
    if (last && !last.on) out[out.length - 1] = { ...last, dur: last.dur + rest }
    else out.push({ on: false, dur: rest })
  }
  return out
}

function flashes(n: number, on: number, off: number): Phase[] {
  const p: Phase[] = []
  for (let i = 0; i < n; i++) {
    p.push({ on: true, dur: on })
    if (i < n - 1) p.push({ on: false, dur: off })
  }
  return p
}

export const lightPatterns = {
  fl: (period: number) => fill(flashes(1, FLASH, 0), period),
  flGroup: (n: number, period: number) => fill(flashes(n, FLASH, FLASH_GAP), period),
  flComposite: (a: number, b: number, period: number) =>
    fill([...flashes(a, FLASH, FLASH_GAP), { on: false, dur: GROUP_GAP }, ...flashes(b, FLASH, FLASH_GAP)], period),
  lfl: (period: number) => fill([{ on: true, dur: LONG_FLASH }], period),
  iso: (period: number) => [
    { on: true, dur: period / 2 },
    { on: false, dur: period / 2 },
  ],
  oc: (period: number) => [
    { on: true, dur: period - 1 },
    { on: false, dur: 1 },
  ],
  q: () => fill(flashes(1, Q_ON, 0), Q_ON + Q_OFF),
  vq: () => fill(flashes(1, VQ_ON, 0), VQ_ON + VQ_OFF),
  qGroup: (n: number, period: number) => fill(flashes(n, Q_ON, Q_OFF), period),
  vqGroup: (n: number, period: number) => fill(flashes(n, VQ_ON, VQ_OFF), period),
  qLfl: (n: number, period: number) => fill([...flashes(n, Q_ON, Q_OFF), { on: false, dur: Q_OFF }, { on: true, dur: LONG_FLASH }], period),
  moA: (period: number) =>
    fill(
      [
        { on: true, dur: 0.5 },
        { on: false, dur: 0.5 },
        { on: true, dur: 1.5 },
      ],
      period,
    ),
  al: (a: LightColor, b: LightColor, on: number, off: number): Phase[] => [
    { on: true, dur: on, color: a },
    { on: false, dur: off },
    { on: true, dur: on, color: b },
    { on: false, dur: off },
  ],
}

const P = lightPatterns

export const lightChars: LightChar[] = [
  { id: 'fl-w-5', code: 'Fl W 5s', kind: 'Fl', color: 'W', period: 5, phases: P.fl(5) },
  { id: 'fl2-w-5', code: 'Fl(2) W 5s', kind: 'FlGroup', count: 2, color: 'W', period: 5, phases: P.flGroup(2, 5), markId: 'isolated' },
  { id: 'fl3-w-15', code: 'Fl(3) W 15s', kind: 'FlGroup', count: 3, color: 'W', period: 15, phases: P.flGroup(3, 15) },
  { id: 'fl4-w-20', code: 'Fl(4) W 20s', kind: 'FlGroup', count: 4, color: 'W', period: 20, phases: P.flGroup(4, 20) },
  { id: 'lfl-w-10', code: 'LFl W 10s', kind: 'LFl', color: 'W', period: 10, phases: P.lfl(10), markId: 'safe' },
  { id: 'iso-w-4', code: 'Iso W 4s', kind: 'Iso', color: 'W', period: 4, phases: P.iso(4) },
  { id: 'oc-w-5', code: 'Oc W 5s', kind: 'Oc', color: 'W', period: 5, phases: P.oc(5) },
  { id: 'q-w', code: 'Q W', kind: 'Q', color: 'W', period: 1, phases: P.q(), markId: 'north' },
  { id: 'vq-w', code: 'VQ W', kind: 'VQ', color: 'W', period: 0.5, phases: P.vq(), markId: 'north' },
  { id: 'q3-w-10', code: 'Q(3) W 10s', kind: 'QGroup', count: 3, color: 'W', period: 10, phases: P.qGroup(3, 10), markId: 'east' },
  { id: 'vq3-w-5', code: 'VQ(3) W 5s', kind: 'VQGroup', count: 3, color: 'W', period: 5, phases: P.vqGroup(3, 5), markId: 'east' },
  { id: 'q6lfl-w-15', code: 'Q(6)+LFl W 15s', kind: 'QLFl', count: 6, color: 'W', period: 15, phases: P.qLfl(6, 15), markId: 'south' },
  { id: 'q9-w-15', code: 'Q(9) W 15s', kind: 'QGroup', count: 9, color: 'W', period: 15, phases: P.qGroup(9, 15), markId: 'west' },
  { id: 'moa-w-6', code: 'Mo(A) W 6s', kind: 'Mo', color: 'W', period: 6, phases: P.moA(6), markId: 'safe' },
  { id: 'fl-r-4', code: 'Fl R 4s', kind: 'Fl', color: 'R', period: 4, phases: P.fl(4), markId: 'port' },
  { id: 'fl-g-4', code: 'Fl G 4s', kind: 'Fl', color: 'G', period: 4, phases: P.fl(4), markId: 'starboard' },
  { id: 'fl2-r-6', code: 'Fl(2) R 6s', kind: 'FlGroup', count: 2, color: 'R', period: 6, phases: P.flGroup(2, 6), markId: 'port' },
  { id: 'fl2-g-6', code: 'Fl(2) G 6s', kind: 'FlGroup', count: 2, color: 'G', period: 6, phases: P.flGroup(2, 6), markId: 'starboard' },
  { id: 'fl21-r-10', code: 'Fl(2+1) R 10s', kind: 'FlComposite', color: 'R', period: 10, phases: P.flComposite(2, 1, 10), markId: 'pref-starboard' },
  { id: 'fl21-g-10', code: 'Fl(2+1) G 10s', kind: 'FlComposite', color: 'G', period: 10, phases: P.flComposite(2, 1, 10), markId: 'pref-port' },
  { id: 'fl-y-5', code: 'Fl Y 5s', kind: 'Fl', color: 'Y', period: 5, phases: P.fl(5), markId: 'special' },
  { id: 'al-buy-3', code: 'Al Bu Y 3s', kind: 'Al', color: 'Bu', period: 3, phases: P.al('Bu', 'Y', 1, 0.5), markId: 'wreck' },
]

export function findLight(id: string): LightChar {
  const l = lightChars.find((x) => x.id === id)
  if (!l) throw new Error(`unknown light ${id}`)
  return l
}

/** Whether the light is lit at time t (s), and in which colour. */
export function lightState(light: LightChar, t: number): { on: boolean; color: LightColor } {
  let r = ((t % light.period) + light.period) % light.period
  for (const p of light.phases) {
    if (r < p.dur) return { on: p.on, color: p.color ?? light.color }
    r -= p.dur
  }
  return { on: false, color: light.color }
}

export const lightColorHex: Record<LightColor, string> = {
  W: '#fff7d6',
  R: '#ff453a',
  G: '#30d158',
  Y: '#ffd60a',
  Bu: '#409cff',
}
