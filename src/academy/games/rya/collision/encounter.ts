import { norm180, norm360, toDeg, toRad } from '../../../core/units'

/** Encounter geometry in nautical miles (x = east, y = north), speeds in knots, time in minutes. */
export interface Pos {
  x: number
  y: number
}

export type VesselType = 'powerSmall' | 'powerLarge' | 'sail' | 'trawler' | 'fishing' | 'nuc' | 'ram' | 'cbd' | 'anchored'

export interface Vessel {
  id: string
  type: VesselType
  pos: Pos
  course: number
  speed: number
}

export const velocity = (course: number, speed: number): Pos => ({ x: (Math.sin(toRad(course)) * speed) / 60, y: (Math.cos(toRad(course)) * speed) / 60 })

export function advance(v: Vessel, minutes: number): Vessel {
  const d = velocity(v.course, v.speed)
  return { ...v, pos: { x: v.pos.x + d.x * minutes, y: v.pos.y + d.y * minutes } }
}

export function bearingTo(from: Pos, to: Pos): number {
  return norm360(toDeg(Math.atan2(to.x - from.x, to.y - from.y)))
}

export function rangeTo(from: Pos, to: Pos): number {
  return Math.hypot(to.x - from.x, to.y - from.y)
}

/** Closest point of approach (NM) and time to it (minutes) with both vessels holding course and speed. */
export function cpa(own: Vessel, other: Vessel): { cpa: number; tcpa: number } {
  const rp = { x: other.pos.x - own.pos.x, y: other.pos.y - own.pos.y }
  const vo = velocity(own.course, own.speed)
  const vt = velocity(other.course, other.speed)
  const rv = { x: vt.x - vo.x, y: vt.y - vo.y }
  const v2 = rv.x * rv.x + rv.y * rv.y
  const tcpa = v2 < 1e-12 ? 0 : Math.max(0, -(rp.x * rv.x + rp.y * rv.y) / v2)
  return { cpa: Math.hypot(rp.x + rv.x * tcpa, rp.y + rv.y * tcpa), tcpa }
}

/**
 * Start position for a target so that, if both hold course and speed, it passes `miss` NM from own vessel
 * after `minutes` (miss > 0: passes ahead/right of own track as seen along the target's course; 0 = collision).
 */
export function targetStart(own: Vessel, course: number, speed: number, minutes: number, miss = 0): Pos {
  const o = advance(own, minutes).pos
  const vt = velocity(course, speed)
  const side = { x: Math.cos(toRad(course)), y: -Math.sin(toRad(course)) }
  return { x: o.x - vt.x * minutes + side.x * miss, y: o.y - vt.y * minutes + side.y * miss }
}

/* ---------------- Lights ---------------- */

export type LightColour = 'white' | 'red' | 'green'

export interface Light {
  colour: LightColour
  /** Height above the waterline (arbitrary units) and fore/aft and side offsets for drawing. */
  h: number
  a: number
  b: number
  arc: 'masthead' | 'port' | 'starboard' | 'stern' | 'all'
}

const sidelights: Light[] = [
  { colour: 'red', h: 1, a: 0.2, b: -0.3, arc: 'port' },
  { colour: 'green', h: 1, a: 0.2, b: 0.3, arc: 'starboard' },
]
const stern: Light = { colour: 'white', h: 1, a: -1, b: 0, arc: 'stern' }
const allRound = (colours: LightColour[], base = 3): Light[] => colours.map((colour, i) => ({ colour, h: base + (colours.length - 1 - i) * 0.8, a: 0, b: 0, arc: 'all' as const }))

