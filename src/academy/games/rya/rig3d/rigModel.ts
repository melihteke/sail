/** Simplified sail-control model for the 3D rig explorer. Every control is 0..1, where 1 = line pulled in. */

export const CONTROL_IDS = ['halyard', 'mainsheet', 'traveller', 'kicker', 'topping', 'outhaul', 'reef', 'furling', 'jibLee', 'jibWind'] as const
export type ControlId = (typeof CONTROL_IDS)[number]
export type Controls = Record<ControlId, number>

/** Parts of the boat that a control can move (used for highlighting). */
export type PartId = 'main' | 'boom' | 'jib' | 'drum' | 'car' | 'bundle'

export const CONTROL_PARTS: Record<ControlId, PartId[]> = {
  halyard: ['main'],
  mainsheet: ['boom', 'main'],
  traveller: ['car', 'boom', 'main'],
  kicker: ['boom', 'main'],
  topping: ['boom'],
  outhaul: ['main'],
  reef: ['main', 'bundle'],
  furling: ['jib', 'drum'],
  jibLee: ['jib'],
  jibWind: ['jib'],
}

export const ROPE_COLORS: Record<ControlId, string> = {
  halyard: '#ef4444',
  mainsheet: '#2563eb',
  traveller: '#06b6d4',
  kicker: '#7c3aed',
  topping: '#65a30d',
  outhaul: '#ea580c',
  reef: '#db2777',
  furling: '#ca8a04',
  jibLee: '#0d9488',
  jibWind: '#5eead4',
}

export const MAIN_CONTROLS: ControlId[] = ['halyard', 'mainsheet', 'traveller', 'kicker', 'topping', 'outhaul', 'reef']
export const JIB_CONTROLS: ControlId[] = ['furling', 'jibLee', 'jibWind']

export const SAILING: Controls = { halyard: 1, mainsheet: 0.65, traveller: 0.5, kicker: 0.6, topping: 0, outhaul: 0.6, reef: 0, furling: 0, jibLee: 0.65, jibWind: 0 }
export const STOWED: Controls = { halyard: 0, mainsheet: 1, traveller: 0.5, kicker: 0, topping: 0.8, outhaul: 0.5, reef: 0, furling: 1, jibLee: 0.2, jibWind: 0.2 }

export type Warning = 'irons' | 'boomDown' | 'hoistKicker' | 'fight' | 'mainLuff' | 'jibLuff' | 'backed'

export interface RigState {
  /** Mainsail head height as a fraction of full hoist (after any reef). */
  hoist: number
  mainUp: boolean
  /** Boom angle off the centreline towards leeward, degrees. */
  boomAngle: number
  /** Boom end lift, degrees (negative = sagging). */
  boomPitch: number
  /** Extra angle of the mainsail head vs. the boom (leech twist), degrees. */
  twist: number
  /** Clew position along the boom, 0..1. */
  clew: number
  /** Mainsail draft depth as a fraction of chord. */
  draft: number
  /** Unfurled part of the jib, 0..1. */
  jibOut: number
  jibUp: boolean
  /** Jib angle off the centreline towards leeward, degrees (negative = backed). */
  jibAngle: number
  mainLuff: number
  jibLuff: number
  /** Topping lift slack, 0 (taut) .. 1 (very slack). */
  toppingSlack: number
  /** Mainsheet / leeward jib sheet slack (eased further than the wind can push the sail). */
  sheetSlack: number
  jibLeeSlack: number
  warnings: Warning[]
}

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v))

