import { ev, posIn, type LatLon, type Scenario, type TideDay } from '../scenario'

/**
 * Zeebries Bank: fictional Dutch-style North Sea coast with an offshore wind farm between two harbours.
 * Times UT, local summer time = UT + 2.
 */
const P = posIn(53, 3)

const TABLE: TideDay[] = [
  { day: 18, weekday: 4, events: [ev('0050', 0.6, 'LW'), ev('0730', 1.9, 'HW'), ev('1312', 0.6, 'LW'), ev('1955', 1.9, 'HW')] },
  { day: 19, weekday: 5, events: [ev('0144', 0.5, 'LW'), ev('0822', 2.0, 'HW'), ev('1405', 0.5, 'LW'), ev('2046', 2.0, 'HW')] },
  { day: 20, weekday: 6, events: [ev('0236', 0.4, 'LW'), ev('0912', 2.1, 'HW'), ev('1456', 0.4, 'LW'), ev('2135', 2.1, 'HW')] },
  { day: 21, weekday: 0, events: [ev('0325', 0.3, 'LW'), ev('1000', 2.2, 'HW'), ev('1545', 0.3, 'LW'), ev('2222', 2.2, 'HW')] },
  { day: 22, weekday: 1, events: [ev('0412', 0.3, 'LW'), ev('1046', 2.3, 'HW'), ev('1632', 0.2, 'LW'), ev('2308', 2.3, 'HW')] },
  { day: 23, weekday: 2, events: [ev('0458', 0.2, 'LW'), ev('1131', 2.4, 'HW'), ev('1718', 0.2, 'LW'), ev('2353', 2.4, 'HW')] },
  { day: 24, weekday: 3, events: [ev('0543', 0.2, 'LW'), ev('1215', 2.4, 'HW'), ev('1803', 0.2, 'LW')] },
]

const ZEELUST = P(33.2, 75.0)
const DUINHAVEN = P(46.8, 76.2)

function grid(lat0: number, lat1: number, lon0: number, lon1: number, dLat: number, dLon: number): LatLon[] {
  const out: LatLon[] = []
  for (let a = lat0; a <= lat1 + 1e-9; a += dLat) for (let o = lon0; o <= lon1 + 1e-9; o += dLon) out.push(P(a, o))
  return out
}
const box = (a0: number, a1: number, o0: number, o1: number) => [P(a0, o0), P(a1, o0), P(a1, o1), P(a0, o1)]

const B_ROWS = [
  { set: 195, sp: 0.6, np: 0.3 },
  { set: 15, sp: 0.4, np: 0.2 },
  { set: 18, sp: 1.0, np: 0.6 },
  { set: 20, sp: 1.5, np: 0.8 },
  { set: 20, sp: 1.6, np: 0.8 },
  { set: 22, sp: 1.3, np: 0.6 },
  { set: 20, sp: 0.8, np: 0.4 },
  { set: 200, sp: 0.3, np: 0.1 },
  { set: 198, sp: 0.9, np: 0.5 },
  { set: 200, sp: 1.4, np: 0.7 },
  { set: 200, sp: 1.6, np: 0.8 },
  { set: 202, sp: 1.2, np: 0.6 },
  { set: 198, sp: 0.8, np: 0.4 },
]

