/**
 * Saltmere Sound: a fictional training area invented for this app.
 * All harbours, tides, streams and positions are made up for practice and must never be used for navigation.
 * Times in the tables are UT; local summer time is UT + 1.
 */

export type TideKind = 'HW' | 'LW'
export interface TideEvent {
  /** Minutes after 00:00 UT on the day of the table row. */
  t: number
  h: number
  kind: TideKind
}
export interface TideDay {
  day: number
  /** 0 = Sunday. */
  weekday: number
  events: TideEvent[]
}

export const SUMMER_OFFSET_MIN = 60
export const PLAN_DAY = 13

export const hm = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(2))
const ev = (time: string, h: number, kind: TideKind): TideEvent => ({ t: hm(time), h, kind })

/** Port Halyard (standard port), 10–16 June, times UT. */
export const HALYARD_TABLE: TideDay[] = [
  { day: 10, weekday: 3, events: [ev('0141', 1.4, 'LW'), ev('0749', 4.3, 'HW'), ev('1405', 1.5, 'LW'), ev('2011', 4.2, 'HW')] },
  { day: 11, weekday: 4, events: [ev('0232', 1.2, 'LW'), ev('0839', 4.5, 'HW'), ev('1456', 1.3, 'LW'), ev('2102', 4.4, 'HW')] },
  { day: 12, weekday: 5, events: [ev('0322', 1.0, 'LW'), ev('0929', 4.6, 'HW'), ev('1546', 1.1, 'LW'), ev('2152', 4.5, 'HW')] },
  { day: 13, weekday: 6, events: [ev('0412', 0.8, 'LW'), ev('1018', 4.8, 'HW'), ev('1636', 0.9, 'LW'), ev('2242', 4.7, 'HW')] },
  { day: 14, weekday: 0, events: [ev('0501', 0.7, 'LW'), ev('1107', 4.9, 'HW'), ev('1725', 0.7, 'LW'), ev('2331', 4.9, 'HW')] },
  { day: 15, weekday: 1, events: [ev('0550', 0.6, 'LW'), ev('1156', 5.0, 'HW'), ev('1814', 0.6, 'LW')] },
  { day: 16, weekday: 2, events: [ev('0020', 5.0, 'HW'), ev('0639', 0.5, 'LW'), ev('1245', 5.1, 'HW'), ev('1903', 0.5, 'LW')] },
]
export const FULL_MOON_DAY = 14
export const SPRINGS_DAY = 16

/** Heights above chart datum (m). */
export interface Levels {
  hat: number
  mhws: number
  mhwn: number
  msl: number
  mlwn: number
  mlws: number
}

export interface LatLon {
  /** Minutes of latitude (N positive) and longitude (E positive). */
  lat: number
  lon: number
}

const P = (latMin: number, lonMin: number): LatLon => ({ lat: 47 * 60 + latMin, lon: -(12 * 60 + lonMin) })

export const HALYARD = {
  name: 'Port Halyard',
  pos: P(17.4, 23.5),
  levels: { hat: 5.6, mhws: 5.1, mhwn: 4.0, msl: 2.8, mlwn: 1.8, mlws: 0.5 } as Levels,
  springRange: 4.6,
  neapRange: 2.2,
}

/**
 * Gannet Cove: secondary port on Port Halyard.
 * Time differences apply at the listed Port Halyard times; interpolate in between.
 */
export const GANNET = {
  name: 'Gannet Cove',
  pos: P(6.9, 7.4),
  hwTimes: [hm('0000'), hm('0600'), hm('1200'), hm('1800')],
  hwDiff: [40, 20, 40, 20],
  lwTimes: [hm('0500'), hm('1100'), hm('1700'), hm('2300')],
  lwDiff: [10, 30, 10, 30],
  /** Height differences at MHWS, MHWN, MLWN, MLWS. */
  hDiff: { mhws: -0.4, mhwn: -0.3, mlwn: -0.1, mlws: 0.0 },
  /** The entrance bar dries 0.6 m (drying height above chart datum). */
  barDrying: 0.6,
  leadingLine: 16,
}

export const BOAT = {
  name: 'Aurora',
  length: 9.8,
  draft: 1.8,
  clearance: 0.5,
  speed: 5,
}

/** Magnetic variation: 3° W. Westerly variation is added to a true bearing to get magnetic. */
export const VARIATION_W = 3

export interface Waypoint extends LatLon {
  id: string
}

export const WAYPOINTS: Waypoint[] = [
  { id: 'WPT1', ...P(15.0, 22.0) },
  { id: 'WPT2', ...P(9.0, 18.0) },
  { id: 'WPT3', ...P(5.0, 8.0) },
]

/** Harbour legs outside the tidal plan: marina → WPT1, WPT3 → bar, bar → anchorage. */
export const HARBOUR_OUT = { nm: 2.5, kn: 5 }
export const APPROACH_TO_BAR = { nm: 1.2, kn: 4.5 }
export const BAR_TO_ANCHOR = { nm: 0.6, kn: 3.6 }

