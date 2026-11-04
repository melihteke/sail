import type { ChartLevel, Pt } from './passage'

const p = (x: number, y: number): Pt => ({ x, y })

const harbourEntry: ChartLevel = {
  id: 'harbour-entry',
  region: 'generic',
  width: 1000,
  height: 700,
  buoyageDeg: 0,
  land: [
    [p(0, 0), p(462, 0), p(462, 108), p(380, 120), p(0, 150)],
    [p(538, 0), p(1000, 0), p(1000, 160), p(620, 120), p(538, 108)],
  ],
  shoals: [
    [p(0, 250), p(360, 230), p(405, 320), p(400, 520), p(300, 600), p(0, 620)],
    [p(1000, 260), p(640, 240), p(595, 330), p(600, 500), p(700, 590), p(1000, 600)],
  ],
  zones: [],
  marks: [
    { id: 'port', at: p(440, 470) },
    { id: 'starboard', at: p(560, 470) },
    { id: 'port', at: p(440, 300) },
    { id: 'starboard', at: p(560, 300) },
    { id: 'port', at: p(478, 124) },
    { id: 'starboard', at: p(522, 124) },
  ],
  start: p(180, 670),
  finish: p(500, 40),
}

const cardinalShoal: ChartLevel = {
  id: 'cardinal-shoal',
  region: 'generic',
  width: 1000,
  height: 700,
  buoyageDeg: 90,
  land: [],
  shoals: [[p(400, 250), p(560, 230), p(640, 300), p(620, 420), p(520, 470), p(400, 440), p(360, 340)]],
  zones: [],
  marks: [
    { id: 'north', at: p(500, 190) },
    { id: 'south', at: p(500, 520) },
    { id: 'west', at: p(310, 350) },
    { id: 'east', at: p(690, 360) },
  ],
  start: p(60, 560),
  finish: p(940, 160),
}

const nlSplit: ChartLevel = {
  id: 'nl-split',
  region: 'nl',
  width: 1000,
  height: 700,
  buoyageDeg: 30,
  land: [],
  shoals: [
    [p(0, 700), p(415, 700), p(415, 420), p(330, 330), p(280, 320), p(0, 380)],
    [p(500, 330), p(420, 250), p(400, 120), p(470, 0), p(560, 0), p(600, 200), p(560, 260)],
    [p(585, 700), p(1000, 700), p(1000, 200), p(840, 250), p(720, 330), p(600, 430)],
  ],
  zones: [],
  marks: [
    { id: 'port-spar', at: p(455, 580) },
    { id: 'starboard-spar', at: p(545, 580) },
    { id: 'port-spar', at: p(455, 450) },
    { id: 'starboard-spar', at: p(545, 450) },
    { id: 'pref-starboard', at: p(500, 360) },
    { id: 'port-spar', at: p(609, 229) },
    { id: 'starboard-spar', at: p(671, 307) },
    { id: 'port-spar', at: p(731, 131) },
    { id: 'starboard-spar', at: p(793, 209) },
    { id: 'port-spar', at: p(311, 293) },
    { id: 'starboard-spar', at: p(373, 215) },
  ],
  start: p(500, 670),
  finish: p(880, 90),
}

const medBay: ChartLevel = {
  id: 'med-bay',
  region: 'med',
  width: 1000,
  height: 700,
  buoyageDeg: 110,
  land: [
    [p(0, 700), p(0, 575), p(150, 540), p(300, 560), p(450, 610), p(640, 640), p(790, 595), p(905, 640), p(1000, 640), p(1000, 700)],
    [p(840, 0), p(1000, 0), p(1000, 470), p(885, 470), p(840, 420)],
  ],
  shoals: [[p(230, 80), p(390, 70), p(420, 180), p(300, 215), p(220, 170)]],
  zones: [[p(30, 565), p(40, 495), p(170, 460), p(320, 485), p(430, 585), p(300, 560), p(150, 540)]],
  marks: [
    { id: 'south', at: p(320, 255) },
    { id: 'isolated', at: p(520, 330) },
    { id: 'wreck', at: p(680, 250) },
    { id: 'safe', at: p(720, 420) },
    { id: 'port', at: p(855, 472) },
    { id: 'starboard', at: p(815, 585) },
    { id: 'swim', at: p(40, 495) },
    { id: 'swim', at: p(105, 477) },
    { id: 'swim', at: p(170, 460) },
    { id: 'swim', at: p(245, 472) },
    { id: 'swim', at: p(320, 485) },
    { id: 'swim', at: p(375, 535) },
  ],
  start: p(110, 75),
  finish: p(950, 560),
}