export function lightsOf(type: VesselType, underway = true): Light[] {
  const power: Light[] = [{ colour: 'white', h: 2.4, a: 0.5, b: 0, arc: 'masthead' }, ...sidelights, stern]
  const way = underway ? sidelights.concat(stern) : []
  switch (type) {
    case 'powerSmall':
      return power
    case 'powerLarge':
      return [{ colour: 'white', h: 2, a: 0.7, b: 0, arc: 'masthead' }, { colour: 'white', h: 3.2, a: -0.4, b: 0, arc: 'masthead' }, ...sidelights, stern]
    case 'sail':
      return [...sidelights, stern]
    case 'trawler':
      return [...allRound(['green', 'white']), ...way]
    case 'fishing':
      return [...allRound(['red', 'white']), ...way]
    case 'nuc':
      return [...allRound(['red', 'red']), ...way]
    case 'ram':
      return [...allRound(['red', 'white', 'red']), ...(underway ? power : [])]
    case 'cbd':
      return [...allRound(['red', 'red', 'red'], 3.6), ...power]
    case 'anchored':
      return allRound(['white'], 2)
  }
}

/** Lights an observer can see, given the bearing of the observer from the vessel's bow (signed, + = starboard). */
export function visibleLights(type: VesselType, aspect: number, underway = true): Light[] {
  const rel = norm180(aspect)
  return lightsOf(type, underway).filter((l) => {
    switch (l.arc) {
      case 'all':
        return true
      case 'masthead':
        return Math.abs(rel) <= 112.5
      case 'starboard':
        return rel >= 0 && rel <= 112.5
      case 'port':
        return rel <= 0 && rel >= -112.5
      case 'stern':
        return Math.abs(rel) >= 112.5
    }
  })
}

/** Signed relative bearing of `to` as seen from `from`'s bow. */
export function aspectOf(from: Vessel, to: Pos): number {
  return norm180(bearingTo(from.pos, to) - from.course)
}

/** Horizontal screen offset of a light as seen by an observer at the given aspect. */
export function lightScreenOffset(l: Light, aspect: number): number {
  const r = toRad(aspect)
  return -l.b * Math.cos(r) + l.a * Math.sin(r)
}

/* ---------------- Scenarios and scoring ---------------- */

export type Role = 'giveWay' | 'standOn' | 'headOn' | 'fog'
export type Visibility = 'day' | 'night' | 'fog'

export interface Scenario {
  id: string
  own: Vessel
  ownSail: boolean
  windFrom?: number
  targets: Vessel[]
  role: Role
  visibility: Visibility
  /** Unsafe if the range ever drops below this (NM). */
  minCpa: number
  /** The target alters to starboard when the range drops below this (head-on). */
  targetAltersAt?: number
}

export interface History {
  /** Range when own vessel first deviated from the initial course by > 5° or slowed by > 30%. */
  firstActionRange: number | null
  firstActionSide: 1 | -1 | 0
  maxDeviation: number
  slowed: boolean
  bearingsBeforeAction: number
  minRange: number
  fogSignalOk?: boolean
  /** Turned to port while the target was forward of the beam (fog). */
  portForForward: boolean
}

export function newHistory(): History {
  return { firstActionRange: null, firstActionSide: 0, maxDeviation: 0, slowed: false, bearingsBeforeAction: 0, minRange: Infinity, portForForward: false }
}

export interface Score {
  points: number
  max: number
  safe: boolean
  notes: string[]
}

export const EARLY_RANGE = 2
export const STAND_ON_RANGE = 1

