export type Topmark =
  | 'can'
  | 'cone'
  | 'cones-up'
  | 'cones-down'
  | 'cones-base'
  | 'cones-point'
  | 'balls'
  | 'ball'
  | 'x'
  | 'plus'
  | 'none'

export type MarkId =
  | 'port'
  | 'starboard'
  | 'north'
  | 'east'
  | 'south'
  | 'west'
  | 'isolated'
  | 'safe'
  | 'special'
  | 'pref-starboard'
  | 'pref-port'
  | 'wreck'
  | 'port-spar'
  | 'starboard-spar'
  | 'swim'

/** How the mark constrains a passing boat. */
export type MarkRule =
  | { kind: 'lateral'; keepOn: 'port' | 'starboard' }
  | { kind: 'cardinal'; safeSide: 'N' | 'E' | 'S' | 'W' }
  | { kind: 'danger'; radius: number }
  | { kind: 'none' }

export interface MarkDef {
  id: MarkId
  shape: 'can' | 'cone' | 'pillar' | 'spar' | 'sphere'
  /** Horizontal colour bands, top to bottom. */
  bands: string[]
  verticalStripes?: [string, string]
  topmark: Topmark
  topmarkColor: string
  /** Light characteristic id from core/lights, if the mark is usually lit. */
  lightId?: string
  /** Where the mark is especially common. */
  region?: 'nl' | 'med'
  rule: MarkRule
}

export const BLACK = '#111827'
export const YELLOW = '#facc15'
export const RED = '#d6312b'
export const GREEN = '#1f9a4d'
export const WHITE = '#ffffff'
export const BLUE = '#1d4ed8'

export const marks: MarkDef[] = [
  { id: 'port', shape: 'can', bands: [RED], topmark: 'can', topmarkColor: RED, lightId: 'fl-r-4', rule: { kind: 'lateral', keepOn: 'port' } },
  { id: 'starboard', shape: 'cone', bands: [GREEN], topmark: 'cone', topmarkColor: GREEN, lightId: 'fl-g-4', rule: { kind: 'lateral', keepOn: 'starboard' } },
  { id: 'north', shape: 'pillar', bands: [BLACK, YELLOW], topmark: 'cones-up', topmarkColor: BLACK, lightId: 'q-w', rule: { kind: 'cardinal', safeSide: 'N' } },
  { id: 'east', shape: 'pillar', bands: [BLACK, YELLOW, BLACK], topmark: 'cones-base', topmarkColor: BLACK, lightId: 'q3-w-10', rule: { kind: 'cardinal', safeSide: 'E' } },
  { id: 'south', shape: 'pillar', bands: [YELLOW, BLACK], topmark: 'cones-down', topmarkColor: BLACK, lightId: 'q6lfl-w-15', rule: { kind: 'cardinal', safeSide: 'S' } },
  { id: 'west', shape: 'pillar', bands: [YELLOW, BLACK, YELLOW], topmark: 'cones-point', topmarkColor: BLACK, lightId: 'q9-w-15', rule: { kind: 'cardinal', safeSide: 'W' } },
  { id: 'isolated', shape: 'pillar', bands: [BLACK, RED, BLACK], topmark: 'balls', topmarkColor: BLACK, lightId: 'fl2-w-5', region: 'med', rule: { kind: 'danger', radius: 40 } },
  { id: 'safe', shape: 'pillar', bands: [], verticalStripes: [RED, WHITE], topmark: 'ball', topmarkColor: RED, lightId: 'lfl-w-10', rule: { kind: 'none' } },
  { id: 'special', shape: 'pillar', bands: [YELLOW], topmark: 'x', topmarkColor: YELLOW, lightId: 'fl-y-5', rule: { kind: 'none' } },
  {
    id: 'pref-starboard',
    shape: 'can',
    bands: [RED, GREEN, RED],
    topmark: 'can',
    topmarkColor: RED,
    lightId: 'fl21-r-10',
    region: 'nl',
    rule: { kind: 'lateral', keepOn: 'port' },
  },
  {
    id: 'pref-port',
    shape: 'cone',
    bands: [GREEN, RED, GREEN],
    topmark: 'cone',
    topmarkColor: GREEN,
    lightId: 'fl21-g-10',
    region: 'nl',
    rule: { kind: 'lateral', keepOn: 'starboard' },
  },
  { id: 'wreck', shape: 'pillar', bands: [], verticalStripes: [BLUE, YELLOW], topmark: 'plus', topmarkColor: YELLOW, lightId: 'al-buy-3', rule: { kind: 'danger', radius: 55 } },
  { id: 'port-spar', shape: 'spar', bands: [RED], topmark: 'can', topmarkColor: RED, region: 'nl', rule: { kind: 'lateral', keepOn: 'port' } },
  { id: 'starboard-spar', shape: 'spar', bands: [GREEN], topmark: 'cone', topmarkColor: GREEN, region: 'nl', rule: { kind: 'lateral', keepOn: 'starboard' } },
  { id: 'swim', shape: 'sphere', bands: [YELLOW], topmark: 'none', topmarkColor: YELLOW, region: 'med', rule: { kind: 'none' } },
]

export function markById(id: MarkId): MarkDef {
  return marks.find((m) => m.id === id)!
}
