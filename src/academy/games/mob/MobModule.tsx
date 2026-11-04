import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { norm180 } from '../../core/units'
import type { MessageKey } from '../../i18n/en'
import { useI18n, type Translate } from '../../i18n'
import { QuizRunner } from '../../lib/QuizRunner'
import { shuffled } from '../../lib/random'
import { TopBoat } from '../../map/TopBoat'
import { approachQuality, firstActions, maneuvers, pathLengths, samplePath, type Maneuver, type P } from './maneuvers'

const TABS = ['demo', 'order', 'approach', 'quiz'] as const
type Tab = (typeof TABS)[number]

export function MobModule() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const req = search.get('tab')
  const tab: Tab = (TABS as readonly string[]).includes(req ?? '') ? (req as Tab) : 'demo'
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/" className="text-sm text-sea-500 hover:underline">
        ← {t('common.home')}
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 dark:text-white">{t('game.mob.title')}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{t('mob.intro')}</p>
      <div className="mt-6 flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 dark:bg-white/5" role="tablist">
        {TABS.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setSearch({ tab: k }, { replace: true })}
            className={`rounded-md px-4 py-1.5 text-sm font-medium ${tab === k ? 'bg-white shadow dark:bg-navy-700' : 'text-slate-500 dark:text-slate-400'}`}
          >
            {t(`mob.tab.${k}`)}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === 'demo' && <Demo t={t} />}
        {tab === 'order' && <OrderPractice t={t} />}
        {tab === 'approach' && <ApproachPractice t={t} />}
        {tab === 'quiz' && <MobQuiz t={t} />}
      </div>
      <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">{t('mob.disclaimer')}</p>
    </div>
  )
}

