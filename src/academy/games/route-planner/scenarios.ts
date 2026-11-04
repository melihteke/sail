import type { Environment } from '../../core/environment'
import type { LatLon } from '../../core/geo'
import type { BuoyKind } from '../../map/buoyIcon'

export type Difficulty = 'easy' | 'medium' | 'hard'
export type ScenarioGroup = 'lakes' | 'courses' | 'open'

export interface ScenarioMark {
  at: LatLon
  /** Leave the mark on this side. */
  side: 'port' | 'starboard'
  kind: 'buoy' | 'dock'
}

export interface Scenario {
  id: string
  group: ScenarioGroup
  difficulty: Difficulty
  start: LatLon
  finish: LatLon
  env: Environment
  /** Marks to round in order. */
  marks?: ScenarioMark[]
  /** Islands / land the route must not cross (simplified outlines). */
  land?: LatLon[][]
  /** Symbolic buoys shown on the map (no rule is checked). */
  decorations?: { id: BuoyKind; at: LatLon }[]
  /** Free planning: no best score, no "next scenario". */
  free?: boolean
}

const ll = (lat: number, lon: number): LatLon => ({ lat, lon })

/** Simplified OpenStreetMap outlines (© OpenStreetMap contributors, ODbL). */
export const BUYUKADA: LatLon[] = [
  ll(40.8609, 29.1072), ll(40.8597, 29.113), ll(40.8534, 29.1103), ll(40.8464, 29.1147), ll(40.8418, 29.1099),
  ll(40.8382, 29.1146), ll(40.8376, 29.124), ll(40.844, 29.1243), ll(40.8463, 29.1266), ll(40.8573, 29.1262),
  ll(40.8606, 29.1312), ll(40.8709, 29.1391), ll(40.875, 29.1343), ll(40.8718, 29.118), ll(40.8705, 29.1149),
  ll(40.8621, 29.1143),
]
export const HEYBELIADA: LatLon[] = [
  ll(40.8692, 29.0747), ll(40.8675, 29.0833), ll(40.8704, 29.0825), ll(40.8716, 29.0853), ll(40.8704, 29.0884),
  ll(40.8681, 29.0872), ll(40.8691, 29.0954), ll(40.8734, 29.104), ll(40.8735, 29.1015), ll(40.8753, 29.1026),
  ll(40.874, 29.1041), ll(40.8801, 29.0993), ll(40.8838, 29.0987), ll(40.8848, 29.0931), ll(40.8832, 29.0888),
  ll(40.8802, 29.09), ll(40.874, 29.076),
]

