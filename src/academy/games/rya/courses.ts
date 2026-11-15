export type CourseId = 'competent-crew' | 'day-skipper'

export const COURSE_IDS: CourseId[] = ['competent-crew', 'day-skipper']

export interface GameInfo {
  id: string
  icon: string
  /** Level ids when the game has several levels (stars are averaged). */
  levels?: string[]
}

export interface BriefingCard {
  id: string
  /** Game that trains this topic. */
  game?: string
  /** Existing academy module that also trains it. */
  module?: string
}

export interface QuizItem {
  id: string
  /** Index (0..3) of the correct option. */
  answer: number
}

export interface Course {
  id: CourseId
  games: GameInfo[]
  briefing: BriefingCard[]
  quiz: QuizItem[]
  checklist: number
  /** Existing academy modules worth practising with this course. */
  modules: { path: string; key: string; icon: string }[]
}

export const HARBOUR_LEVELS = ['first-steps', 'astern', 'alongside', 'onshore', 'stream', 'spring-off', 'turn', 'stern-to']
export const LINES_LEVELS = ['calm', 'surge', 'onshore', 'offshore']
export const ANCHOR_LEVELS = ['cove', 'tidal', 'crowded']
export const BUOY_LEVELS = ['light', 'with-stream', 'against-stream']
export const COLLISION_LEVELS = ['crossing', 'head-on', 'overtaken', 'sailing', 'night', 'fog']
export const LOOKOUT_LEVELS = ['dusk', 'night', 'busy']

export const courses: Record<CourseId, Course> = {
  'competent-crew': {
    id: 'competent-crew',
    games: [
      { id: 'rig', icon: '⛵', levels: ['hoist-main', 'unfurl-jib', 'reef', 'drop-main', 'furl-jib'] },
      { id: 'tack', icon: '🔄', levels: ['tack', 'gybe'] },
      { id: 'knots', icon: '🪢', levels: ['jobs', 'cleat'] },
      { id: 'lines', icon: '🧷', levels: LINES_LEVELS },
      { id: 'lookout', icon: '🔦', levels: LOOKOUT_LEVELS },
      { id: 'vhf', icon: '📻', levels: ['dsc', 'mayday', 'which'] },
    ],
    briefing: [
      { id: 'parts', game: 'rig' },
      { id: 'ropes', game: 'knots' },
      { id: 'hoist', game: 'rig' },
      { id: 'reef', game: 'rig' },
      { id: 'points', game: 'tack', module: '/sail-trim' },
      { id: 'tacking', game: 'tack' },
      { id: 'helm' },
      { id: 'alongside', game: 'lines' },
      { id: 'rules', game: 'lookout', module: '/colreg' },
      { id: 'safety', game: 'vhf' },
      { id: 'mob', module: '/man-overboard' },
      { id: 'living' },
      { id: 'weather' },
    ],
    quiz: [
      { id: 'cc1', answer: 0 },
      { id: 'cc2', answer: 2 },
      { id: 'cc3', answer: 1 },
      { id: 'cc4', answer: 3 },
      { id: 'cc5', answer: 0 },
      { id: 'cc6', answer: 1 },
      { id: 'cc7', answer: 2 },
      { id: 'cc8', answer: 0 },
      { id: 'cc9', answer: 3 },
      { id: 'cc10', answer: 1 },
      { id: 'cc11', answer: 2 },
      { id: 'cc12', answer: 0 },
    ],
    checklist: 12,
    modules: [
      { path: '/sail-trim', key: 'game.trim.title', icon: '⛵' },
      { path: '/man-overboard', key: 'game.mob.title', icon: '🆘' },
      { path: '/colreg', key: 'game.colreg.title', icon: '🚢' },
      { path: '/nautical-marks', key: 'game.nauticalMarks.title', icon: '🛟' },
    ],
  },
  'day-skipper': {
    id: 'day-skipper',
    games: [
      { id: 'harbour', icon: '⚓', levels: HARBOUR_LEVELS },
      { id: 'anchor', icon: '🪝', levels: ANCHOR_LEVELS },
      { id: 'buoy', icon: '🔴', levels: BUOY_LEVELS },
      { id: 'collision', icon: '🚢', levels: COLLISION_LEVELS },
      { id: 'passage', icon: '🗺️', levels: ['gate', 'pilotage'] },
      { id: 'decisions', icon: '🧭', levels: ['forecast', 'engine', 'aground', 'fire', 'helicopter', 'liferaft'] },
    ],
    briefing: [
      { id: 'prep' },
      { id: 'sailplan' },
      { id: 'power', game: 'harbour' },
      { id: 'berthing', game: 'harbour' },
      { id: 'leaving', game: 'harbour' },
      { id: 'anchoring', game: 'anchor' },
      { id: 'mooring', game: 'buoy' },
      { id: 'irpcs', game: 'collision', module: '/colreg' },
      { id: 'mobds', module: '/man-overboard' },
      { id: 'distress', game: 'decisions' },
      { id: 'passageplan', game: 'passage', module: '/nav-planner' },
      { id: 'fog', game: 'collision' },
      { id: 'forecast', game: 'decisions' },
    ],
    quiz: [
      { id: 'ds1', answer: 1 },
      { id: 'ds2', answer: 0 },
      { id: 'ds3', answer: 2 },
      { id: 'ds4', answer: 3 },
      { id: 'ds5', answer: 1 },
      { id: 'ds6', answer: 0 },
      { id: 'ds7', answer: 2 },
      { id: 'ds8', answer: 1 },
      { id: 'ds9', answer: 3 },
      { id: 'ds10', answer: 0 },
      { id: 'ds11', answer: 2 },
      { id: 'ds12', answer: 1 },
    ],
    checklist: 12,
    modules: [
      { path: '/nav-planner', key: 'game.navplan.title', icon: '🗺️' },
      { path: '/colreg', key: 'game.colreg.title', icon: '🚢' },
      { path: '/nautical-marks?tab=passage', key: 'game.passage.title', icon: '⚓' },
      { path: '/man-overboard', key: 'game.mob.title', icon: '🆘' },
      { path: '/route-planner', key: 'game.routePlanner.title', icon: '🧭' },
    ],
  },
}

export function isCourse(id: string | undefined): id is CourseId {
  return id === 'competent-crew' || id === 'day-skipper'
}