/** Leaving harbour for the sea: against the direction of buoyage, so red marks go to starboard. */
const riverMouth: ChartLevel = {
  id: 'river-mouth',
  region: 'generic',
  width: 1000,
  height: 700,
  buoyageDeg: 0,
  land: [
    [p(0, 0), p(465, 0), p(465, 110), p(300, 140), p(0, 180)],
    [p(535, 0), p(1000, 0), p(1000, 130), p(700, 120), p(535, 110)],
  ],
  shoals: [
    [p(0, 240), p(415, 220), p(420, 360), p(540, 470), p(640, 600), p(640, 700), p(0, 700)],
    [p(1000, 150), p(590, 170), p(585, 320), p(700, 380), p(800, 450), p(1000, 440)],
  ],
  zones: [],
  marks: [
    { id: 'port', at: p(478, 124) },
    { id: 'starboard', at: p(522, 124) },
    { id: 'port', at: p(450, 250) },
    { id: 'starboard', at: p(550, 250) },
    { id: 'port', at: p(571, 459) },
    { id: 'starboard', at: p(637, 385) },
    { id: 'port', at: p(675, 551) },
    { id: 'starboard', at: p(741, 477) },
    { id: 'safe', at: p(860, 600) },
  ],
  start: p(500, 40),
  finish: p(820, 650),
}

/** A buoyed channel blocked by a fresh wreck and a rock. */
const wreckChannel: ChartLevel = {
  id: 'wreck-channel',
  region: 'generic',
  width: 1000,
  height: 700,
  buoyageDeg: 90,
  land: [[p(900, 0), p(1000, 0), p(1000, 290), p(930, 300), p(900, 200)]],
  shoals: [
    [p(150, 0), p(850, 0), p(850, 260), p(150, 270)],
    [p(150, 430), p(850, 440), p(850, 700), p(150, 700)],
  ],
  zones: [],
  marks: [
    { id: 'safe', at: p(110, 325) },
    { id: 'port', at: p(300, 285) },
    { id: 'starboard', at: p(300, 415) },
    { id: 'wreck', at: p(450, 330) },
    { id: 'port', at: p(600, 285) },
    { id: 'starboard', at: p(600, 415) },
    { id: 'isolated', at: p(760, 395) },
  ],
  start: p(40, 350),
  finish: p(960, 350),
}

/** Slalom between three shoals, each guarded by a cardinal mark. */
const cardinalMaze: ChartLevel = {
  id: 'cardinal-maze',
  region: 'generic',
  width: 1000,
  height: 700,
  buoyageDeg: 90,
  land: [],
  shoals: [
    [p(200, 0), p(380, 0), p(390, 250), p(330, 330), p(210, 320)],
    [p(560, 380), p(700, 370), p(760, 420), p(750, 700), p(560, 700)],
  ],
  zones: [],
  marks: [
    { id: 'south', at: p(290, 380) },
    { id: 'north', at: p(660, 320) },
    { id: 'east', at: p(810, 520) },
    { id: 'west', at: p(150, 160) },
  ],
  start: p(95, 105),
  finish: p(900, 640),
}