export const ZEEBRIES: Scenario = {
  id: 'windfarm',
  icon: '🌬️',
  latRef: 53.67,
  bounds: { latMin: 53 * 60 + 30, latMax: 53 * 60 + 50, lonMin: 3 * 60 + 48, lonMax: 3 * 60 + 78 },
  land: [
    [
      P(50, 78), P(50, 77.0), P(48.0, 76.6), P(47.2, 76.4), P(47.0, 75.9), P(46.95, 76.5), P(46.7, 76.5), P(46.65, 75.9), P(46.4, 76.2), P(44.0, 75.8),
      P(41.0, 75.5), P(38.0, 75.3), P(35.0, 75.2), P(33.6, 75.1), P(33.5, 74.4), P(33.4, 75.2), P(33.0, 75.2), P(32.9, 74.4), P(32.7, 75.0), P(30, 74.8), P(30, 78),
    ],
  ],
  features: [
    { kind: 'label', pos: P(31.2, 55.0), text: 'NORTH SEA', size: 15, italic: true, color: '#5b7fa3' },
    {
      kind: 'windfarm',
      poly: box(36.0, 43.5, 64.0, 72.5),
      zone: box(35.73, 43.77, 63.55, 72.95),
      turbines: grid(36.3, 43.2, 64.5, 72.0, 0.9, 1.5),
      label: 'Windpark Zeebries',
    },
    { kind: 'shoal', poly: [P(37.4, 74.9), P(39.0, 74.4), P(41.6, 74.5), P(42.6, 75.0), P(42.0, 75.3), P(38.0, 75.25)], label: 'Ribbelbank 0̲4', at: P(40.0, 74.7) },
    { kind: 'port', pos: ZEELUST, label: 'Zeelust', dx: 6, dy: -10 },
    { kind: 'port', pos: DUINHAVEN, label: 'Duinhaven', dx: -64, dy: -12 },
    { kind: 'light', pos: P(33.5, 74.45), name: '', label: 'Iso.R.4s' },
    { kind: 'light', pos: P(47.0, 75.95), name: '', label: 'Oc.G.5s' },
    { kind: 'buoy', pos: P(35.45, 72.6), type: 'cardS', label: 'ZB-S Q(6)+LFl.15s', left: true },
    { kind: 'buoy', pos: P(39.7, 73.15), type: 'cardE', label: 'ZB-E Q(3)10s', left: true },
    { kind: 'buoy', pos: P(44.05, 72.6), type: 'cardN', label: 'ZB-N Q', left: true },
    { kind: 'buoy', pos: P(41.0, 74.3), type: 'stbd', label: 'RB-1 Fl.G.4s' },
    { kind: 'path', pts: [ZEELUST, P(33.2, 72.8)] },
    { kind: 'path', pts: [P(46.8, 74.8), DUINHAVEN] },
  ],
  soundings: [
    { ...P(31.5, 72.0), d: '9' },
    { ...P(34.5, 74.4), d: '6' },
    { ...P(37.0, 73.8), d: '8' },
    { ...P(40.5, 73.6), d: '7' },
    { ...P(43.0, 73.9), d: '8' },
    { ...P(45.5, 74.6), d: '6' },
    { ...P(48.5, 75.2), d: '5' },
    { ...P(33.0, 62.0), d: '16' },
    { ...P(39.0, 58.0), d: '21' },
    { ...P(45.5, 60.0), d: '19' },
    { ...P(48.0, 52.0), d: '24' },
    { ...P(34.5, 52.0), d: '23' },
    { ...P(47.0, 69.0), d: '14' },
  ],
  rose: P(46.4, 52.4),
  offset: 120,
  variation: 1,
  boat: { name: 'Zeezwaluw', length: 9.2, draft: 1.6, clearance: 0.5, speed: 5 },
  tidal: {
    standard: {
      name: 'Zeelust',
      pos: ZEELUST,
      levels: { hat: 2.6, mhws: 2.3, mhwn: 1.9, msl: 1.2, mlwn: 0.6, mlws: 0.3 },
      springRange: 2.0,
      neapRange: 1.3,
      table: TABLE,
      springsDay: 23,
      fullMoonDay: 21,
    },
    secondary: {
      name: 'Duinhaven',
      pos: DUINHAVEN,
      hwTimes: [0, 360, 720, 1080],
      hwDiff: [50, 30, 50, 30],
      lwTimes: [60, 420, 780, 1140],
      lwDiff: [40, 20, 40, 20],
      hDiff: { mhws: 0.1, mhwn: 0.1, mlwn: 0.0, mlws: 0.0 },
    },
    // The entrance channel has silted to a charted depth of 0.8 m.
    gate: { port: 'secondary', drying: -0.8, at: 'arrive' },
    mainHwAfter: 360,
  },
  diamonds: [
    { id: 'A', ...P(34.2, 73.6), rows: B_ROWS.map((r) => ({ set: (r.set + 350) % 360, sp: Math.round(r.sp * 8) / 10, np: Math.round(r.np * 8) / 10 })) },
    { id: 'B', ...P(37.4, 73.7), rows: B_ROWS },
  ],
  atlas: [
    { p: P(31.5, 70.0), d: 'A', m: 0.8 },
    { p: P(32.0, 63.0), d: 'A', m: 0.9 },
    { p: P(34.0, 57.0), d: 'A', m: 0.9 },
    { p: P(38.0, 55.0), d: 'B', m: 1.0 },
    { p: P(42.0, 57.0), d: 'B', m: 1.0 },
    { p: P(46.0, 61.0), d: 'B', m: 1.0 },
    { p: P(48.5, 69.0), d: 'B', m: 0.9 },
    { p: P(37.0, 73.7), d: 'B', m: 1.0 },
    { p: P(42.0, 73.7), d: 'B', m: 1.0 },
    { p: P(45.5, 73.5), d: 'B', m: 0.9 },
    { p: P(39.5, 61.0), d: 'B', m: 0.6 },
    { p: P(48.8, 56.0), d: 'B', m: 1.0 },
  ],
  waypoints: [
    { id: 'WPT1', ...P(33.2, 72.8) },
    { id: 'WPT2', ...P(35.4, 73.7) },
    { id: 'WPT3', ...P(44.1, 73.7) },
    { id: 'WPT4', ...P(46.8, 74.8) },
  ],
  legs: [
    { to: 1, diamond: 'A' },
    { to: 2, diamond: 'B' },
    { to: 3, diamond: 'B' },
  ],
  harbourOut: { nm: 1.6, kn: 5 },
  approach: { nm: 0.7, kn: 4.5 },
  final: { nm: 0.3, kn: 3 },
  overallTrack: 5,
  keyDiamond: 'B',
  month: 6,
  planDay: 20,
  planDepart: 6 * 60,
  departRange: [240, 720],
  practice: [
    { day: 19, depart: 5 * 60 + 15 },
    { day: 21, depart: 6 * 60 + 30 },
    { day: 22, depart: 7 * 60 + 30 },
  ],
  names: { start: 'Zeelust', end: 'Duinhaven', gate: 'Duinhaven' },
}
