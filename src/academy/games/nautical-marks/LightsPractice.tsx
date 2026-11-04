import { useState } from 'react'
import { lightChars, type LightChar } from '../../core/lights'
import type { MessageKey } from '../../i18n/en'
import type { Translate } from '../../i18n'
import { loadJson, saveJson } from '../../lib/storage'
import { useClock } from '../../lib/useClock'
import { LightBeacon } from './LightBeacon'
import { shuffle } from './quiz'

const QUIZ_LENGTH = 10
const BEST_KEY = 'sg-lights-best'

function describeLight(t: Translate, l: LightChar): string {
  return t(`lk.${l.kind}` as MessageKey, { period: l.period, count: l.count ?? 1 })
}

export function LightsPractice({ t }: { t: Translate }) {
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn')
  return (
    <div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{t('lt.intro')}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('lt.legend')}</p>
      <div className="mt-4 inline-grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-white/5">
        {(['learn', 'quiz'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium ${
              mode === m ? 'bg-white shadow dark:bg-navy-700' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t(`lt.${m}`)}
          </button>
        ))}
      </div>
      <div className="mt-4">{mode === 'learn' ? <LightCatalog t={t} /> : <LightQuiz t={t} />}</div>
    </div>
  )
}

function LightCatalog({ t }: { t: Translate }) {
  const time = useClock()
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {lightChars.map((l) => (
        <div key={l.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-navy-900/60">
          <div className="rounded-lg bg-slate-900">
            <LightBeacon light={l} time={time} size={64} />
          </div>
          <div className="min-w-0">
            <div className="font-mono font-semibold">{l.code}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">{describeLight(t, l)}</div>
            {l.markId && (
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {t('lt.usedOn')}: {t(`mark.${l.markId}.name` as MessageKey)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Options with the same colour as the answer first, so the colour alone does not give it away. */
function optionsFor(answer: LightChar): LightChar[] {
  const same = shuffle(lightChars.filter((l) => l !== answer && l.color === answer.color), Math.random)
  const other = shuffle(lightChars.filter((l) => l !== answer && l.color !== answer.color), Math.random)
  return shuffle([answer, ...[...same, ...other].slice(0, 3)], Math.random)
}

function newQuiz() {
  return shuffle(lightChars, Math.random)
    .slice(0, QUIZ_LENGTH)
    .map((answer) => ({ answer, options: optionsFor(answer) }))
}

function LightQuiz({ t }: { t: Translate }) {
  const [questions, setQuestions] = useState(newQuiz)
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<LightChar | null>(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => loadJson<number>(BEST_KEY, 0))
  const [stopwatch, setStopwatch] = useState(false)
  const time = useClock(qi < questions.length, 30, qi)

  if (qi >= questions.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-navy-900/60">
        <div className="text-5xl font-bold text-navy-900 dark:text-white">
          {score}/{questions.length}
        </div>
        <p className="mt-1 text-sm text-slate-500">{t('nm.best', { score: best, total: questions.length })}</p>
        <button
          type="button"
          className="btn-primary mt-4"
          onClick={() => {
            setQuestions(newQuiz())
            setQi(0)
            setScore(0)
            setPicked(null)
          }}
        >
          {t('nm.restart')}
        </button>
      </div>
    )
  }

  const q = questions[qi]
  const pick = (o: LightChar) => {
    if (picked) return
    setPicked(o)
    if (o === q.answer) setScore((s) => s + 1)
  }
  const next = () => {
    if (qi + 1 >= questions.length && score > best) {
      setBest(score)
      saveJson(BEST_KEY, score)
    }
    setPicked(null)
    setQi((i) => i + 1)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-navy-900/60">
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>{t('lt.question', { n: qi + 1, total: questions.length })}</span>
        <span>
          {score} ✓ · {t('nm.best', { score: best, total: questions.length })}
        </span>
      </div>
      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center">
          <div className="rounded-2xl bg-gradient-to-b from-slate-950 to-navy-950 p-4">
            <LightBeacon light={q.answer} time={time} size={160} />
          </div>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={stopwatch} onChange={(e) => setStopwatch(e.target.checked)} />
            {t('lt.stopwatch')}
          </label>
          {stopwatch && <div className="font-mono text-2xl tabular-nums">{time.toFixed(1)} s</div>}
        </div>
        <div className="w-full">
          <div className="grid gap-2">
            {q.options.map((o) => {
              let cls = 'btn-secondary text-left font-mono'
              if (picked) {
                if (o === q.answer) cls += ' !border-emerald-500 !bg-emerald-50 dark:!bg-emerald-950/50'
                else if (o === picked) cls += ' !border-rose-500 !bg-rose-50 dark:!bg-rose-950/50'
              }
              return (
                <button key={o.id} type="button" className={cls} onClick={() => pick(o)} disabled={!!picked && o !== picked && o !== q.answer}>
                  {o.code}
                </button>
              )
            })}
          </div>
          {picked && (
            <div className="mt-4 text-sm">
              <p className={picked === q.answer ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>
                {picked === q.answer ? t('nm.correct') : t('lt.wrong', { code: q.answer.code })}
              </p>
              <p className="mt-1">{describeLight(t, q.answer)}</p>
              {q.answer.markId && (
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  {t('lt.usedOn')}: {t(`mark.${q.answer.markId}.name` as MessageKey)}
                </p>
              )}
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