export interface DiamondRow {
  set: number
  sp: number
  np: number
}
export interface Diamond extends LatLon {
  id: 'A' | 'B'
  /** Rows for HW−6 … HW+6 Port Halyard. */
  rows: DiamondRow[]
}

export const DIAMONDS: Diamond[] = [
  {
    id: 'A',
    ...P(12.0, 20.6),
    rows: [
      { set: 175, sp: 0.4, np: 0.2 },
      { set: 178, sp: 1.0, np: 0.6 },
      { set: 180, sp: 1.4, np: 0.6 },
      { set: 180, sp: 1.8, np: 1.0 },
      { set: 182, sp: 1.6, np: 0.8 },
      { set: 185, sp: 0.9, np: 0.5 },
      { set: 190, sp: 0.3, np: 0.1 },
      { set: 355, sp: 0.6, np: 0.2 },
      { set: 358, sp: 1.2, np: 0.4 },
      { set: 0, sp: 1.7, np: 0.9 },
      { set: 0, sp: 1.6, np: 0.8 },
      { set: 5, sp: 1.0, np: 0.6 },
      { set: 5, sp: 0.4, np: 0.2 },
    ],
  },
  {
    id: 'B',
    ...P(7.0, 13.2),
    rows: [
      { set: 85, sp: 0.5, np: 0.1 },
      { set: 88, sp: 1.2, np: 0.4 },
      { set: 90, sp: 2.0, np: 0.8 },
      { set: 90, sp: 2.4, np: 1.2 },
      { set: 92, sp: 2.0, np: 0.8 },
      { set: 95, sp: 1.2, np: 0.4 },
      { set: 100, sp: 0.4, np: 0.2 },
      { set: 265, sp: 0.8, np: 0.4 },
      { set: 268, sp: 1.6, np: 0.8 },
      { set: 270, sp: 2.3, np: 1.1 },
      { set: 270, sp: 2.1, np: 0.9 },
      { set: 272, sp: 1.3, np: 0.5 },
      { set: 275, sp: 0.5, np: 0.1 },
    ],
  },
]

/** Diamond used for each leg (WPT1→WPT2 uses A, WPT2→WPT3 uses B). */
export const LEG_DIAMOND: Diamond['id'][] = ['A', 'B']

/* ---------- Chart drawing data ---------- */

export const CHART_BOUNDS = { latMin: 47 * 60 + 1, latMax: 47 * 60 + 19, lonMin: -(12 * 60 + 28), lonMax: -(12 * 60 + 2) }

/** Mainland, drawn clockwise from the north-west: Port Halyard inlet, Kestrel Head, Gannet Cove. */
export const COAST: LatLon[] = [
  P(19, 28),
  P(17.6, 28),
  P(17.2, 26.4),
  P(16.6, 25.4),
  P(16.9, 24.5),
  P(17.9, 24.3),
  P(18.2, 23.4),
  P(17.7, 22.8),
  P(16.8, 22.6),
  P(16.6, 21.6),
  P(15.2, 19.0),
  P(13.8, 17.6),
  P(12.4, 16.6),
  P(10.8, 16.0),
  P(9.9, 15.4),
  P(9.7, 14.2),
  P(9.0, 13.4),
  P(8.9, 12.0),
  P(8.2, 10.6),
  P(7.6, 9.6),
  P(6.4, 9.0),
  P(6.2, 8.2),
  P(7.0, 8.0),
  P(7.5, 7.4),
  P(7.0, 6.9),
  P(6.2, 6.8),
  P(5.8, 6.0),
  P(5.2, 4.6),
  P(4.4, 3.4),
  P(3.6, 2.0),
  P(19, 2),
]

export const KESTREL_HEAD = P(9.7, 14.2)
/** Tidal race off Kestrel Head (dangerous at springs with wind against tide). */
export const RACE = P(9.0, 14.3)
export const ANVIL_ROCK = { ...P(7.3, 11.4), drying: 1.2 }
export const FAIRWAY_BUOY = P(15.9, 23.0)
export const BAR = P(6.2, 7.6)
export const ANCHORAGE = P(6.9, 7.4)

export const SOUNDINGS: (LatLon & { d: string })[] = [
  { ...P(16.0, 27.0), d: '5' },
  { ...P(15.5, 24.4), d: '8' },
  { ...P(17.2, 23.6), d: '3' },
  { ...P(14.0, 21.0), d: '17' },
  { ...P(12.6, 23.8), d: '24' },
  { ...P(10.8, 19.8), d: '27' },
  { ...P(8.2, 22.6), d: '35' },
  { ...P(11.4, 18.0), d: '14' },
  { ...P(8.4, 15.8), d: '16' },
  { ...P(9.0, 14.0), d: '5' },
  { ...P(5.6, 16.4), d: '31' },
  { ...P(6.2, 12.4), d: '19' },
  { ...P(4.2, 11.0), d: '26' },
  { ...P(5.4, 8.6), d: '6' },
  { ...P(6.7, 7.6), d: '2' },
  { ...P(3.2, 6.0), d: '22' },
  { ...P(2.2, 18.0), d: '42' },
]