export function scoreEncounter(s: Scenario, h: History): Score {
  const notes: string[] = []
  const safe = h.minRange >= s.minCpa
  let points = safe ? 2 : 0
  notes.push(safe ? 'safe' : 'unsafe')
  if (s.role === 'standOn') {
    const held = h.firstActionRange === null || h.firstActionRange < STAND_ON_RANGE
    if (held) points += 2
    notes.push(held ? 'held' : 'altered')
    const bearings = h.bearingsBeforeAction >= 2
    if (bearings) points += 1
    notes.push(bearings ? 'bearings' : 'noBearings')
    if (h.firstActionRange === null || h.firstActionSide >= 0) points += 1
    else notes.push('portTurn')
    return { points, max: 6, safe, notes }
  }
  const early = h.firstActionRange !== null && h.firstActionRange >= EARLY_RANGE
  if (early) points += 1
  notes.push(early ? 'early' : 'late')
  const substantial = h.maxDeviation >= 30 || h.slowed
  if (substantial) points += 1
  notes.push(substantial ? 'substantial' : 'small')
  if (s.role === 'fog') {
    if (!h.portForForward) points += 1
    notes.push(h.portForForward ? 'portInFog' : 'starboardInFog')
    if (h.fogSignalOk) points += 1
    notes.push(h.fogSignalOk ? 'signalOk' : 'signalWrong')
    return { points, max: 6, safe, notes }
  }
  const starboard = h.firstActionSide > 0 || (h.firstActionSide === 0 && h.slowed && s.role !== 'headOn')
  if (starboard) points += 1
  notes.push(starboard ? 'starboard' : 'port')
  const bearings = h.bearingsBeforeAction >= 2
  if (bearings) points += 1
  notes.push(bearings ? 'bearings' : 'noBearings')
  return { points, max: 6, safe, notes }
}

export function encounterStars(sc: Score): 0 | 1 | 2 | 3 {
  if (!sc.safe) return 0
  if (sc.points >= sc.max) return 3
  if (sc.points >= sc.max - 1) return 2
  return 1
}

const own = (course: number, speed: number, type: VesselType = 'powerSmall'): Vessel => ({ id: 'own', type, pos: { x: 0, y: 0 }, course, speed })

function target(o: Vessel, id: string, type: VesselType, course: number, speed: number, minutes: number, miss = 0): Vessel {
  return { id, type, course, speed, pos: targetStart(o, course, speed, minutes, miss) }
}

export function buildScenarios(): Scenario[] {
  const pCross = own(0, 6)
  const pHead = own(0, 6)
  const sOver = own(0, 5, 'sail')
  const sSail = own(0, 5, 'sail')
  const pNight = own(0, 6)
  const pFog = own(0, 5)
  return [
    { id: 'crossing', own: pCross, ownSail: false, targets: [target(pCross, 't1', 'powerLarge', 270, 12, 22)], role: 'giveWay', visibility: 'day', minCpa: 0.5 },
    { id: 'head-on', own: pHead, ownSail: false, targets: [target(pHead, 't1', 'powerSmall', 182, 10, 20, -0.05)], role: 'headOn', visibility: 'day', minCpa: 0.4, targetAltersAt: 1.4 },
    { id: 'overtaken', own: sOver, ownSail: true, windFrom: 270, targets: [target(sOver, 't1', 'powerSmall', 356, 12, 26, 0.35)], role: 'standOn', visibility: 'day', minCpa: 0.2 },
    { id: 'sailing', own: sSail, ownSail: true, windFrom: 270, targets: [target(sSail, 't1', 'sail', 200, 5, 30)], role: 'giveWay', visibility: 'day', minCpa: 0.3 },
    { id: 'night', own: pNight, ownSail: false, targets: [target(pNight, 't1', 'powerLarge', 250, 14, 22)], role: 'giveWay', visibility: 'night', minCpa: 0.5 },
    { id: 'fog', own: pFog, ownSail: false, targets: [target(pFog, 't1', 'powerSmall', 150, 8, 24)], role: 'fog', visibility: 'fog', minCpa: 0.5 },
  ]
}

/** Fog signal of a vessel, as horn notation ('-' prolonged, '.' short). */
export function fogSignal(type: VesselType, ownSail: boolean, makingWay = true): string {
  if (ownSail || type === 'sail' || type === 'fishing' || type === 'trawler' || type === 'nuc' || type === 'ram' || type === 'cbd') return '-..'
  return makingWay ? '-' : '--'
}

/** Rule 19: in restricted visibility, avoid turning to port for a vessel forward of the beam. */
export function isForwardOfBeam(own: Vessel, other: Pos): boolean {
  return Math.abs(aspectOf(own, other)) < 90
}

export function turnTowards(current: number, target: number, maxStep: number): number {
  const d = norm180(target - current)
  return norm360(current + Math.max(-maxStep, Math.min(maxStep, d)))
}
