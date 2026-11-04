import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { findLight } from '../../core/lights'
import type { MessageKey } from '../../i18n/en'
import { useI18n, type Translate } from '../../i18n'
import { loadJson, saveJson } from '../../lib/storage'
import { useClock } from '../../lib/useClock'
import { BuoySvg } from './BuoySvg'
import { LightBeacon } from './LightBeacon'
import { LightsPractice } from './LightsPractice'
import { marks, type MarkDef } from './marks'
import { PassageLevels } from './PassageGame'
import { makeQuiz } from './quiz'
import { SideDrill } from './SideDrill'

const QUIZ_LENGTH = 10
const BEST_KEY = 'sg-nm-best'
const TABS = ['cards', 'quiz', 'side', 'passage', 'lights'] as const
type Tab = (typeof TABS)[number]

const markText = (t: Translate, id: MarkDef['id'], field: 'name' | 'meaning' | 'light' | 'tip') =>
  t(`mark.${id}.${field}` as MessageKey)

export function NauticalMarks() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const requested = search.get('tab')
  const tab: Tab = (TABS as readonly string[]).includes(requested ?? '') ? (requested as Tab) : 'cards'
  const setTab = (k: Tab) => setSearch({ tab: k }, { replace: true })

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/" className="text-sm text-sea-500 hover:underline">
        ← {t('common.home')}
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 dark:text-white">
        {t('game.nauticalMarks.title')}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{t('nm.intro')}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('nm.regionNote')}</p>

      <div className="mt-6 flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 dark:bg-white/5" role="tablist">
        {TABS.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium ${
              tab === k ? 'bg-white shadow dark:bg-navy-700' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t(`nm.tab.${k}`)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'cards' && <Flashcards t={t} />}
        {tab === 'quiz' && <Quiz t={t} />}
        {tab === 'side' && <SideDrill t={t} />}
        {tab === 'passage' && <PassageLevels t={t} />}
        {tab === 'lights' && <LightsPractice t={t} />}
      </div>
    </div>
  )
}

function MarkLight({ lightId }: { lightId: string }) {
  const time = useClock()
  return (
    <span className="inline-flex items-center gap-2">
      <span className="rounded bg-slate-900">
        <LightBeacon light={findLight(lightId)} time={time} size={28} />
      </span>
      <span className="font-mono text-xs">{findLight(lightId).code}</span>
    </span>
  )
}

function Flashcards({ t }: { t: Translate }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const mark = marks[index]
  const go = (d: number) => {
    setIndex((i) => (i + d + marks.length) % marks.length)
    setFlipped(false)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {marks.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setIndex(i)
              setFlipped(false)
            }}
            className={`rounded-lg border p-1 ${
              i === index ? 'border-sea-500 bg-sea-100 dark:bg-navy-700' : 'border-slate-200 dark:border-white/10'
            }`}
            aria-label={markText(t, m.id, 'name')}
          >
            <BuoySvg mark={m} className="h-14 w-9" />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="mt-4 flex min-h-80 w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm sm:flex-row sm:gap-8 dark:border-white/10 dark:bg-navy-900/60"
      >
        <BuoySvg mark={mark} className="h-64 w-40 shrink-0" title={flipped ? markText(t, mark.id, 'name') : undefined} />
        {flipped ? (
          <dl className="mt-4 space-y-3 sm:mt-0">
            <div className="text-xl font-semibold">{markText(t, mark.id, 'name')}</div>
            {mark.region && (
              <span className="inline-block rounded bg-sea-100 px-2 py-0.5 text-xs font-medium text-navy-900 dark:bg-navy-700 dark:text-slate-100">
                {t(`nm.region.${mark.region}`)}
              </span>
            )}
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('nm.meaning')}</dt>
              <dd>{markText(t, mark.id, 'meaning')}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('nm.light')}</dt>
              <dd>{markText(t, mark.id, 'light')}</dd>
              {mark.lightId && (
                <dd className="mt-1">
                  <MarkLight lightId={mark.lightId} />
                </dd>
              )}
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('nm.tip')}</dt>
              <dd>{markText(t, mark.id, 'tip')}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-slate-500 sm:mt-0 dark:text-slate-400">{t('nm.flip')}</p>
        )}
      </button>

      <div className="mt-4 flex justify-between">
        <button type="button" className="btn-secondary" onClick={() => go(-1)}>
          ← {t('nm.prev')}
        </button>
        <span className="self-center text-sm text-slate-500">
          {index + 1} / {marks.length}
        </span>
        <button type="button" className="btn-secondary" onClick={() => go(1)}>
          {t('nm.next')} →
        </button>
      </div>
    </div>
  )
}

function Quiz({ t }: { t: Translate }) {
  const [questions, setQuestions] = useState(() => makeQuiz(marks, QUIZ_LENGTH, 4, Math.random))
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<MarkDef | null>(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => loadJson<number>(BEST_KEY, 0))
  const done = qi >= questions.length

  const pick = (m: MarkDef) => {
    if (picked) return
    setPicked(m)
    if (m === questions[qi].answer) setScore((s) => s + 1)
  }

  const next = () => {
    const finalScore = score
    setPicked(null)
    setQi((i) => i + 1)
    if (qi + 1 >= questions.length && finalScore > best) {
      setBest(finalScore)
      saveJson(BEST_KEY, finalScore)
    }
  }

  const restart = () => {
    setQuestions(makeQuiz(marks, QUIZ_LENGTH, 4, Math.random))
    setQi(0)
    setScore(0)
    setPicked(null)
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-navy-900/60">
        <div className="text-5xl font-bold text-navy-900 dark:text-white">
          {score}/{questions.length}
        </div>
        <p className="mt-2">{t('nm.final', { score, total: questions.length })}</p>
        <p className="mt-1 text-sm text-slate-500">{t('nm.best', { score: best, total: questions.length })}</p>
        <button type="button" className="btn-primary mt-4" onClick={restart}>
          {t('nm.restart')}
        </button>
      </div>
    )
  }

  const q = questions[qi]
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-navy-900/60">
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>{t('nm.question', { n: qi + 1, total: questions.length })}</span>
        <span>
          {score} ✓ · {t('nm.best', { score: best, total: questions.length })}
        </span>
      </div>
      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <BuoySvg mark={q.answer} className="h-64 w-40 shrink-0" />
        <div className="w-full">
          <div className="grid gap-2">
            {q.options.map((o) => {
              let cls = 'btn-secondary text-left'
              if (picked) {
                if (o === q.answer) cls += ' !border-emerald-500 !bg-emerald-50 dark:!bg-emerald-950/50'
                else if (o === picked) cls += ' !border-rose-500 !bg-rose-50 dark:!bg-rose-950/50'
              }
              return (
                <button key={o.id} type="button" className={cls} onClick={() => pick(o)} disabled={!!picked && o !== picked && o !== q.answer}>
                  {markText(t, o.id, 'name')}
                </button>
              )
            })}
          </div>
          {picked && (
            <div className="mt-4 text-sm">
              <p className={picked === q.answer ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>
                {picked === q.answer ? t('nm.correct') : t('nm.wrong', { name: markText(t, q.answer.id, 'name') })}
              </p>
              <p className="mt-1">{markText(t, q.answer.id, 'meaning')}</p>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                {t('nm.light')}: {markText(t, q.answer.id, 'light')}
              </p>
              <button type="button" className="btn-primary mt-3" onClick={next}>
                {t('nm.next')} →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
