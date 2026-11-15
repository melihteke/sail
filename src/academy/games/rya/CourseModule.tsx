import { useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import type { MessageKey } from '../../i18n/en'
import { useI18n, type Translate } from '../../i18n'
import { QuizRunner } from '../../lib/QuizRunner'
import { shuffled } from '../../lib/random'
import { loadJson, saveJson } from '../../lib/storage'
import { courses, isCourse, type Course, type CourseId } from './courses'
import { gameStars } from './progress'
import { lessonsForCourse } from './lessons/lessons'
import { LessonCards } from './lessons/LessonPage'
import { Panel, StarsView, TabBar } from './ui'

const TABS = ['lessons', 'games', 'briefing', 'quiz', 'checklist'] as const
type Tab = (typeof TABS)[number]

export function CourseModule() {
  const { course } = useParams()
  if (!isCourse(course)) return <Navigate to="/rya" replace />
  return <CoursePage key={course} course={courses[course]} />
}

function CoursePage({ course }: { course: Course }) {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const req = search.get('tab')
  const tab: Tab = (TABS as readonly string[]).includes(req ?? '') ? (req as Tab) : 'lessons'
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/rya" className="text-sm text-sea-500 hover:underline">
        ← {t('rya.title')}
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 dark:text-white">{t(`rya.course.${course.id}.title`)}</h1>
      <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">{t(`rya.course.${course.id}.intro`)}</p>
      <div className="mt-6">
        <TabBar tabs={TABS} value={tab} onChange={(k) => setSearch({ tab: k }, { replace: true })} label={(k) => t(`rya.tab.${k}`)} />
      </div>
      <div className="mt-6">
        {tab === 'lessons' && (
          <>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{t('rya.lessons.courseHint')}</p>
            <LessonCards items={lessonsForCourse(course.id)} />
          </>
        )}
        {tab === 'games' && <Games t={t} course={course} />}
        {tab === 'briefing' && <Briefing t={t} course={course} />}
        {tab === 'quiz' && <CourseQuiz t={t} course={course} />}
        {tab === 'checklist' && <Checklist t={t} course={course} />}
      </div>
    </div>
  )
}

function Games({ t, course }: { t: Translate; course: Course }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {course.games.map((g) => (
          <Link
            key={g.id}
            to={`/rya/${course.id}/${g.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-navy-900/60"
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl" aria-hidden>
                {g.icon}
              </span>
              <StarsView n={gameStars(`${course.id}:${g.id}`, g.levels ?? [])} />
            </div>
            <h3 className="mt-3 text-lg font-semibold">{t(`rya.g.${g.id}.title` as MessageKey)}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(`rya.g.${g.id}.desc` as MessageKey)}</p>
            <div className="mt-4 text-sm font-medium text-sea-500">{t('common.play')} →</div>
          </Link>
        ))}
      </div>
      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('rya.moreModules')}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {course.modules.map((m) => (
          <Link key={m.path} to={m.path} className="btn-secondary">
            {m.icon} {t(m.key as MessageKey)}
          </Link>
        ))}
      </div>
    </>
  )
}

function Briefing({ t, course }: { t: Translate; course: Course }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {course.briefing.map((b) => (
        <Panel key={b.id}>
          <h3 className="font-semibold">{t(`rya.b.${b.id}.title` as MessageKey)}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
            {t(`rya.b.${b.id}.text` as MessageKey)
              .split('|')
              .map((line) => (
                <li key={line}>{line.trim()}</li>
              ))}
          </ul>
          {(b.game || b.module) && (
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {b.game && (
                <Link to={`/rya/${course.id}/${b.game}`} className="font-medium text-sea-500 hover:underline">
                  🎮 {t(`rya.g.${b.game}.title` as MessageKey)}
                </Link>
              )}
              {b.module && (
                <Link to={b.module} className="font-medium text-sea-500 hover:underline">
                  🧭 {t('rya.alsoModule')}
                </Link>
              )}
            </div>
          )}
        </Panel>
      ))}
    </div>
  )
}

interface QuizCard {
  id: string
  order: number[]
  answer: number
}

function CourseQuiz({ t, course }: { t: Translate; course: Course }) {
  return (
    <QuizRunner<QuizCard>
      makeItems={() => shuffled(course.quiz).map((q) => ({ id: q.id, answer: q.answer, order: shuffled([0, 1, 2, 3]) }))}
      question={(q) => t(`rya.q.${q.id}` as MessageKey)}
      options={(q) => q.order.map((i) => ({ value: String(i), label: t(`rya.q.${q.id}.a${i}` as MessageKey) }))}
      answer={(q) => String(q.answer)}
      explanation={(q) => t(`rya.q.${q.id}.why` as MessageKey)}
      bestKey={`rya-quiz-${course.id}`}
    />
  )
}

function Checklist({ t, course }: { t: Translate; course: Course }) {
  const key = `rya-checklist-${course.id}`
  const [done, setDone] = useState<number[]>(() => loadJson<number[]>(key, []))
  const toggle = (i: number) => {
    const next = done.includes(i) ? done.filter((d) => d !== i) : [...done, i]
    setDone(next)
    saveJson(key, next)
  }
  const items = Array.from({ length: course.checklist }, (_, i) => i + 1)
  const pct = Math.round((done.length / items.length) * 100)
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{t('rya.checklist.title')}</h2>
        <span className="text-sm text-slate-500">{pct}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5">
              <input type="checkbox" className="mt-1" checked={done.includes(i)} onChange={() => toggle(i)} />
              <span className={`text-sm ${done.includes(i) ? 'text-slate-400 line-through' : ''}`}>{t(`rya.c.${course.id as CourseId}.${i}` as MessageKey)}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{t('rya.checklist.hint')}</p>
    </Panel>
  )
}
