import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { MessageKey } from '../../../i18n/en'
import { useI18n, type Translate } from '../../../i18n'
import { shuffled } from '../../../lib/random'
import { getStars, recordStars, starsFromScore } from '../progress'
import { Feedback, Panel, StarsView } from '../ui'

const PREFIX = 'competent-crew:knots'

export const KNOTS = ['bowline', 'clove', 'figure8', 'roundTurn', 'sheetBend', 'reef', 'rolling', 'cleat'] as const
export type Knot = (typeof KNOTS)[number]

/** A job on board, the knot that does it and where it is on the yacht drawing. */
export const JOBS: { id: string; knot: Knot; x: number; y: number }[] = [
  { id: 'fender', knot: 'clove', x: 250, y: 150 },
  { id: 'jibSheet', knot: 'bowline', x: 330, y: 120 },
  { id: 'stopper', knot: 'figure8', x: 120, y: 150 },
  { id: 'ring', knot: 'roundTurn', x: 40, y: 190 },
  { id: 'join', knot: 'sheetBend', x: 70, y: 110 },
  { id: 'reefPoints', knot: 'reef', x: 160, y: 95 },
  { id: 'ridingTurn', knot: 'rolling', x: 200, y: 140 },
  { id: 'cleatOff', knot: 'cleat', x: 290, y: 165 },
]

const ROUND_SECONDS = 10

export function KnotLab() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const part = search.get('part') === 'cleat' ? 'cleat' : 'jobs'
  return (
    <>
      <div className="mb-4 flex gap-2">
        {(['jobs', 'cleat'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setSearch({ part: p }, { replace: true })}
            className={`rounded-lg border px-3 py-1.5 text-sm ${p === part ? 'border-navy-900 bg-navy-900 text-white dark:border-sea-500 dark:bg-sea-500' : 'border-slate-300 bg-white dark:border-white/20 dark:bg-white/5'}`}
          >
            {t(`rya.kn.part.${p}`)} <StarsView n={getStars(`${PREFIX}:${p}`)} size="text-xs" />
          </button>
        ))}
      </div>
      {part === 'jobs' ? <JobRush t={t} /> : <CleatBuilder t={t} />}
    </>
  )
}

