import { ev, posIn, type DiamondRow, type Scenario, type TideDay } from '../scenario'

/**
 * Ravensey Strait: fictional island-to-mainland crossing through a traffic separation scheme.
 * The departure marina has a sill, so the tide decides when we can leave. Times UT, local = UT + 1.
 */
const P = posIn(49, -16)

const TABLE: TideDay[] = [
  { day: 22, weekday: 3, events: [ev('0310', 2.0, 'LW'), ev('0918', 5.0, 'HW'), ev('1538', 2.1, 'LW'), ev('2142', 4.9, 'HW')] },
  { day: 23, weekday: 4, events: [ev('0405', 1.7, 'LW'), ev('1012', 5.3, 'HW'), ev('1630', 1.8, 'LW'), ev('2236', 5.2, 'HW')] },
  { day: 24, weekday: 5, events: [ev('0456', 1.4, 'LW'), ev('1102', 5.6, 'HW'), ev('1718', 1.5, 'LW'), ev('2325', 5.5, 'HW')] },
  { day: 25, weekday: 6, events: [ev('0544', 1.2, 'LW'), ev('1150', 5.8, 'HW'), ev('1805', 1.2, 'LW')] },
  { day: 26, weekday: 0, events: [ev('0012', 5.8, 'HW'), ev('0630', 1.0, 'LW'), ev('1236', 6.0, 'HW'), ev('1850', 1.0, 'LW')] },
  { day: 27, weekday: 1, events: [ev('0057', 6.0, 'HW'), ev('0714', 0.9, 'LW'), ev('1320', 6.1, 'HW'), ev('1933', 0.9, 'LW')] },
  { day: 28, weekday: 2, events: [ev('0140', 6.1, 'HW'), ev('0757', 0.8, 'LW'), ev('1403', 6.2, 'HW'), ev('2015', 0.8, 'LW')] },
]

const MERROW = P(65.0, 17.6)
const BRANNOCK = P(47.6, 22.1)

/** East-going stream before HW Port Merrow, west-going after; slack about HW−5 and HW+1. */
const B_ROWS: DiamondRow[] = [
  { set: 270, sp: 1.0, np: 0.5 },
  { set: 275, sp: 0.4, np: 0.2 },
  { set: 88, sp: 1.2, np: 0.6 },
  { set: 90, sp: 2.2, np: 1.1 },
  { set: 90, sp: 2.6, np: 1.3 },
  { set: 92, sp: 2.2, np: 1.1 },
  { set: 90, sp: 1.2, np: 0.6 },
  { set: 268, sp: 0.4, np: 0.2 },
  { set: 270, sp: 1.4, np: 0.7 },
  { set: 270, sp: 2.4, np: 1.2 },
  { set: 270, sp: 2.6, np: 1.3 },
  { set: 272, sp: 2.0, np: 1.0 },
  { set: 270, sp: 1.2, np: 0.6 },
]
const scaled = (k: number, turn: number): DiamondRow[] => B_ROWS.map((r) => ({ set: (r.set + turn + 360) % 360, sp: Math.round(r.sp * k * 10) / 10, np: Math.round(r.np * k * 10) / 10 }))