/** A Dutch lake: spar-buoyed channel west of an island, preferred channel to port at the split. */
const nlLake: ChartLevel = {
  id: 'nl-lake',
  region: 'nl',
  width: 1000,
  height: 700,
  buoyageDeg: 0,
  land: [[p(430, 200), p(560, 180), p(600, 300), p(540, 400), p(450, 380)]],
  shoals: [
    [p(0, 0), p(250, 0), p(260, 300), p(240, 700), p(0, 700)],
    [p(600, 200), p(760, 220), p(780, 420), p(560, 430), p(600, 300)],
    [p(430, 200), p(560, 180), p(540, 140), p(450, 150)],
    [p(850, 0), p(1000, 0), p(1000, 700), p(820, 700)],
  ],
  zones: [],
  marks: [
    { id: 'pref-port', at: p(500, 520) },
    { id: 'port-spar', at: p(290, 500) },
    { id: 'starboard-spar', at: p(410, 470) },
    { id: 'port-spar', at: p(300, 300) },
    { id: 'starboard-spar', at: p(405, 300) },
    { id: 'port-spar', at: p(300, 160) },
    { id: 'north', at: p(500, 110) },
    { id: 'special', at: p(690, 480) },
  ],
  start: p(420, 660),
  finish: p(700, 60),
}

/** Round a Mediterranean island: reef with a west cardinal, a rock, a beach swimming zone. */
const medIsland: ChartLevel = {
  id: 'med-island',
  region: 'med',
  width: 1000,
  height: 700,
  buoyageDeg: 90,
  land: [
    [p(0, 700), p(0, 600), p(300, 620), p(500, 580), p(700, 610), p(1000, 590), p(1000, 700)],
    [p(380, 220), p(560, 190), p(640, 280), p(560, 360), p(420, 340)],
  ],
  shoals: [
    [p(250, 240), p(370, 230), p(380, 300), p(260, 310)],
    [p(650, 230), p(700, 240), p(690, 320), p(640, 300)],
  ],
  zones: [[p(430, 345), p(560, 365), p(580, 400), p(440, 385)]],
  marks: [
    { id: 'west', at: p(210, 270) },
    { id: 'east', at: p(740, 280) },
    { id: 'isolated', at: p(500, 480) },
    { id: 'swim', at: p(440, 385) },
    { id: 'swim', at: p(510, 393) },
    { id: 'swim', at: p(580, 400) },
  ],
  start: p(80, 120),
  finish: p(940, 500),
}

const night = (level: ChartLevel): ChartLevel => ({ ...level, id: `${level.id}-night`, night: true })

export const levels: ChartLevel[] = [
  harbourEntry,
  riverMouth,
  cardinalShoal,
  cardinalMaze,
  wreckChannel,
  nlSplit,
  nlLake,
  medBay,
  medIsland,
  night(harbourEntry),
  night(riverMouth),
  night(cardinalMaze),
  night(wreckChannel),
  { ...medBay, id: 'med-night', night: true },
]

const baseSolutions: Record<string, Pt[]> = {
  'harbour-entry': [p(500, 600), p(500, 200)],
  'river-mouth': [p(500, 330), p(708, 514)],
  'cardinal-shoal': [p(500, 590), p(760, 420)],
  'cardinal-maze': [p(140, 400), p(450, 420), p(660, 270), p(840, 330), p(860, 600)],
  'wreck-channel': [p(250, 350), p(400, 400), p(520, 400), p(650, 350)],
  'nl-split': [p(500, 420), p(530, 390), p(640, 268), p(762, 170)],
  'nl-lake': [p(380, 560), p(350, 400), p(350, 180), p(450, 90)],
  'med-bay': [p(200, 260), p(330, 300), p(600, 430), p(800, 520)],
  'med-island': [p(150, 300), p(330, 440), p(500, 425), p(680, 440)],
}

/** A known safe route per level, used for the "show a safe route" hint and in tests. */
export const solutions: Record<string, Pt[]> = {
  ...baseSolutions,
  'harbour-entry-night': baseSolutions['harbour-entry'],
  'river-mouth-night': baseSolutions['river-mouth'],
  'cardinal-maze-night': baseSolutions['cardinal-maze'],
  'wreck-channel-night': baseSolutions['wreck-channel'],
  'med-night': baseSolutions['med-bay'],
}

export function findLevel(id: string | undefined): ChartLevel | undefined {
  return levels.find((l) => l.id === id)
}
