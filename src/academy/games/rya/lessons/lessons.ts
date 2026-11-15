import type { Lang } from '../../../i18n'
import type { CourseId } from '../courses'
import { lessonsEn } from './content.en'
import { lessonsNl } from './content.nl'
import { lessonsTr } from './content.tr'

export const LESSON_IDS = ['sails', 'ropes', 'power', 'tides', 'anchoring', 'colregs', 'lights', 'pilotage', 'safety'] as const
export type LessonId = (typeof LESSON_IDS)[number]

export type WidgetId = 'twelfths' | 'scope' | 'points' | 'lights' | 'rig3d' | 'stream' | 'gate' | 'tideanchor' | 'moon' | 'atlas' | 'diamond'

/** A content block. Text may contain **bold**. */
export type Block =
  | { p: string }
  | { list: string[] }
  | { steps: string[] }
  | { ex: { title: string; lines: string[] } }
  | { tip: string }
  | { warn: string }
  | { table: { head: string[]; rows: string[][] } }
  | { widget: WidgetId }
  | { game: string }

export interface CheckQuestion {
  q: string
  options: string[]
  answer: number
  why: string
}

export interface LessonText {
  title: string
  summary: string
  sections: { h: string; blocks: Block[] }[]
  check: CheckQuestion[]
}

export type LessonSet = Record<LessonId, LessonText>

export interface LessonMeta {
  id: LessonId
  icon: string
  courses: CourseId[]
  games: { course: CourseId; game: string }[]
}

export const lessonMeta: LessonMeta[] = [
  { id: 'sails', icon: '⛵', courses: ['competent-crew', 'day-skipper'], games: [{ course: 'competent-crew', game: 'rig3d' }, { course: 'competent-crew', game: 'rig' }, { course: 'competent-crew', game: 'tack' }, { course: 'day-skipper', game: 'buoy' }] },
  { id: 'ropes', icon: '🪢', courses: ['competent-crew'], games: [{ course: 'competent-crew', game: 'knots' }, { course: 'competent-crew', game: 'lines' }] },
  { id: 'power', icon: '⚙️', courses: ['day-skipper'], games: [{ course: 'day-skipper', game: 'harbour' }] },
  { id: 'tides', icon: '🌊', courses: ['day-skipper'], games: [{ course: 'day-skipper', game: 'passage' }, { course: 'day-skipper', game: 'anchor' }] },
  { id: 'anchoring', icon: '⚓', courses: ['day-skipper'], games: [{ course: 'day-skipper', game: 'anchor' }] },
  { id: 'colregs', icon: '🚢', courses: ['competent-crew', 'day-skipper'], games: [{ course: 'day-skipper', game: 'collision' }, { course: 'competent-crew', game: 'lookout' }] },
  { id: 'lights', icon: '🔦', courses: ['competent-crew', 'day-skipper'], games: [{ course: 'competent-crew', game: 'lookout' }, { course: 'day-skipper', game: 'collision' }] },
  { id: 'pilotage', icon: '🗺️', courses: ['day-skipper'], games: [{ course: 'day-skipper', game: 'passage' }] },
  { id: 'safety', icon: '🆘', courses: ['competent-crew', 'day-skipper'], games: [{ course: 'competent-crew', game: 'vhf' }, { course: 'day-skipper', game: 'decisions' }] },
]

export const lessonSets: Record<Lang, LessonSet> = { en: lessonsEn, nl: lessonsNl, tr: lessonsTr }

export function isLesson(id: string | undefined): id is LessonId {
  return (LESSON_IDS as readonly string[]).includes(id ?? '')
}

export function metaOf(id: LessonId): LessonMeta {
  return lessonMeta.find((m) => m.id === id)!
}

export function lessonsForCourse(course: CourseId): LessonMeta[] {
  return lessonMeta.filter((m) => m.courses.includes(course))
}

export function lessonsForGame(game: string): LessonMeta[] {
  return lessonMeta.filter((m) => m.games.some((g) => g.game === game))
}

/* ---------- Pure helpers used by the lesson widgets ---------- */

export const TWELFTHS = [0, 1, 3, 6, 9, 11, 12]

/** Height of tide by the rule of twelfths, `hours` after LW (rising for 6 h, then falling for 6 h). */
export function twelfthsHeight(lw: number, hw: number, hours: number): number {
  const h = Math.max(0, Math.min(12, hours))
  const rising = h <= 6 ? h : 12 - h
  const i = Math.floor(rising)
  const f = i >= 6 ? 12 : TWELFTHS[i] + (TWELFTHS[i + 1] - TWELFTHS[i]) * (rising - i)
  return lw + ((hw - lw) * f) / 12
}

/** Hours after LW between which the height is at least `need` (null if never). */
export function tideWindow(lw: number, hw: number, need: number): [number, number] | null {
  if (need > hw) return null
  if (need <= lw) return [0, 12]
  let start = 6
  for (let h = 0; h <= 6; h += 0.01) {
    if (twelfthsHeight(lw, hw, h) >= need) {
      start = h
      break
    }
  }
  return [start, 12 - start]
}

export function swingRadius(chain: number, depth: number, boatLength = 10): number {
  return Math.sqrt(Math.max(0, chain * chain - depth * depth)) + boatLength / 2
}
