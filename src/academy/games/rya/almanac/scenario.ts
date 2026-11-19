/**
 * Types shared by all passage-planning scenarios. Every scenario is a self-contained training area:
 * coast, chart features, tides (optional), tidal streams or steady currents, waypoints and the boat.
 * All data is made up or simplified for training and must never be used for navigation.
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

export const hm = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(2))
export const ev = (time: string, h: number, kind: TideKind): TideEvent => ({ t: hm(time), h, kind })
/** Position factory for a chart in one whole-degree square: P(minLat, minLon). */
export const posIn =
  (latDeg: number, lonDeg: number) =>
  (latMin: number, lonMin: number): LatLon => ({
    lat: Math.sign(latDeg || 1) * (Math.abs(latDeg) * 60 + latMin),
    lon: Math.sign(lonDeg || 1) * (Math.abs(lonDeg) * 60 + lonMin),
  })

export interface StandardPort {
  name: string
  pos: LatLon
  levels: Levels
  springRange: number
  neapRange: number
  table: TideDay[]
  springsDay: number
  fullMoonDay: number
}

export interface SecondaryPort {
  name: string
  pos: LatLon
  hwTimes: number[]
  hwDiff: number[]
  lwTimes: number[]
  lwDiff: number[]
  /** Height differences at MHWS, MHWN, MLWN, MLWS. */
  hDiff: { mhws: number; mhwn: number; mlwn: number; mlws: number }
}

export interface DepthGate {
  /** Which port's tide governs the gate. */
  port: 'standard' | 'secondary'
  /** Drying height (+) or charted depth (−) of the shallowest spot, metres. */
  drying: number
  /** Arrival gate (bar at the destination) or departure gate (marina sill). */
  at: 'arrive' | 'depart'
}

export interface Tidal {
  standard: StandardPort
  secondary?: SecondaryPort
  gate?: DepthGate
  /** The plan uses the first standard-port HW after this time (minutes UT). */
  mainHwAfter: number
}

export interface DiamondRow {
  set: number
  sp: number
  np: number
}
export interface Diamond extends LatLon {
  id: string
  /** Rows for HW−6 … HW+6 at the standard port. */
  rows: DiamondRow[]
}

export interface Waypoint extends LatLon {
  id: string
}

/**
 * One leg of the passage. A normal leg goes to waypoint `to` with a course to steer.
 * A fixed-heading leg (crossing a traffic separation scheme) holds `heading` for `crossNm` miles
 * across the lane and accepts the set of the stream.
 */
export type LegSpec =
  | { to: number; diamond: string }
  | { to: number; current: { set: number; rate: number } }
  | { heading: number; crossNm: number; diamond: string }

export type Feature =
  | { kind: 'port'; pos: LatLon; label: string; dx?: number; dy?: number }
  | { kind: 'label'; pos: LatLon; text: string; size?: number; italic?: boolean; color?: string; anchor?: 'start' | 'middle' | 'end' }
  | { kind: 'light'; pos: LatLon; label: string; name?: string }
  | { kind: 'buoy'; pos: LatLon; label: string; type: 'swm' | 'cardN' | 'cardE' | 'cardS' | 'cardW' | 'port' | 'stbd' | 'special'; left?: boolean }
  | { kind: 'rock'; pos: LatLon; label: string; drying?: string }
  | { kind: 'race'; pos: LatLon; label: string }
  | { kind: 'bar'; pos: LatLon; drying: string }
  | { kind: 'leading'; from: LatLon; to: LatLon; label: string }
  | { kind: 'path'; pts: LatLon[] }
  | { kind: 'anchorage'; pos: LatLon }
  | { kind: 'windfarm'; poly: LatLon[]; label: string; turbines: LatLon[]; zone: LatLon[] }
  | { kind: 'tss'; lanes: { poly: LatLon[]; dir: number; at: LatLon }[]; sep: LatLon[]; label: string; labelAt: LatLon }
  | { kind: 'bridge'; from: LatLon; to: LatLon; label: string; labelAt?: LatLon }
  | { kind: 'tower'; pos: LatLon; label: string }
  | { kind: 'shoal'; poly: LatLon[]; label: string; at: LatLon }

export interface Scenario {
  id: string
  icon: string
  /** Latitude (degrees) used to turn minutes of longitude into miles on the chart. */
  latRef: number
  bounds: { latMin: number; latMax: number; lonMin: number; lonMax: number }
  land: LatLon[][]
  features: Feature[]
  soundings: (LatLon & { d: string })[]
  rose: LatLon
  /** Width of the shallow-water band along the coast, px (default 22). */
  shallow?: number
  /** Local time = UT + offset (minutes). */
  offset: number
  /** Magnetic variation, east positive (3°W = −3). */
  variation: number
  boat: { name: string; length: number; draft: number; clearance: number; speed: number }
  tidal?: Tidal
  diamonds: Diamond[]
  /** Points for the stream atlas: nearest diamond and a strength multiplier. */
  atlas: { p: LatLon; d: string; m: number }[]
  waypoints: Waypoint[]
  legs: LegSpec[]
  harbourOut: { nm: number; kn: number }
  approach: { nm: number; kn: number }
  final: { nm: number; kn: number }
  /** Direction of travel used to call a stream fair or foul (°T). */
  overallTrack: number
  /** Diamond whose stream decides "fair" on the timeline. */
  keyDiamond?: string
  /** Month of the scenario date (1–12). */
  month: number
  planDay: number
  /** Departure from WPT1, minutes UT. */
  planDepart: number
  departRange: [number, number]
  practice: { day: number; depart: number; scale?: number }[]
  /** Names used in generated texts. */
  names: { start: string; end: string; gate?: string }
}