export function rigState(c: Controls, windAngle: number): RigState {
  const hoist = clamp(c.halyard) * (1 - 0.28 * clamp(c.reef))
  const mainUp = hoist > 0.08

  const boomLimit = clamp(4 + (1 - c.mainsheet) * 80 + (0.5 - c.traveller) * 20, 0, 88)
  const boomAngle = mainUp ? Math.min(boomLimit, Math.max(0, windAngle), 88) : Math.min(boomLimit, 8)

  const sailLift = mainUp ? 10 * (1 - c.mainsheet) * clamp(boomAngle / 20) : -4
  const toppingLift = -4 + c.topping * 16
  const kickerCap = 12 * (1 - c.kicker)
  const sheetCap = 12 * (1 - c.mainsheet) + boomAngle * 0.15
  const boomPitch = Math.max(-4, Math.min(Math.max(sailLift, toppingLift), kickerCap, sheetCap))
  const toppingSlack = clamp((boomPitch - toppingLift) / 8)

  const mainLuff = mainUp ? clamp((14 - (windAngle - boomAngle)) / 14) * (windAngle < 150 ? 1 : 0.2) : 0
  const twist = 3 + Math.max(0, boomPitch) * 1.4

  const jibOut = clamp(1 - c.furling)
  const jibUp = jibOut > 0.05
  const leeLimit = 8 + (1 - c.jibLee) * 75
  const windCap = 80 - c.jibWind * 105
  const jibAngle = Math.min(Math.max(0, windAngle), leeLimit, windCap, 85)
  const jibLuff = jibUp && jibAngle >= 0 ? clamp((12 - (windAngle - jibAngle)) / 12) * (windAngle < 150 ? 1 : 0.3) : 0

  const warnings: Warning[] = []
  if (windAngle < 40 && (mainUp || jibUp)) warnings.push('irons')
  if (!mainUp && boomPitch <= -3.5) warnings.push('boomDown')
  if (c.halyard > 0.05 && c.halyard < 0.97 && c.kicker > 0.5) warnings.push('hoistKicker')
  if (mainUp && c.kicker > 0.6 && c.topping > 0.6) warnings.push('fight')
  if (mainLuff > 0.5 && windAngle >= 40) warnings.push('mainLuff')
  if (jibLuff > 0.5 && windAngle >= 40) warnings.push('jibLuff')
  if (jibUp && jibAngle < 0) warnings.push('backed')

  return {
    hoist,
    mainUp,
    boomAngle,
    boomPitch,
    twist,
    clew: 0.86 + 0.12 * clamp(c.outhaul),
    draft: 0.16 - 0.1 * clamp(c.outhaul),
    jibOut,
    jibUp,
    jibAngle,
    mainLuff,
    jibLuff,
    toppingSlack,
    sheetSlack: clamp((boomLimit - boomAngle) / 25),
    jibLeeSlack: clamp((leeLimit - jibAngle) / 25),
    warnings,
  }
}

/* ---------- "Which line?" challenge ---------- */

export interface Task {
  id: string
  control: ControlId
  dir: 1 | -1
  /** Set-up (on top of SAILING) that makes the task possible. */
  start: Partial<Controls>
}

export const TASKS: Task[] = [
  { id: 'hoist', control: 'halyard', dir: 1, start: { ...STOWED, kicker: 0, mainsheet: 0.3 } },
  { id: 'easeMain', control: 'mainsheet', dir: -1, start: { mainsheet: 0.9 } },
  { id: 'stopLift', control: 'kicker', dir: 1, start: { kicker: 0, mainsheet: 0.3 } },
  { id: 'holdBoom', control: 'topping', dir: 1, start: { ...STOWED, topping: 0 } },
  { id: 'furlJib', control: 'furling', dir: 1, start: { furling: 0 } },
  { id: 'unfurlJib', control: 'furling', dir: -1, start: { furling: 1 } },
  { id: 'trimJib', control: 'jibLee', dir: 1, start: { jibLee: 0.2 } },
  { id: 'flatFoot', control: 'outhaul', dir: 1, start: { outhaul: 0.1 } },
  { id: 'reef', control: 'reef', dir: 1, start: { reef: 0 } },
  { id: 'travUp', control: 'traveller', dir: 1, start: { traveller: 0.2, mainsheet: 0.7 } },
  { id: 'backJib', control: 'jibWind', dir: 1, start: { jibWind: 0, jibLee: 0.1 } },
  { id: 'easeKicker', control: 'kicker', dir: -1, start: { kicker: 0.9 } },
]

export const MOVE_THRESHOLD = 0.15

export function taskStart(task: Task): Controls {
  return { ...SAILING, ...task.start }
}

/** Judges the biggest line movement since the task started. Null while nothing has moved far enough. */
export function judgeMove(task: Task, base: Controls, now: Controls): { control: ControlId; dir: 1 | -1; ok: boolean } | null {
  let best: ControlId | null = null
  let bestDelta = 0
  for (const id of CONTROL_IDS) {
    const d = now[id] - base[id]
    if (Math.abs(d) > Math.abs(bestDelta)) {
      best = id
      bestDelta = d
    }
  }
  if (!best || Math.abs(bestDelta) < MOVE_THRESHOLD) return null
  const dir = bestDelta > 0 ? 1 : -1
  return { control: best, dir, ok: best === task.control && dir === task.dir }
}
