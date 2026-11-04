import { useState, type ReactNode } from 'react'
import { useI18n } from '../i18n'
import { loadJson, saveJson } from './storage'

export interface QuizOption {
  value: string
  label: ReactNode
}

interface Props<T> {
  /** Builds a fresh set of questions (called on start and restart). */
  makeItems: () => T[]
  question: (item: T) => ReactNode
  /** Shown next to the question, e.g. a picture. */
  picture?: (item: T) => ReactNode
  options: (item: T) => QuizOption[]
  answer: (item: T) => string
  explanation?: (item: T) => ReactNode
  bestKey: string
  /** Show options in a 2-column grid. */
  columns?: 1 | 2
}

/** Generic multiple-choice practice round with a persistent best score. */
export function QuizRunner<T>({ makeItems, question, picture, options, answer, explanation, bestKey, columns = 1 }: Props<T>) {
  const { t } = useI18n()
  const [items, setItems] = useState(makeItems)
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => loadJson<number>(bestKey, 0))
  const [opts, setOpts] = useState(() => (items[0] ? options(items[0]) : []))

  if (qi >= items.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-navy-900/60">
        <div className="text-5xl font-bold text-navy-900 dark:text-white">
          {score}/{items.length}
        </div>
        <p className="mt-1 text-sm text-slate-500">{t('nm.best', { score: best, total: items.length })}</p>
        <button
          type="button"
          className="btn-primary mt-4"
          onClick={() => {
            const fresh = makeItems()
            setItems(fresh)
            setOpts(fresh[0] ? options(fresh[0]) : [])
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

  const item = items[qi]
  const correct = answer(item)
  const pick = (v: string) => {
    if (picked) return
    setPicked(v)
    if (v === correct) setScore((s) => s + 1)
  }
  const next = () => {
    const finished = qi + 1 >= items.length
    if (finished && score > best) {
      setBest(score)
      saveJson(bestKey, score)
    }
    setPicked(null)
    setQi(qi + 1)
    if (!finished) setOpts(options(items[qi + 1]))
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-navy-900/60">
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          {qi + 1}/{items.length}
        </span>
        <span>
          {score} ✓ · {t('nm.best', { score: best, total: items.length })}
        </span>
      </div>
      <div className="mt-4 flex flex-col items-center gap-6 md:flex-row md:items-start">
        {picture && <div className="shrink-0">{picture(item)}</div>}
        <div className="w-full">
          <div className="font-medium">{question(item)}</div>
          <div className={`mt-3 grid gap-2 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
            {opts.map((o) => {
              let cls = 'btn-secondary text-left'
              if (picked) {
                if (o.value === correct) cls += ' !border-emerald-500 !bg-emerald-50 dark:!bg-emerald-950/50'
                else if (o.value === picked) cls += ' !border-rose-500 !bg-rose-50 dark:!bg-rose-950/50'
              }
              return (
                <button key={o.value} type="button" className={cls} onClick={() => pick(o.value)}>
                  {o.label}
                </button>
              )
            })}
          </div>
          {picked && (
            <div className="mt-4 text-sm">
              <p className={picked === correct ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>
                {picked === correct ? t('nm.correct') : t('sd.wrong')}
              </p>
              {explanation && <div className="mt-1">{explanation(item)}</div>}
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
