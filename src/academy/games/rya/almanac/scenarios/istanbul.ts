import { posIn, type LatLon, type Scenario } from '../scenario'

/**
 * Istanbul: Kalamış Marina → Kız Kulesi → up the Bosphorus to Bebek.
 * A real place drawn as a simplified sketch; currents are typical summer values for training only.
 * The tidal range here is only a few centimetres, so the planning is about the steady current.
 * Local time = UT + 3.
 */
const P0 = posIn(40, 28)
/** Position from 41°lat′ N and 029°lon′ E. */
const A = (lat41: number, lon29: number): LatLon => P0(60 + lat41, 60 + lon29)
/** Position from 40°lat′ N and 029°lon′ E. */
const S = (lat40: number, lon29: number): LatLon => P0(lat40, 60 + lon29)
/** Position from 41°lat′ N and 028°lon′ E. */
const W = (lat41: number, lon28: number): LatLon => P0(60 + lat41, lon28)

const KIZ_KULESI = A(1.28, 0.25)
const KALAMIS = S(58.72, 2.42)
const BEBEK = A(4.62, 2.72)

export const ISTANBUL: Scenario = {
  id: 'istanbul',
  icon: '🗼',
  latRef: 41.03,
  bounds: { latMin: 40 * 60 + 57, latMax: 41 * 60 + 6, lonMin: 28 * 60 + 57, lonMax: 29 * 60 + 6 },
  land: [
    // European side north of the Golden Horn: Karaköy, Beşiktaş, Ortaköy, Arnavutköy, Bebek.
    [
      W(1.7, 57.0), W(1.55, 58.2), W(1.35, 58.6), W(1.6, 59.0), W(2.0, 59.9), A(2.35, 0.15), A(2.5, 0.5), A(2.75, 1.1), A(2.9, 1.65), A(3.4, 2.3),
      A(3.9, 2.6), A(4.1, 2.95), A(4.35, 2.7), A(4.6, 2.58), A(4.9, 3.2), A(5.3, 3.5), A(6, 3.7), W(6, 57.0),
    ],
    // Historic peninsula: Eminönü, Sarayburnu.
    [W(1.3, 57.0), W(1.2, 58.3), W(0.95, 59.15), W(0.6, 59.0), W(0.2, 58.6), P0(59.9, 57.8), P0(59.75, 57.0)],
    // Asian side: Kandilli, Çengelköy, Beylerbeyi, Üsküdar, Salacak, Kadıköy, Moda, Kalamış, Fenerbahçe.
    [
      A(6, 4.3), A(5.0, 4.0), A(4.4, 3.7), A(3.8, 3.55), A(3.25, 3.2), A(2.85, 2.55), A(2.3, 1.85), A(1.65, 0.95), A(1.15, 0.5), A(0.65, 0.5),
      A(0.2, 0.75), S(59.9, 1.15), S(59.6, 1.4), S(58.9, 1.35), S(58.65, 1.5), S(58.78, 2.0), S(58.8, 2.45), S(58.45, 2.5), S(58.05, 2.15), S(57.8, 2.6),
      S(57, 3.6), S(57, 6), A(6, 6),
    ],
  ],
  features: [
    { kind: 'label', pos: A(4.2, 0.6), text: 'BOĞAZİÇİ', size: 13, italic: true, color: '#5b7fa3' },
    { kind: 'label', pos: P0(58.0, 58.8), text: 'MARMARA', size: 14, italic: true, color: '#5b7fa3' },
    { kind: 'label', pos: W(1.47, 57.4), text: 'Haliç', size: 8, italic: true, color: '#5b7fa3' },
    { kind: 'tower', pos: KIZ_KULESI, label: 'Kız Kulesi' },
    { kind: 'bridge', from: A(2.9, 1.65), to: A(2.85, 2.55), label: '15 Temmuz Şehitler Köprüsü · 64 m', labelAt: A(3.35, 0.9) },
    { kind: 'port', pos: KALAMIS, label: 'Kalamış Marina', dx: 6, dy: 4 },
    { kind: 'port', pos: BEBEK, label: 'Bebek', dx: -30, dy: -6 },
    { kind: 'anchorage', pos: A(4.5, 2.75) },
    { kind: 'race', pos: A(4.05, 3.15), label: 'Akıntıburnu' },
    { kind: 'label', pos: A(1.9, 0.95), text: 'Üsküdar', size: 8, color: '#4a3b12', anchor: 'start' },
    { kind: 'label', pos: S(59.7, 1.55), text: 'Kadıköy', size: 8, color: '#4a3b12', anchor: 'start' },
    { kind: 'label', pos: S(58.75, 1.25), text: 'Moda', size: 8, color: '#4a3b12', anchor: 'end' },
    { kind: 'label', pos: S(57.9, 2.15), text: 'Fenerbahçe', size: 8, color: '#4a3b12', anchor: 'end' },
    { kind: 'label', pos: A(2.6, 0.45), text: 'Beşiktaş', size: 8, color: '#4a3b12', anchor: 'end' },
    { kind: 'label', pos: A(3.1, 1.6), text: 'Ortaköy', size: 8, color: '#4a3b12', anchor: 'end' },
    { kind: 'label', pos: A(2.9, 2.8), text: 'Beylerbeyi', size: 8, color: '#4a3b12', anchor: 'start' },
    { kind: 'label', pos: A(3.3, 3.45), text: 'Çengelköy', size: 8, color: '#4a3b12', anchor: 'start' },
    { kind: 'label', pos: A(4.4, 3.95), text: 'Kandilli', size: 8, color: '#4a3b12', anchor: 'start' },
    { kind: 'label', pos: W(0.85, 59.3), text: 'Sarayburnu', size: 8, color: '#4a3b12', anchor: 'end' },
    { kind: 'label', pos: S(59.3, 0.95), text: 'Haydarpaşa', size: 7, color: '#4a3b12', anchor: 'end' },
    { kind: 'path', pts: [KALAMIS, S(58.3, 1.65)] },
    { kind: 'path', pts: [A(4.55, 2.85), BEBEK] },
  ],
  soundings: [
    { ...S(58.0, 1.0), d: '18' },
    { ...S(59.5, 0.3), d: '32' },
    { ...W(0.4, 59.7), d: '41' },
    { ...A(1.9, 0.3), d: '38' },
    { ...A(2.6, 1.1), d: '55' },
    { ...A(3.4, 2.75), d: '62' },
    { ...A(4.6, 3.3), d: '58' },
    { ...A(5.5, 3.9), d: '70' },
    { ...P0(58.5, 59.5), d: '45' },
    { ...A(1.0, 0.4), d: '6' },
    { ...A(4.5, 2.66), d: '7' },
  ],
  rose: P0(58.0, 57.9),
  shallow: 8,
  offset: 180,
  variation: 6,
  boat: { name: 'Mavi Rüzgâr', length: 11.0, draft: 1.9, clearance: 1.0, speed: 6 },
  diamonds: [],
  atlas: [],
  waypoints: [
    { id: 'WPT1', ...S(58.3, 1.65) },
    { id: 'WPT2', ...S(59.0, 0.9) },
    { id: 'WPT3', ...A(1.05, 0.05) },
    { id: 'WPT4', ...A(2.45, 1.55) },
    { id: 'WPT5', ...A(3.45, 2.85) },
    { id: 'WPT6', ...A(4.15, 3.4) },
    { id: 'WPT7', ...A(4.55, 2.85) },
  ],
  legs: [
    { to: 1, current: { set: 200, rate: 0.3 } },
    { to: 2, current: { set: 225, rate: 0.8 } },
    { to: 3, current: { set: 205, rate: 1.5 } },
    { to: 4, current: { set: 215, rate: 1.8 } },
    { to: 5, current: { set: 200, rate: 1.2 } },
    { to: 6, current: { set: 210, rate: 3.5 } },
  ],
  harbourOut: { nm: 0.6, kn: 4 },
  approach: { nm: 0.15, kn: 3 },
  final: { nm: 0, kn: 3 },
  overallTrack: 20,
  month: 7,
  planDay: 0,
  planDepart: 7 * 60,
  departRange: [300, 900],
  practice: [
    { day: 0, depart: 6 * 60, scale: 1.4 },
    { day: 0, depart: 8 * 60, scale: 0.6 },
    { day: 0, depart: 10 * 60, scale: 1.2 },
  ],
  names: { start: 'Kalamış Marina', end: 'Bebek' },
}
