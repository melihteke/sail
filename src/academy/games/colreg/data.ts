/**
 * COLREG practice data. Own vessel always heads north (up) at the bottom of the picture.
 * Bearings are relative to own heading; headings are compass (own = 000).
 */
export type VesselKind = 'sail' | 'power' | 'motorsail' | 'tanker' | 'fishing' | 'nuc' | 'ram' | 'cbd'

export type RowAnswer = 'giveWay' | 'standOn' | 'bothStarboard'

export interface RowScenario {
  id: string
  own: VesselKind
  other: VesselKind
  /** Wind direction (from), only matters for sailing vessels. */
  windFromDeg: number
  /** Relative bearing (deg) and distance (0..1 of the picture radius) of the other vessel. */
  bearing: number
  distance: number
  otherHeading: number
  /** The other vessel can only navigate inside a narrow channel / traffic lane. */
  channel?: boolean
  answer: RowAnswer
  rule: string
}

export const rowScenarios: RowScenario[] = [
  { id: 'sail-port-vs-starboard', own: 'sail', other: 'sail', windFromDeg: 315, bearing: 40, distance: 0.62, otherHeading: 260, answer: 'giveWay', rule: '12(a)(i)' },
  { id: 'sail-starboard-vs-port', own: 'sail', other: 'sail', windFromDeg: 45, bearing: 320, distance: 0.62, otherHeading: 100, answer: 'standOn', rule: '12(a)(i)' },
  { id: 'sail-windward', own: 'sail', other: 'sail', windFromDeg: 300, bearing: 75, distance: 0.45, otherHeading: 350, answer: 'giveWay', rule: '12(a)(ii)' },
  { id: 'sail-leeward', own: 'sail', other: 'sail', windFromDeg: 300, bearing: 290, distance: 0.45, otherHeading: 10, answer: 'standOn', rule: '12(a)(ii)' },
  { id: 'sail-port-unknown', own: 'sail', other: 'sail', windFromDeg: 315, bearing: 315, distance: 0.6, otherHeading: 135, answer: 'giveWay', rule: '12(a)(iii)' },
  { id: 'sail-vs-power', own: 'sail', other: 'power', windFromDeg: 60, bearing: 300, distance: 0.62, otherHeading: 95, answer: 'standOn', rule: '18(a)(iv)' },
  { id: 'sail-overtaking-power', own: 'sail', other: 'power', windFromDeg: 90, bearing: 5, distance: 0.4, otherHeading: 0, answer: 'giveWay', rule: '13' },
  { id: 'sail-overtaking-sail', own: 'sail', other: 'sail', windFromDeg: 60, bearing: 355, distance: 0.38, otherHeading: 0, answer: 'giveWay', rule: '13' },
  { id: 'power-overtaken-by-sail', own: 'power', other: 'sail', windFromDeg: 90, bearing: 175, distance: 0.45, otherHeading: 0, answer: 'standOn', rule: '13' },
  { id: 'power-vs-sail', own: 'power', other: 'sail', windFromDeg: 300, bearing: 60, distance: 0.6, otherHeading: 250, answer: 'giveWay', rule: '18(a)(iv)' },
  { id: 'motorsail-vs-sail', own: 'motorsail', other: 'sail', windFromDeg: 60, bearing: 320, distance: 0.6, otherHeading: 100, answer: 'giveWay', rule: '3(c), 18(a)' },
  { id: 'power-starboard-crossing', own: 'power', other: 'power', windFromDeg: 0, bearing: 50, distance: 0.62, otherHeading: 270, answer: 'giveWay', rule: '15' },
  { id: 'power-port-crossing', own: 'power', other: 'power', windFromDeg: 0, bearing: 310, distance: 0.62, otherHeading: 90, answer: 'standOn', rule: '15, 17' },
  { id: 'power-head-on', own: 'power', other: 'power', windFromDeg: 0, bearing: 0, distance: 0.7, otherHeading: 180, answer: 'bothStarboard', rule: '14' },
  { id: 'sail-vs-tanker-channel', own: 'sail', other: 'tanker', windFromDeg: 90, bearing: 15, distance: 0.62, otherHeading: 270, channel: true, answer: 'giveWay', rule: '9(b), 10(j)' },
  { id: 'sail-vs-fishing', own: 'sail', other: 'fishing', windFromDeg: 60, bearing: 330, distance: 0.6, otherHeading: 80, answer: 'giveWay', rule: '18(b)(iii)' },
  { id: 'sail-vs-nuc', own: 'sail', other: 'nuc', windFromDeg: 60, bearing: 20, distance: 0.6, otherHeading: 300, answer: 'giveWay', rule: '18(b)(i)' },
  { id: 'sail-vs-ram', own: 'sail', other: 'ram', windFromDeg: 60, bearing: 350, distance: 0.62, otherHeading: 90, answer: 'giveWay', rule: '18(b)(ii)' },
  { id: 'power-vs-cbd', own: 'power', other: 'cbd', windFromDeg: 0, bearing: 30, distance: 0.65, otherHeading: 250, answer: 'giveWay', rule: '18(d)' },
  { id: 'power-vs-fishing', own: 'power', other: 'fishing', windFromDeg: 0, bearing: 320, distance: 0.6, otherHeading: 100, answer: 'giveWay', rule: '18(a)(iii)' },
  { id: 'fishing-vs-power', own: 'fishing', other: 'power', windFromDeg: 0, bearing: 50, distance: 0.6, otherHeading: 260, answer: 'standOn', rule: '18(a)(iii)' },
  { id: 'power-overtaking-tanker', own: 'power', other: 'tanker', windFromDeg: 0, bearing: 0, distance: 0.55, otherHeading: 0, answer: 'giveWay', rule: '13' },
]