function JobRush({ t }: { t: Translate }) {
  const [order, setOrder] = useState(() => shuffled(JOBS))
  const [qi, setQi] = useState(0)
  const [left, setLeft] = useState(ROUND_SECONDS)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<Knot | null>(null)
  const [started, setStarted] = useState(false)
  const job = order[qi]
  const finished = qi >= order.length

  useEffect(() => {
    if (!started || picked || finished) return
    if (left <= 0) {
      setPicked('timeout' as Knot)
      return
    }
    const id = setTimeout(() => setLeft((l) => Math.round((l - 0.1) * 10) / 10), 100)
    return () => clearTimeout(id)
  }, [started, picked, finished, left])

  useEffect(() => {
    if (finished) recordStars(`${PREFIX}:jobs`, starsFromScore(score, order.length * 2))
  }, [finished, score, order.length])

  const pick = (k: Knot) => {
    if (picked || !started) return
    setPicked(k)
    if (k === job.knot) setScore((s) => s + (left > ROUND_SECONDS / 2 ? 2 : 1))
  }
  const next = () => {
    setPicked(null)
    setLeft(ROUND_SECONDS)
    setQi((i) => i + 1)
  }
  const restart = () => {
    setOrder(shuffled(JOBS))
    setQi(0)
    setScore(0)
    setPicked(null)
    setLeft(ROUND_SECONDS)
    setStarted(true)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
      <div>
        <Panel className="p-0">
          <svg viewBox="0 0 400 240" className="block w-full rounded-xl bg-gradient-to-b from-sky-100 to-sky-200 dark:from-navy-900 dark:to-navy-950">
            <rect y="190" width="400" height="50" fill="#1e9bd7" opacity="0.4" />
            <path d="M40 160 L360 160 Q356 182 330 192 L80 192 Q52 184 40 160 Z" fill="#f8fafc" stroke="#0b3a5c" strokeWidth="2" />
            <line x1="200" y1="20" x2="200" y2="160" stroke="#94a3b8" strokeWidth="5" />
            <line x1="200" y1="110" x2="90" y2="108" stroke="#334155" strokeWidth="5" />
            <path d="M198 24 L198 106 L94 106 Z" fill="#fff" stroke="#334155" />
            <path d="M202 26 L346 156 L250 150 Z" fill="#fff" stroke="#334155" />
            <line x1="60" y1="148" x2="345" y2="148" stroke="#475569" strokeWidth="1.5" />
            <rect x="20" y="186" width="30" height="8" fill="#8b8f96" />
            {JOBS.map((j, i) => {
              const active = !finished && started && job.id === j.id
              const done = order.slice(0, qi).some((x) => x.id === j.id)
              return (
                <g key={j.id} transform={`translate(${j.x} ${j.y})`}>
                  <circle r={active ? 13 : 9} fill={active ? '#f59e0b' : done ? '#16a34a' : '#0b3a5c'} stroke="#fff" strokeWidth="2" className={active ? 'animate-pulse' : ''} />
                  <text y="4" textAnchor="middle" fontSize="10" fill="#fff" fontWeight={700}>
                    {i + 1}
                  </text>
                </g>
              )
            })}
          </svg>
        </Panel>
        {!started ? (
          <div className="mt-3 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">{t('rya.kn.jobsIntro')}</p>
            <button type="button" className="btn-primary mt-2" onClick={restart}>
              ▶ {t('rya.start')}
            </button>
          </div>
        ) : finished ? (
          <Panel className="mt-3 text-center">
            <StarsView n={starsFromScore(score, order.length * 2)} size="text-3xl" />
            <p className="mt-1 font-semibold">{t('rya.score', { score, max: order.length * 2 })}</p>
            <button type="button" className="btn-primary mt-2" onClick={restart}>
              ↺ {t('rya.retry')}
            </button>
          </Panel>
        ) : (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">
                {qi + 1}/{order.length}: {t(`rya.kn.job.${job.id}` as MessageKey)}
              </span>
              <span className="tabular-nums text-slate-500">⭐ {score}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div className={`h-full transition-all ${left > ROUND_SECONDS / 2 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${(left / ROUND_SECONDS) * 100}%` }} />
            </div>
            {picked && (
              <div className="mt-3">
                <Feedback ok={picked === job.knot}>
                  <strong>{t(`rya.kn.k.${job.knot}` as MessageKey)}</strong>: {t(`rya.kn.why.${job.knot}` as MessageKey)}
                </Feedback>
                <button type="button" className="btn-primary mt-2" onClick={next}>
                  {t('nm.next')} →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Panel className="self-start">
        <h3 className="text-sm font-semibold">{t('rya.kn.box')}</h3>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {KNOTS.map((k) => {
            let cls = 'btn-secondary text-left text-xs'
            if (picked && !finished) {
              if (k === job.knot) cls += ' !border-emerald-500 !bg-emerald-50 dark:!bg-emerald-950/50'
              else if (k === picked) cls += ' !border-rose-500 !bg-rose-50 dark:!bg-rose-950/50'
            }
            return (
              <button key={k} type="button" className={cls} onClick={() => pick(k)} disabled={!started || finished}>
                <KnotIcon knot={k} /> {t(`rya.kn.k.${k}` as MessageKey)}
              </button>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}

function KnotIcon({ knot }: { knot: Knot }) {
  const paths: Record<Knot, string> = {
    bowline: 'M2 12 C2 2 14 2 14 9 C14 14 8 14 8 9 L8 2',
    clove: 'M1 4 L15 4 M4 1 C10 6 4 12 9 14 M8 1 C14 6 8 12 13 14',
    figure8: 'M2 8 C2 2 10 2 8 8 C6 14 14 14 14 8 C14 3 6 4 2 14',
    roundTurn: 'M8 1 L8 15 M2 6 C12 2 12 10 2 8 M2 10 L14 12',
    sheetBend: 'M1 6 L9 6 C13 6 13 10 9 10 L1 10 M15 4 C8 4 8 12 15 12',
    reef: 'M1 6 C6 6 10 10 15 10 M1 10 C6 10 10 6 15 6',
    rolling: 'M1 8 L15 8 M4 3 C2 12 7 12 6 4 M9 3 C7 12 12 12 11 4',
    cleat: 'M1 8 L15 8 M3 5 L13 11 M3 11 L13 5',
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="mr-1 inline-block align-[-3px]" aria-hidden>
      <path d={paths[knot]} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/* ---------------- Cleat hitch builder ---------------- */

export const CLEAT_STEPS = ['roundTurn', 'figure8', 'figure8b', 'lock'] as const
export const CLEAT_WRONG = ['lockFirst', 'nearHorn', 'manyTurns'] as const
type CleatChoice = (typeof CLEAT_STEPS)[number] | (typeof CLEAT_WRONG)[number]

function CleatBuilder({ t }: { t: Translate }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [msg, setMsg] = useState<{ ok: boolean; key: MessageKey } | null>(null)
  const options = useMemo(() => shuffled<CleatChoice>(['roundTurn', 'figure8', 'lock', ...CLEAT_WRONG]), [stepIdx])
  const done = stepIdx >= CLEAT_STEPS.length

  const choose = (c: CleatChoice) => {
    if (done) return
    const want = CLEAT_STEPS[stepIdx]
    const ok = c === want || (want === 'figure8b' && c === 'figure8')
    if (ok) {
      setMsg({ ok: true, key: `rya.kn.cl.ok.${want}` as MessageKey })
      const nextIdx = stepIdx + 1
      setStepIdx(nextIdx)
      if (nextIdx >= CLEAT_STEPS.length) recordStars(`${PREFIX}:cleat`, mistakes === 0 ? 3 : mistakes <= 1 ? 2 : 1)
    } else {
      setMistakes((m) => m + 1)
      setMsg({ ok: false, key: `rya.kn.cl.bad.${c}` as MessageKey })
    }
  }
  const restart = () => {
    setStepIdx(0)
    setMistakes(0)
    setMsg(null)
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_18rem]">
      <div>
        <Panel className="p-0">
          <svg viewBox="0 0 300 200" className="block w-full rounded-xl bg-[#d6c7a8] dark:bg-[#6b5a3e]">
            <path d="M60 100 L240 100" stroke="#475569" strokeWidth="18" strokeLinecap="round" />
            <path d="M70 100 Q150 70 230 100 Q150 130 70 100 Z" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
            <rect x="130" y="88" width="40" height="24" rx="4" fill="#64748b" />
            {/* rope from the load */}
            <path d="M0 170 Q60 150 120 116" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
            {stepIdx > 0 && <path d="M120 116 Q150 140 182 116 Q200 96 170 82 Q140 70 120 86" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />}
            {stepIdx > 1 && <path d="M120 86 Q160 104 214 88 Q238 82 222 110 Q180 120 90 92 Q70 86 84 112" fill="none" stroke="#fbbf24" strokeWidth="7" strokeLinecap="round" />}
            {stepIdx > 2 && <path d="M84 112 Q150 96 214 112 Q238 120 220 90" fill="none" stroke="#fcd34d" strokeWidth="7" strokeLinecap="round" />}
            {stepIdx > 3 && <path d="M220 90 Q200 70 236 84 Q260 96 280 60" fill="none" stroke="#fde68a" strokeWidth="7" strokeLinecap="round" />}
            <text x="10" y="190" fontSize="11" fill="#334155">
              {t('rya.kn.cl.load')}
            </text>
          </svg>
        </Panel>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">💡 {t('rya.kn.cl.memo')}</p>
        {msg && (
          <div className="mt-2">
            <Feedback ok={msg.ok}>{t(msg.key)}</Feedback>
          </div>
        )}
        {done && (
          <Panel className="mt-3 text-center">
            <StarsView n={mistakes === 0 ? 3 : mistakes <= 1 ? 2 : 1} size="text-3xl" />
            <p className="mt-1 font-semibold">{t('rya.kn.cl.done')}</p>
            <button type="button" className="btn-primary mt-2" onClick={restart}>
              ↺ {t('rya.retry')}
            </button>
          </Panel>
        )}
      </div>
      <Panel className="self-start">
        <h3 className="text-sm font-semibold">{t('rya.kn.cl.next', { n: Math.min(stepIdx + 1, CLEAT_STEPS.length) })}</h3>
        <div className="mt-2 grid gap-1.5">
          {options.map((c) => (
            <button key={c} type="button" className="btn-secondary text-left" onClick={() => choose(c)} disabled={done}>
              {t(`rya.kn.cl.c.${c}` as MessageKey)}
            </button>
          ))}
        </div>
      </Panel>
    </div>
  )
}