export const RAVENSEY: Scenario = {
  id: 'tss',
  icon: '🚢',
  latRef: 49.93,
  bounds: { latMin: 49 * 60 + 44, latMax: 49 * 60 + 68, lonMin: -(16 * 60 + 34), lonMax: -(16 * 60 + 2) },
  land: [
    [P(44, 30.5), P(46.2, 29.5), P(47.4, 27.0), P(47.9, 24.0), P(47.9, 23.0), P(47.35, 22.4), P(47.35, 21.8), P(47.8, 21.2), P(47.6, 20.0), P(46.8, 17.5), P(45.6, 15.0), P(44, 13.5)],
    [
      P(68, 34), P(66.0, 34), P(64.8, 28.0), P(65.3, 22.0), P(64.6, 18.4), P(65.25, 18.0), P(65.25, 17.2), P(64.5, 16.8), P(64.3, 15.0), P(65.0, 10.0), P(66.5, 2), P(68, 2),
    ],
  ],
  features: [
    {
      kind: 'tss',
      lanes: [
        { poly: [P(53, 34), P(56, 34), P(56, 2), P(53, 2)], dir: 270, at: P(54.5, 27) },
        { poly: [P(57, 34), P(60, 34), P(60, 2), P(57, 2)], dir: 90, at: P(58.5, 27) },
      ],
      sep: [P(56, 34), P(57, 34), P(57, 2), P(56, 2)],
      label: 'TSS Ravensey Strait',
      labelAt: P(56.5, 30.5),
    },
    { kind: 'label', pos: P(45.4, 23.5), text: 'BRANNOCK', size: 12, color: '#4a3b12' },
    { kind: 'port', pos: BRANNOCK, label: 'St Brannock', dx: 6, dy: -6 },
    { kind: 'port', pos: MERROW, label: 'Port Merrow', dx: 6, dy: 14 },
    { kind: 'light', pos: P(46.4, 29.4), name: 'Brannock Head', label: 'Fl.10s50m20M' },
    { kind: 'light', pos: P(64.6, 18.3), name: '', label: 'Fl.R.3s' },
    { kind: 'buoy', pos: P(63.4, 17.8), type: 'swm', label: 'Merrow Fairway LFl.10s', left: true },
    { kind: 'buoy', pos: P(49.1, 21.5), type: 'swm', label: 'Brannock Fairway Iso.4s', left: true },
    { kind: 'path', pts: [BRANNOCK, P(49.0, 21.0)] },
    { kind: 'path', pts: [P(63.6, 17.5), MERROW] },
  ],
  soundings: [
    { ...P(49.5, 25.0), d: '28' },
    { ...P(51.5, 14.0), d: '41' },
    { ...P(54.5, 21.0), d: '62' },
    { ...P(56.5, 10.0), d: '71' },
    { ...P(58.5, 22.0), d: '58' },
    { ...P(61.5, 28.0), d: '39' },
    { ...P(62.5, 12.0), d: '33' },
    { ...P(63.8, 20.5), d: '18' },
    { ...P(50.5, 30.0), d: '35' },
    { ...P(47.0, 8.0), d: '47' },
  ],
  rose: P(46.6, 7.0),
  offset: 60,
  variation: -2,
  boat: { name: 'Kittiwake', length: 10.5, draft: 1.7, clearance: 0.4, speed: 5 },
  tidal: {
    standard: {
      name: 'Port Merrow',
      pos: MERROW,
      levels: { hat: 6.9, mhws: 6.2, mhwn: 4.8, msl: 3.6, mlwn: 2.2, mlws: 0.8 },
      springRange: 5.4,
      neapRange: 2.6,
      table: TABLE,
      springsDay: 28,
      fullMoonDay: 26,
    },
    secondary: {
      name: 'St Brannock',
      pos: BRANNOCK,
      hwTimes: [0, 360, 720, 1080],
      hwDiff: [-20, -10, -20, -10],
      lwTimes: [60, 420, 780, 1140],
      lwDiff: [-15, -25, -15, -25],
      hDiff: { mhws: -0.3, mhwn: -0.2, mlwn: -0.1, mlws: 0.0 },
    },
    // The marina sill dries 2.2 m: we can only leave around HW.
    gate: { port: 'secondary', drying: 2.2, at: 'depart' },
    mainHwAfter: 360,
  },
  diamonds: [
    { id: 'A', ...P(50.6, 20.6), rows: scaled(0.6, -8) },
    { id: 'B', ...P(56.5, 19.6), rows: B_ROWS },
    { id: 'C', ...P(62.0, 18.2), rows: scaled(0.7, 10) },
  ],
  atlas: [
    { p: P(50.0, 28.0), d: 'A', m: 1.0 },
    { p: P(50.5, 12.0), d: 'A', m: 1.0 },
    { p: P(52.0, 22.0), d: 'A', m: 1.1 },
    { p: P(54.5, 30.0), d: 'B', m: 0.9 },
    { p: P(54.5, 12.0), d: 'B', m: 1.0 },
    { p: P(56.5, 26.0), d: 'B', m: 1.0 },
    { p: P(56.5, 6.0), d: 'B', m: 1.0 },
    { p: P(58.5, 14.0), d: 'B', m: 1.0 },
    { p: P(58.5, 31.0), d: 'B', m: 0.9 },
    { p: P(61.0, 24.0), d: 'C', m: 1.0 },
    { p: P(62.5, 8.0), d: 'C', m: 1.0 },
    { p: P(60.5, 12.0), d: 'C', m: 1.1 },
  ],
  waypoints: [
    { id: 'WPT1', ...P(49.0, 21.0) },
    { id: 'WPT2', ...P(52.7, 20.0) },
    { id: 'WPT3', ...P(63.6, 17.5) },
  ],
  legs: [
    { to: 1, diamond: 'A' },
    { heading: 0, crossNm: 7.6, diamond: 'B' },
    { to: 2, diamond: 'C' },
  ],
  harbourOut: { nm: 1.3, kn: 5 },
  approach: { nm: 1.4, kn: 5 },
  final: { nm: 0.3, kn: 3 },
  overallTrack: 355,
  month: 7,
  planDay: 25,
  planDepart: 10 * 60 + 30,
  departRange: [480, 840],
  practice: [
    { day: 24, depart: 10 * 60 + 30 },
    { day: 26, depart: 12 * 60 },
    { day: 27, depart: 12 * 60 + 45 },
  ],
  names: { start: 'St Brannock', end: 'Port Merrow', gate: 'St Brannock sill' },
}