/** Navigation lights as seen by the observer. x: -1..1 left/right, y: 0 (low) .. 1 (high). */
export type LightColour = 'white' | 'red' | 'green' | 'yellow'

export interface LightPicture {
  id: string
  lights: { x: number; y: number; c: LightColour }[]
}

export const lightPictures: LightPicture[] = [
  { id: 'power-headon', lights: [{ x: 0, y: 0.8, c: 'white' }, { x: 0.25, y: 0.25, c: 'red' }, { x: -0.25, y: 0.25, c: 'green' }] },
  { id: 'power50-port', lights: [{ x: -0.35, y: 0.6, c: 'white' }, { x: 0.35, y: 0.85, c: 'white' }, { x: 0.05, y: 0.25, c: 'red' }] },
  { id: 'power-starboard', lights: [{ x: 0.05, y: 0.8, c: 'white' }, { x: -0.1, y: 0.25, c: 'green' }] },
  { id: 'stern', lights: [{ x: 0, y: 0.3, c: 'white' }] },
  { id: 'sail-headon', lights: [{ x: 0.2, y: 0.25, c: 'red' }, { x: -0.2, y: 0.25, c: 'green' }] },
  { id: 'sail-port', lights: [{ x: 0, y: 0.25, c: 'red' }] },
  { id: 'sail-redgreen-masthead', lights: [{ x: 0, y: 0.95, c: 'red' }, { x: 0, y: 0.8, c: 'green' }, { x: 0, y: 0.25, c: 'green' }] },
  { id: 'anchor', lights: [{ x: 0, y: 0.7, c: 'white' }] },
  { id: 'nuc', lights: [{ x: 0, y: 0.9, c: 'red' }, { x: 0, y: 0.7, c: 'red' }] },
  { id: 'ram', lights: [{ x: 0, y: 0.95, c: 'red' }, { x: 0, y: 0.8, c: 'white' }, { x: 0, y: 0.65, c: 'red' }, { x: 0.3, y: 0.55, c: 'white' }, { x: 0, y: 0.25, c: 'green' }] },
  { id: 'cbd', lights: [{ x: 0, y: 0.98, c: 'red' }, { x: 0, y: 0.84, c: 'red' }, { x: 0, y: 0.7, c: 'red' }, { x: -0.3, y: 0.55, c: 'white' }, { x: 0, y: 0.25, c: 'red' }] },
  { id: 'trawler', lights: [{ x: 0, y: 0.9, c: 'green' }, { x: 0, y: 0.75, c: 'white' }, { x: 0.2, y: 0.25, c: 'red' }, { x: -0.2, y: 0.25, c: 'green' }] },
  { id: 'fishing', lights: [{ x: 0, y: 0.9, c: 'red' }, { x: 0, y: 0.75, c: 'white' }, { x: 0, y: 0.25, c: 'green' }] },
  { id: 'pilot', lights: [{ x: 0, y: 0.9, c: 'white' }, { x: 0, y: 0.75, c: 'red' }, { x: 0, y: 0.25, c: 'red' }] },
  { id: 'tug-astern', lights: [{ x: 0, y: 0.55, c: 'yellow' }, { x: 0, y: 0.38, c: 'white' }] },
  { id: 'aground', lights: [{ x: 0, y: 0.9, c: 'red' }, { x: 0, y: 0.75, c: 'red' }, { x: -0.3, y: 0.55, c: 'white' }, { x: 0.3, y: 0.45, c: 'white' }] },
]

export type Shape = 'ball' | 'diamond' | 'cylinder' | 'coneDown' | 'coneUp'

export interface DayShape {
  id: string
  shapes: Shape[]
}

export const dayShapes: DayShape[] = [
  { id: 'anchor', shapes: ['ball'] },
  { id: 'nuc', shapes: ['ball', 'ball'] },
  { id: 'ram', shapes: ['ball', 'diamond', 'ball'] },
  { id: 'cbd', shapes: ['cylinder'] },
  { id: 'motorsail', shapes: ['coneDown'] },
  { id: 'fishing', shapes: ['coneDown', 'coneUp'] },
  { id: 'tow', shapes: ['diamond'] },
  { id: 'aground', shapes: ['ball', 'ball', 'ball'] },
]

/** Sound signals: '.' = short blast (about 1 s), '-' = prolonged blast (4–6 s). */
export interface SoundSignal {
  id: string
  pattern: string
}

export const soundSignals: SoundSignal[] = [
  { id: 'starboard', pattern: '.' },
  { id: 'port', pattern: '..' },
  { id: 'astern', pattern: '...' },
  { id: 'doubt', pattern: '.....' },
  { id: 'bend', pattern: '-' },
  { id: 'fogStopped', pattern: '--' },
  { id: 'fogSail', pattern: '-..' },
  { id: 'overtakeStarboard', pattern: '--.' },
  { id: 'overtakePort', pattern: '--..' },
  { id: 'agree', pattern: '-.-.' },
]
