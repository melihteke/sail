import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { MessageKey } from '../../../i18n/en'
import { useI18n, type Translate } from '../../../i18n'
import { shuffled } from '../../../lib/random'
import { getStars, recordStars, starsFromScore } from '../progress'
import { Feedback, Panel, StarsView } from '../ui'

const PREFIX = 'day-skipper:decisions'

/** Each scenario has three decisions; every option scores 2 (best), 1 (acceptable) or 0 (wrong). */
export const DECISIONS: { id: string; icon: string; steps: Record<'a' | 'b' | 'c', 0 | 1 | 2>[] }[] = [
  { id: 'forecast', icon: '🌦️', steps: [{ a: 0, b: 2, c: 1 }, { a: 0, b: 2, c: 0 }, { a: 2, b: 0, c: 1 }] },
  { id: 'engine', icon: '⚙️', steps: [{ a: 2, b: 0, c: 0 }, { a: 2, b: 0, c: 0 }, { a: 2, b: 1, c: 0 }] },
  { id: 'aground', icon: '🪨', steps: [{ a: 2, b: 0, c: 0 }, { a: 2, b: 0, c: 0 }, { a: 2, b: 0, c: 1 }] },
  { id: 'fire', icon: '🔥', steps: [{ a: 2, b: 0, c: 0 }, { a: 2, b: 0, c: 0 }, { a: 2, b: 0, c: 0 }] },
  { id: 'helicopter', icon: '🚁', steps: [{ a: 2, b: 0, c: 0 }, { a: 2, b: 0, c: 0 }, { a: 2, b: 0, c: 0 }] },
  { id: 'liferaft', icon: '🛟', steps: [{ a: 2, b: 0, c: 0 }, { a: 2, b: 0, c: 0 }, { a: 2, b: 0, c: 0 }] },
]

export function SkipperCall() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const sc = DECISIONS.find((d) => d.id === search.get('level'))
  if (!sc)
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DECISIONS.map((d) => (
          <button key={d.id} type="button" onClick={() => setSearch({ level: d.id })} className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-navy-900/60">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{d.icon}</span>
              <StarsView n={getStars(`${PREFIX}:${d.id}`)} />
            </div>
            <div className="mt-2 font-semibold">{t(`rya.dc.${d.id}` as MessageKey)}</div>
          </button>
        ))}
      </div>
    )
  return <Story key={sc.id} t={t} sc={sc} onBack={() => setSearch({})} />
}

function Story({ t, sc, onBack }: { t: Translate; sc: (typeof DECISIONS)[number]; onBack: () => void }) {
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState<'a' | 'b' | 'c' | null>(null)
  const [points, setPoints] = useState(0)
  const [order] = useState(() => sc.steps.map(() => shuffled(['a', 'b', 'c'] as const)))
  const done = step >= sc.steps.length
  const max = sc.steps.length * 2
  const k = (s: string) => `rya.dc.${sc.id}.${s}` as MessageKey

  const pick = (c: 'a' | 'b' | 'c') => {
    if (picked) return
    setPicked(c)
    setPoints((p) => p + sc.steps[step][c])
  }
  const next = () => {
    const ns = step + 1
    setStep(ns)
    setPicked(null)
    if (ns >= sc.steps.length) {
      const stars = starsFromScore(points, max)
      if (stars > 0) recordStars(`${PREFIX}:${sc.id}`, stars)
    }
  }

  return (
    <div className="max-w-3xl">
      <button type="button" onClick={onBack} className="text-sm text-sea-500 hover:underline">
        ← {t('rya.dc.all')}
      </button>
      <h2 className="mt-1 text-xl font-semibold">
        {sc.icon} {t(`rya.dc.${sc.id}` as MessageKey)}
      </h2>
      <Panel className="mt-3 text-sm">{t(k('intro'))}</Panel>
      <div className="mt-2 flex gap-1">
        {sc.steps.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-emerald-500' : i === step ? 'bg-sea-500' : 'bg-slate-200 dark:bg-white/10'}`} />
        ))}
      </div>
      {!done ? (
        <Panel className="mt-3">
          <p className="font-medium">{t(k(`${step + 1}.q`))}</p>
          <div className="mt-3 grid gap-2">
            {order[step].map((c) => {
              const score = sc.steps[step][c]
              let cls = 'btn-secondary text-left'
              if (picked) {
                if (score === 2) cls += ' !border-emerald-500 !bg-emerald-50 dark:!bg-emerald-950/50'
                else if (c === picked) cls += score === 1 ? ' !border-amber-500 !bg-amber-50 dark:!bg-amber-950/40' : ' !border-rose-500 !bg-rose-50 dark:!bg-rose-950/50'
              }
              return (
                <button key={c} type="button" className={cls} onClick={() => pick(c)}>
                  {t(k(`${step + 1}.${c}`))}
                </button>
              )
            })}
          </div>
          {picked && (
            <div className="mt-3">
              <Feedback ok={sc.steps[step][picked] > 0}>{t(k(`${step + 1}.${picked}.why`))}</Feedback>
              <button type="button" className="btn-primary mt-2" onClick={next}>
                {t('nm.next')} →
              </button>
            </div>
          )}
        </Panel>
      ) : (
        <Panel className="mt-3 text-center">
          <StarsView n={starsFromScore(points, max)} size="text-3xl" />
          <p className="mt-1 font-semibold">{t('rya.score', { score: points, max })}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t(k('lesson'))}</p>
          <button type="button" className="btn-primary mt-3" onClick={onBack}>
            {t('rya.dc.all')}
          </button>
        </Panel>
      )}
    </div>
  )
}