export const scenarios: Scenario[] = [
  {
    id: 'poel-reach',
    group: 'lakes',
    difficulty: 'easy',
    start: ll(52.2958, 4.8366),
    finish: ll(52.3016, 4.8412),
    env: { windFromDeg: 300, windSpeedKn: 8, currentSetDeg: 0, currentSpeedKn: 0 },
  },
  {
    id: 'westeinder-beat',
    group: 'lakes',
    difficulty: 'medium',
    start: ll(52.236, 4.73),
    finish: ll(52.248, 4.73),
    env: { windFromDeg: 0, windSpeedKn: 12, currentSetDeg: 0, currentSpeedKn: 0 },
  },
  {
    id: 'markermeer-run',
    group: 'lakes',
    difficulty: 'medium',
    start: ll(52.585, 5.2),
    finish: ll(52.562, 5.2),
    env: { windFromDeg: 0, windSpeedKn: 5, currentSetDeg: 0, currentSpeedKn: 0 },
  },
  {
    id: 'ijsselmeer-current',
    group: 'lakes',
    difficulty: 'hard',
    start: ll(52.78, 5.3),
    finish: ll(52.818, 5.318),
    env: { windFromDeg: 10, windSpeedKn: 14, currentSetDeg: 100, currentSpeedKn: 1.5 },
  },
  {
    id: 'poel-dock',
    group: 'courses',
    difficulty: 'medium',
    start: ll(52.2958, 4.8366),
    finish: ll(52.2968, 4.8352),
    env: { windFromDeg: 30, windSpeedKn: 9, currentSetDeg: 0, currentSpeedKn: 0 },
    marks: [{ at: ll(52.2996, 4.8392), side: 'starboard', kind: 'dock' }],
  },
  {
    id: 'westeinder-race',
    group: 'courses',
    difficulty: 'hard',
    start: ll(52.236, 4.7285),
    finish: ll(52.236, 4.7315),
    env: { windFromDeg: 350, windSpeedKn: 12, currentSetDeg: 0, currentSpeedKn: 0 },
    marks: [{ at: ll(52.2495, 4.729), side: 'port', kind: 'buoy' }],
  },
  {
    id: 'ijsselmeer-triangle',
    group: 'courses',
    difficulty: 'hard',
    start: ll(52.8, 5.25),
    finish: ll(52.8, 5.256),
    env: { windFromDeg: 0, windSpeedKn: 12, currentSetDeg: 0, currentSpeedKn: 0 },
    marks: [
      { at: ll(52.83, 5.25), side: 'port', kind: 'buoy' },
      { at: ll(52.815, 5.285), side: 'port', kind: 'buoy' },
    ],
  },
  {
    id: 'ijsselmeer-stavoren',
    group: 'open',
    difficulty: 'medium',
    start: ll(52.708, 5.31),
    finish: ll(52.878, 5.345),
    env: { windFromDeg: 10, windSpeedKn: 14, currentSetDeg: 0, currentSpeedKn: 0 },
  },
  {
    id: 'bodrum-kos',
    group: 'open',
    difficulty: 'medium',
    start: ll(37.022, 27.43),
    finish: ll(36.9, 27.297),
    env: { windFromDeg: 330, windSpeedKn: 18, currentSetDeg: 200, currentSpeedKn: 0.5 },
  },
  {
    id: 'heybeliada-strait',
    group: 'open',
    difficulty: 'medium',
    start: ll(40.905, 29.1),
    finish: ll(40.83, 29.1),
    env: { windFromDeg: 40, windSpeedKn: 12, currentSetDeg: 220, currentSpeedKn: 0.4 },
    marks: [{ at: ll(40.867, 29.1065), side: 'port', kind: 'buoy' }],
    land: [BUYUKADA, HEYBELIADA],
  },
  {
    id: 'princes-islands',
    group: 'open',
    difficulty: 'hard',
    start: ll(40.88, 29.15),
    finish: ll(40.835, 29.095),
    env: { windFromDeg: 40, windSpeedKn: 14, currentSetDeg: 220, currentSpeedKn: 0.4 },
    marks: [{ at: ll(40.832, 29.125), side: 'starboard', kind: 'buoy' }],
    land: [BUYUKADA, HEYBELIADA],
  },
  {
    id: 'peniche-berlenga',
    group: 'open',
    difficulty: 'medium',
    start: ll(39.33, -9.4),
    finish: ll(39.405, -9.495),
    env: { windFromDeg: 0, windSpeedKn: 18, currentSetDeg: 180, currentSpeedKn: 0.5 },
    marks: [{ at: ll(39.355, -9.44), side: 'starboard', kind: 'buoy' }],
  },
  {
    id: 'tarifa-tanger',
    group: 'open',
    difficulty: 'hard',
    start: ll(35.995, -5.61),
    finish: ll(35.8, -5.8),
    env: { windFromDeg: 90, windSpeedKn: 22, currentSetDeg: 90, currentSpeedKn: 1.5 },
    marks: [{ at: ll(35.93, -5.66), side: 'starboard', kind: 'buoy' }],
  },
  {
    id: 'granville-chausey',
    group: 'open',
    difficulty: 'hard',
    start: ll(48.83, -1.61),
    finish: ll(48.862, -1.815),
    env: { windFromDeg: 270, windSpeedKn: 12, currentSetDeg: 45, currentSpeedKn: 2.5 },
    marks: [{ at: ll(48.83, -1.72), side: 'starboard', kind: 'buoy' }],
  },
  {
    id: 'barcelona-soller',
    group: 'open',
    difficulty: 'medium',
    start: ll(41.37, 2.22),
    finish: ll(39.815, 2.69),
    env: { windFromDeg: 40, windSpeedKn: 15, currentSetDeg: 200, currentSpeedKn: 0.3 },
    marks: [
      { at: ll(40.6, 2.25), side: 'port', kind: 'buoy' },
      { at: ll(39.95, 2.85), side: 'starboard', kind: 'buoy' },
    ],
  },
  {
    id: 'antibes-calvi',
    group: 'open',
    difficulty: 'medium',
    start: ll(43.57, 7.15),
    finish: ll(42.575, 8.745),
    env: { windFromDeg: 310, windSpeedKn: 20, currentSetDeg: 60, currentSpeedKn: 0.4 },
    marks: [
      { at: ll(43.15, 7.75), side: 'port', kind: 'buoy' },
      { at: ll(42.75, 8.5), side: 'starboard', kind: 'buoy' },
    ],
  },
]

export const groups: ScenarioGroup[] = ['lakes', 'courses', 'open']

export function findScenario(id: string | undefined): Scenario | undefined {
  return scenarios.find((s) => s.id === id)
}

export function sameEnvironment(a: Environment, b: Environment): boolean {
  return (
    a.windFromDeg === b.windFromDeg &&
    a.windSpeedKn === b.windSpeedKn &&
    a.currentSetDeg === b.currentSetDeg &&
    a.currentSpeedKn === b.currentSpeedKn
  )
}
