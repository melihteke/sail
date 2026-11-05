/** Practice voyages for the noon-fix walkthrough. Positions in decimal degrees, east positive. */
export interface CelestialScenario {
  id: 'biscay' | 'northSea' | 'azores' | 'aegean' | 'channel'
  /** UTC date of the sight */
  date: [number, number, number]
  /** Where the boat really is (hidden until the end) */
  lat: number
  lon: number
  /** Dead-reckoning estimate the skipper starts from */
  drLat: number
  drLon: number
  /** Height of eye above the sea, metres */
  eye: number
  /** Index error in arc minutes; positive = on the arc */
  ieMin: number
}

export const scenarios: CelestialScenario[] = [
  { id: 'biscay', date: [2026, 6, 12], lat: 45 + 37.4 / 60, lon: -(6 + 48.2 / 60), drLat: 45 + 50 / 60, drLon: -(6 + 30 / 60), eye: 2.5, ieMin: 1.8 },
  { id: 'northSea', date: [2026, 8, 20], lat: 54 + 11.6 / 60, lon: 3 + 22.5 / 60, drLat: 54, drLon: 3, eye: 2.2, ieMin: -1.2 },
  { id: 'azores', date: [2026, 7, 5], lat: 38 + 20.3 / 60, lon: -(27 + 52.8 / 60), drLat: 38 + 5 / 60, drLon: -(28 + 20 / 60), eye: 3, ieMin: 2.4 },
  { id: 'aegean', date: [2026, 9, 10], lat: 37 + 5.2 / 60, lon: 25 + 10.7 / 60, drLat: 37 + 15 / 60, drLon: 25 + 25 / 60, eye: 2, ieMin: -0.8 },
  { id: 'channel', date: [2026, 5, 18], lat: 49 + 54.6 / 60, lon: -(2 + 41.3 / 60), drLat: 50 + 5 / 60, drLon: -(2 + 20 / 60), eye: 2.4, ieMin: 1.5 },
]

export const scenarioDay = (s: CelestialScenario) => new Date(Date.UTC(s.date[0], s.date[1] - 1, s.date[2]))