function smoothPath(pts: P[]): string {
  if (pts.length < 2) return ''
  let d = `M${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    d += ` C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x} ${p2.y}`
  }
  return d
}

function WindArrows({ windFrom = 0, w = 420 }: { windFrom?: number; w?: number }) {
  return (
    <g opacity="0.55">
      {[0.2, 0.5, 0.8].map((f) => (
        <g key={f} transform={`translate(${w * f} 40) rotate(${windFrom})`}>
          <line x1="0" y1="-18" x2="0" y2="14" stroke="#0b3a5c" strokeWidth="2" />
          <path d="M-5 8 L0 16 L5 8" fill="none" stroke="#0b3a5c" strokeWidth="2" />
        </g>
      ))}
    </g>
  )
}

function MobMarker({ at, label }: { at: P; label: string }) {
  return (
    <g transform={`translate(${at.x} ${at.y})`}>
      <circle r="9" fill="none" stroke="#f97316" strokeWidth="3" />
      <circle r="4" fill="#fde68a" stroke="#7c2d12" />
      <text y="-14" textAnchor="middle" fontSize="10" fontWeight="700" fill="#c2410c">
        {label}
      </text>
    </g>
  )
}

const DURATION_S = 20

function Demo({ t }: { t: Translate }) {
  const [id, setId] = useState<Maneuver['id']>('quickStop')
  const m = maneuvers.find((x) => x.id === id)!
  const [f, setF] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setF((x) => {
        const n = x + dt / DURATION_S
        if (n >= 1) {
          setPlaying(false)
          return 1
        }
        return n
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const lens = useMemo(() => pathLengths(m.path), [m])
  const total = lens[lens.length - 1]
  const s = samplePath(m.path, f)
  const mobVisible = f * total >= lens[m.mobAt] - 0.5
  const currentStep = [...m.steps].reverse().find((st) => f * total >= lens[st.at] - 0.5) ?? m.steps[0]
  const travelled = m.path.slice(0, s.index + 1).concat([s.pos])

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {maneuvers.map((x) => (
          <button
            key={x.id}
            type="button"
            className={x.id === id ? 'btn-primary' : 'btn-secondary'}
            onClick={() => {
              setId(x.id)
              setF(0)
              setPlaying(false)
            }}
          >
            {t(`mob.m.${x.id}`)}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t(`mob.m.${m.id}.desc` as MessageKey)}</p>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div>
          <svg viewBox="0 0 420 340" className="w-full rounded-2xl" role="img" aria-label={t(`mob.m.${m.id}`)}>
            <rect width="420" height="340" fill="#cfe8f5" />
            <WindArrows />
            <text x="410" y="20" textAnchor="end" fontSize="11" fill="#0b3a5c">
              {t('rp.wind')} ↓
            </text>
            <path d={smoothPath(m.path)} fill="none" stroke="#0b3a5c" strokeWidth="1.5" strokeDasharray="4 5" opacity="0.4" />
            <path d={smoothPath(travelled)} fill="none" stroke="#0b3a5c" strokeWidth="2.5" opacity="0.8" />
            {m.steps.map((st, i) => (
              <g key={st.key} transform={`translate(${m.path[st.at].x} ${m.path[st.at].y})`}>
                <circle r="8" fill={st === currentStep ? '#f59e0b' : '#fff'} stroke="#0b3a5c" />
                <text y="3.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0b3a5c">
                  {i + 1}
                </text>
              </g>
            ))}
            {mobVisible && <MobMarker at={m.mob} label="MOB" />}
            <TopBoat x={s.pos.x} y={s.pos.y} headingDeg={s.heading} twa={norm180(0 - s.heading)} scale={0.9} />
          </svg>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                if (f >= 1) setF(0)
                setPlaying((x) => !x)
              }}
            >
              {playing ? `⏸ ${t('mob.pause')}` : `▶ ${t('mob.play')}`}
            </button>
            <input
              type="range"
              min={0}
              max={1000}
              value={Math.round(f * 1000)}
              onChange={(e) => {
                setPlaying(false)
                setF(Number(e.target.value) / 1000)
              }}
              className="w-full accent-sea-500"
              aria-label={t('mob.timeline')}
            />
          </div>
        </div>
        <ol className="space-y-2">
          {m.steps.map((st, i) => (
            <li
              key={st.key}
              className={`rounded-lg border p-2 text-sm ${
                st === currentStep
                  ? 'border-amber-400 bg-amber-50 font-medium dark:border-amber-700 dark:bg-amber-950/40'
                  : 'border-slate-200 bg-white dark:border-white/10 dark:bg-navy-900/60'
              }`}
            >
              <span className="mr-1 font-mono text-xs text-slate-400">{i + 1}.</span>
              {t(`mob.step.${st.key}` as MessageKey)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

/* ---------- Order the steps ---------- */

function OrderPractice({ t }: { t: Translate }) {
  const sets: { id: string; keys: string[] }[] = [
    { id: 'firstActions', keys: firstActions },
    ...maneuvers.map((m) => ({ id: m.id, keys: m.steps.map((s) => s.key) })),
  ]
  const [setId, setSetId] = useState(sets[0].id)
  const keys = sets.find((s) => s.id === setId)!.keys
  const [deck, setDeck] = useState(() => shuffled(keys))
  const [done, setDone] = useState<string[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [flash, setFlash] = useState<string | null>(null)

  const start = (id: string) => {
    const k = sets.find((s) => s.id === id)!.keys
    setSetId(id)
    setDeck(shuffled(k))
    setDone([])
    setMistakes(0)
  }

  const pick = (k: string) => {
    if (keys[done.length] === k) setDone((d) => [...d, k])
    else {
      setMistakes((m) => m + 1)
      setFlash(k)
      setTimeout(() => setFlash(null), 500)
    }
  }
  const finished = done.length === keys.length

  return (
    <div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{t('mob.orderIntro')}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {sets.map((s) => (
          <button key={s.id} type="button" className={s.id === setId ? 'btn-primary' : 'btn-secondary'} onClick={() => start(s.id)}>
            {s.id === 'firstActions' ? t('mob.firstActions') : t(`mob.m.${s.id}` as MessageKey)}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <section>
          <h3 className="text-sm font-semibold">{t('mob.yourOrder')}</h3>
          <ol className="mt-2 space-y-2">
            {done.map((k, i) => (
              <li key={k} className="rounded-lg border border-emerald-300 bg-emerald-50 p-2 text-sm dark:border-emerald-800 dark:bg-emerald-950/40">
                <span className="mr-1 font-mono text-xs">{i + 1}.</span>
                {t(`mob.step.${k}` as MessageKey)}
              </li>
            ))}
          </ol>
          {finished && (
            <div className="mt-3 rounded-lg bg-sea-100 p-3 text-sm dark:bg-navy-900">
              <p className="font-semibold">{mistakes === 0 ? t('mob.perfectOrder') : t('mob.mistakes', { n: mistakes })}</p>
              <button type="button" className="btn-primary mt-2" onClick={() => start(setId)}>
                {t('nm.restart')}
              </button>
            </div>
          )}
        </section>
        <section>
          <h3 className="text-sm font-semibold">{t('mob.pickNext')}</h3>
          <div className="mt-2 space-y-2">
            {deck
              .filter((k) => !done.includes(k))
              .map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => pick(k)}
                  className={`block w-full rounded-lg border p-2 text-left text-sm transition ${
                    flash === k ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50' : 'border-slate-200 bg-white hover:border-sea-500 dark:border-white/10 dark:bg-navy-900/60'
                  }`}
                >
                  {t(`mob.step.${k}` as MessageKey)}
                </button>
              ))}
          </div>
          {!finished && <p className="mt-2 text-xs text-slate-500">{t('mob.mistakes', { n: mistakes })}</p>}
        </section>
      </div>
    </div>
  )
}

/* ---------- Approach angle ---------- */

const ROUNDS = 5

function ApproachPractice({ t }: { t: Translate }) {
  const [round, setRound] = useState(0)
  const [windFrom, setWindFrom] = useState(() => Math.round(Math.random() * 36) * 10)
  const [heading, setHeading] = useState(() => (windFrom + 180) % 360)
  const [checked, setChecked] = useState<ReturnType<typeof approachQuality> | null>(null)
  const [points, setPoints] = useState(0)

  const twa = norm180(windFrom - heading)
  const C = { x: 170, y: 170 }
  const r = (heading * Math.PI) / 180
  const boat = { x: C.x - Math.sin(r) * 85, y: C.y + Math.cos(r) * 85 }
  const wr = (windFrom * Math.PI) / 180

  const check = () => {
    const q = approachQuality(Math.abs(twa))
    setChecked(q)
    setPoints((p) => p + (q === 'good' ? 2 : q === 'beam' ? 1 : 0))
  }
  const next = () => {
    const w = Math.round(Math.random() * 36) * 10
    setWindFrom(w)
    setHeading((w + 180) % 360)
    setChecked(null)
    setRound((x) => x + 1)
  }
  const arc = (from: number, to: number) => {
    const a = ((from - 90) * Math.PI) / 180
    const b = ((to - 90) * Math.PI) / 180
    const R = 130
    return `M${C.x} ${C.y} L${C.x + Math.cos(a) * R} ${C.y + Math.sin(a) * R} A${R} ${R} 0 0 1 ${C.x + Math.cos(b) * R} ${C.y + Math.sin(b) * R} Z`
  }
  // The boat comes FROM the side opposite its heading: good headings are windFrom ± 40..80°,
  // so the good approach sectors around the person lie at windFrom + 100..140° and + 220..260°.
  const goodSectors = [
    [windFrom + 100, windFrom + 140],
    [windFrom + 220, windFrom + 260],
  ]

  if (round >= ROUNDS) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-navy-900/60">
        <div className="text-5xl font-bold text-navy-900 dark:text-white">
          {points}/{ROUNDS * 2}
        </div>
        <button
          type="button"
          className="btn-primary mt-4"
          onClick={() => {
            setRound(0)
            setPoints(0)
            next()
            setRound(0)
          }}
        >
          {t('nm.restart')}
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-[22rem_1fr]">
      <svg viewBox="0 0 340 340" className="w-full rounded-2xl" role="img" aria-label={t('mob.tab.approach')}>
        <rect width="340" height="340" fill="#cfe8f5" />
        {checked &&
          goodSectors.map(([a, b], i) => <path key={i} d={arc(a, b)} fill="rgba(31,154,77,0.18)" stroke="rgba(31,154,77,0.5)" />)}
        <g transform="translate(300 40)">
          <circle r="28" fill="rgba(255,255,255,0.85)" stroke="#94a3b8" />
          <line x1={Math.sin(wr) * 24} y1={-Math.cos(wr) * 24} x2={-Math.sin(wr) * 14} y2={Math.cos(wr) * 14} stroke="#0b3a5c" strokeWidth="3" />
          <circle cx={-Math.sin(wr) * 16} cy={Math.cos(wr) * 16} r="3.5" fill="#0b3a5c" />
          <text y="42" textAnchor="middle" fontSize="11" fill="#0b3a5c">
            {t('rp.wind')} {windFrom}°
          </text>
        </g>
        <line x1={boat.x} y1={boat.y} x2={C.x} y2={C.y} stroke="#0b3a5c" strokeDasharray="4 4" />
        <MobMarker at={C} label="MOB" />
        <TopBoat x={boat.x} y={boat.y} headingDeg={heading} twa={twa} scale={1.2} />
      </svg>
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('mob.approachIntro')}</p>
        <p className="mt-2 text-sm text-slate-500">
          {t('mob.round', { n: round + 1, total: ROUNDS })} · {points} pt
        </p>
        <label className="mt-4 block text-sm">
          <span className="flex justify-between">
            <span>{t('mob.approachHeading')}</span>
            <span className="font-mono">
              {heading}° · TWA {Math.abs(Math.round(twa))}°
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={359}
            value={heading}
            disabled={!!checked}
            onChange={(e) => setHeading(Number(e.target.value))}
            className="w-full accent-sea-500"
          />
        </label>
        {!checked ? (
          <button type="button" className="btn-primary mt-3" onClick={check}>
            ✓ {t('ps.check')}
          </button>
        ) : (
          <div
            className={`mt-3 rounded-lg border p-3 text-sm ${
              checked === 'good'
                ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
                : 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40'
            }`}
          >
            <p className="font-semibold">{t(`mob.aq.${checked}`)}</p>
            <p className="mt-1">{t('mob.aqTip')}</p>
            <button type="button" className="btn-primary mt-3" onClick={next}>
              {t('nm.next')} →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Knowledge quiz ---------- */

const QUESTIONS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8']

function MobQuiz({ t }: { t: Translate }) {
  return (
    <QuizRunner
      bestKey="sg-mob-quiz"
      makeItems={() => shuffled(QUESTIONS)}
      question={(q) => t(`mob.${q}` as MessageKey)}
      options={(q) => shuffled(['o1', 'o2', 'o3', 'o4']).map((o) => ({ value: o, label: t(`mob.${q}.${o}` as MessageKey) }))}
      answer={() => 'o1'}
      explanation={(q) => <p>{t(`mob.${q}.why` as MessageKey)}</p>}
    />
  )
}
