import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { MessageKey } from '../../i18n/en'
import { useI18n, type Translate } from '../../i18n'
import { QuizRunner } from '../../lib/QuizRunner'
import { shuffled } from '../../lib/random'
import { TopBoat } from '../../map/TopBoat'
import { evaluateTrim, MAX_BOOM, telltales, type TrimState } from './trimModel'

const TABS = ['learn', 'sim', 'practice', 'telltales', 'setup'] as const
type Tab = (typeof TABS)[number]

export function TrimModule() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const req = search.get('tab')
  const tab: Tab = (TABS as readonly string[]).includes(req ?? '') ? (req as Tab) : 'learn'
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/" className="text-sm text-sea-500 hover:underline">
        ← {t('common.home')}
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 dark:text-white">{t('game.trim.title')}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{t('trim.intro')}</p>
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
            {t(`trim.tab.${k}`)}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === 'learn' && <Learn t={t} />}
        {tab === 'sim' && <Simulator t={t} />}
        {tab === 'practice' && <Practice t={t} />}
        {tab === 'telltales' && <TelltaleQuiz t={t} />}
        {tab === 'setup' && <SetupQuiz t={t} />}
      </div>
    </div>
  )
}

function Learn({ t }: { t: Translate }) {
  const cards = ['aw', 'attack', 'telltales', 'controls', 'depower'] as const
  const controls = ['sheet', 'traveller', 'outhaul', 'cunningham', 'vang', 'jibcar'] as const
  return (
    <div className="space-y-4">
      {cards.map((c, i) => (
        <section key={c} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-navy-900/60">
          <h2 className="font-semibold">
            {i + 1}. {t(`trim.learn.${c}.title`)}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(`trim.learn.${c}.text`)}</p>
          {c === 'telltales' && (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {(['luffing', 'good', 'stalled'] as const).map((s) => (
                <figure key={s} className="rounded-lg bg-slate-50 p-2 text-center dark:bg-white/5">
                  <TelltalePanel state={s} t={t} />
                  <figcaption className="mt-1 text-xs">{t(`trim.state.${s}`)}</figcaption>
                </figure>
              ))}
            </div>
          )}
          {c === 'controls' && (
            <ul className="mt-2 space-y-1 text-sm">
              {controls.map((k) => (
                <li key={k}>
                  <strong>{t(`trim.ctl.${k}`)}</strong> – {t(`trim.ctl.${k}.text`)}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}

/** Close-up of the jib luff with a windward (dashed side) and leeward telltale. */
function TelltalePanel({ state, t, leech }: { state: TrimState; t: Translate; leech?: boolean }) {
  const tt = telltales(state)
  const line = (kind: string, y: number, color: string) => {
    switch (kind) {
      case 'stream':
        return <path d={`M60 ${y} q15 -2 30 0 t30 0`} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
      case 'lift':
        return <path d={`M60 ${y} q10 -10 18 -22 q4 -8 -4 -10`} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" className="sg-flutter" />
      case 'flutter':
        return <path d={`M60 ${y} l8 -6 l8 10 l8 -10 l8 10 l8 -6`} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" className="sg-flutter" />
      default:
        return <path d={`M60 ${y} q4 14 2 30`} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
    }
  }
  return (
    <svg viewBox="0 0 180 130" className="mx-auto h-28 w-40" aria-hidden>
      <rect width="180" height="130" rx="8" fill="#f1f5f9" />
      <path d="M55 10 Q70 65 55 120 L160 120 Q150 65 160 10 Z" fill="#ffffff" stroke="#94a3b8" />
      <line x1="55" y1="10" x2="55" y2="120" stroke="#334155" strokeWidth="2" />
      {leech ? (
        <>
          <text x="100" y="22" textAnchor="middle" fontSize="9" fill="#475569">
            {t('trim.leechTell')}
          </text>
          <path d="M160 60 q-6 4 -18 2" stroke="#ef4444" strokeWidth="3" fill="none" className="sg-flutter" />
        </>
      ) : (
        <>
          {line(tt.windward, 48, '#ef4444')}
          {line(tt.leeward, 84, '#16a34a')}
          <text x="10" y="52" fontSize="9" fill="#ef4444">
            {t('trim.windward')}
          </text>
          <text x="10" y="88" fontSize="9" fill="#16a34a">
            {t('trim.leeward')}
          </text>
        </>
      )}
    </svg>
  )
}

function Scene({ twa, boom, awa, t }: { twa: number; boom: number; awa: number; t: Translate }) {
  const heading = -twa
  const C = { x: 180, y: 200 }
  const ar = ((heading + awa) * Math.PI) / 180
  return (
    <svg viewBox="0 0 360 340" className="w-full rounded-2xl" role="img" aria-label={t('trim.tab.sim')}>
      <rect width="360" height="340" fill="#cfe8f5" />
      <g opacity="0.6">
        {[90, 180, 270].map((x) => (
          <g key={x} transform={`translate(${x} 30)`}>
            <line x1="0" y1="-14" x2="0" y2="16" stroke="#0b3a5c" strokeWidth="2" />
            <path d="M-5 10 L0 18 L5 10" fill="none" stroke="#0b3a5c" strokeWidth="2" />
          </g>
        ))}
      </g>
      <text x="350" y="20" textAnchor="end" fontSize="11" fill="#0b3a5c">
        {t('trim.trueWind')} ↓
      </text>
      <line
        x1={C.x + Math.sin(ar) * 110}
        y1={C.y - Math.cos(ar) * 110}
        x2={C.x + Math.sin(ar) * 55}
        y2={C.y - Math.cos(ar) * 55}
        stroke="#0284c7"
        strokeWidth="3"
        markerEnd="url(#tr-arrow)"
      />
      <text x={C.x + Math.sin(ar) * 122} y={C.y - Math.cos(ar) * 122} textAnchor="middle" fontSize="11" fill="#0284c7">
        {t('trim.apparent')}
      </text>
      <TopBoat x={C.x} y={C.y} headingDeg={heading} twa={twa} boomDeg={boom} scale={3.2} sail="#fff7ed" />
      {(() => {
        const dir = twa > 0 ? -1 : 1
        const r = (boom * Math.PI) / 180
        const h = (heading * Math.PI) / 180
        const lx = dir * Math.sin(r) * 19 * 3.2
        const ly = (-5 + Math.cos(r) * 19) * 3.2
        const mx = -5 * 3.2
        const rot = (px: number, py: number) => ({ x: C.x + px * Math.cos(h) - py * Math.sin(h), y: C.y + px * Math.sin(h) + py * Math.cos(h) })
        const a = rot(0, mx)
        const b = rot(lx, ly)
        return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
      })()}
      <defs>
        <marker id="tr-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" fill="#0284c7" />
        </marker>
      </defs>
    </svg>
  )
}

function Slider({ label, value, min, max, onChange, suffix }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; suffix: string }) {
  return (
    <label className="block text-sm">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="font-mono">
          {value}
          {suffix}
        </span>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-sea-500" />
    </label>
  )
}

function Readout({ r, t }: { r: ReturnType<typeof evaluateTrim>; t: Translate }) {
  const tone =
    r.state === 'good' || r.state === 'running'
      ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
      : 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40'
  return (
    <div className={`rounded-lg border p-3 text-sm ${tone}`}>
      <p className="font-semibold">{t(`trim.state.${r.state}`)}</p>
      <p className="mt-1">{t(`trim.tip.${r.state}`)}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
        <dt>AWA</dt>
        <dd>{Math.round(r.awa)}°</dd>
        <dt>AWS</dt>
        <dd>{r.aws.toFixed(1)} kn</dd>
        <dt>{t('trim.attack')}</dt>
        <dd>{Math.round(r.attack)}°</dd>
        <dt>{t('trim.speed')}</dt>
        <dd>
          {r.speedKn.toFixed(1)} / {r.targetKn.toFixed(1)} kn ({Math.round(r.efficiency * 100)}%)
        </dd>
      </dl>
    </div>
  )
}

function Simulator({ t }: { t: Translate }) {
  const [twa, setTwa] = useState(60)
  const [tws, setTws] = useState(12)
  const [boom, setBoom] = useState(20)
  const r = useMemo(() => evaluateTrim(twa, tws, boom), [twa, tws, boom])
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
      <Scene twa={twa} boom={boom} awa={r.awa} t={t} />
      <div className="space-y-4">
        <Slider label={t('trim.twa')} value={twa} min={35} max={180} onChange={setTwa} suffix="°" />
        <Slider label={t('rp.windSpeed')} value={tws} min={4} max={25} onChange={setTws} suffix=" kn" />
        <Slider label={t('trim.sheet')} value={boom} min={0} max={MAX_BOOM} onChange={setBoom} suffix="°" />
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('trim.sheetHelp')}</p>
        <TelltalePanel state={r.state} t={t} />
        <Readout r={r} t={t} />
        {tws > 18 && <p className="rounded-lg bg-rose-50 p-2 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">{t('trim.overpowered')}</p>}
      </div>
    </div>
  )
}

const ROUNDS = 5

function Practice({ t }: { t: Translate }) {
  const newTwa = () => 40 + Math.round(Math.random() * 13) * 10
  const [round, setRound] = useState(0)
  const [twa, setTwa] = useState(newTwa)
  const [boom, setBoom] = useState(45)
  const [checked, setChecked] = useState(false)
  const [total, setTotal] = useState(0)
  const r = evaluateTrim(twa, 12, boom)

  if (round >= ROUNDS) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-navy-900/60">
        <div className="text-5xl font-bold text-navy-900 dark:text-white">{Math.round(total / ROUNDS)}%</div>
        <p className="mt-1 text-sm text-slate-500">{t('trim.avgEfficiency')}</p>
        <button
          type="button"
          className="btn-primary mt-4"
          onClick={() => {
            setRound(0)
            setTotal(0)
            setTwa(newTwa())
            setBoom(45)
            setChecked(false)
          }}
        >
          {t('nm.restart')}
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
      <Scene twa={twa} boom={boom} awa={r.awa} t={t} />
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('trim.practiceIntro')}</p>
        <p className="text-sm font-medium">
          {t('mob.round', { n: round + 1, total: ROUNDS })} · {t('trim.twa')}: {twa}°
        </p>
        <Slider label={t('trim.sheet')} value={boom} min={0} max={MAX_BOOM} onChange={(v) => !checked && setBoom(v)} suffix="°" />
        {!checked ? (
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setChecked(true)
              setTotal((x) => x + Math.round(r.efficiency * 100))
            }}
          >
            ✓ {t('ps.check')}
          </button>
        ) : (
          <>
            <TelltalePanel state={r.state} t={t} />
            <Readout r={r} t={t} />
            <p className="text-xs text-slate-500">{t('trim.optimalWas', { deg: Math.round(r.optimalBoom) })}</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setRound((x) => x + 1)
                setTwa(newTwa())
                setChecked(false)
              }}
            >
              {t('nm.next')} →
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const TELL_ITEMS: { state: TrimState; leech?: boolean; answer: string }[] = [
  { state: 'luffing', answer: 'sheetIn' },
  { state: 'stalled', answer: 'ease' },
  { state: 'good', answer: 'keep' },
  { state: 'stalled', leech: true, answer: 'twist' },
]

function TelltaleQuiz({ t }: { t: Translate }) {
  return (
    <QuizRunner
      bestKey="sg-trim-tell"
      makeItems={() => shuffled([...TELL_ITEMS, ...TELL_ITEMS]).slice(0, 6)}
      picture={(it) => <TelltalePanel state={it.state} leech={it.leech} t={t} />}
      question={() => t('trim.tellQ')}
      options={() => ['sheetIn', 'ease', 'keep', 'twist'].map((a) => ({ value: a, label: t(`trim.act.${a}` as MessageKey) }))}
      answer={(it) => it.answer}
      explanation={(it) => <p>{t(`trim.act.${it.answer}.why` as MessageKey)}</p>}
    />
  )
}

const SETUPS: { id: string; answer: string }[] = [
  { id: 'lightFlat', answer: 'full' },
  { id: 'lightChop', answer: 'powerTwist' },
  { id: 'strong', answer: 'flat' },
  { id: 'gust', answer: 'easeFirst' },
  { id: 'run', answer: 'downwind' },
]

function SetupQuiz({ t }: { t: Translate }) {
  const all = ['full', 'powerTwist', 'flat', 'easeFirst', 'downwind']
  return (
    <QuizRunner
      bestKey="sg-trim-setup"
      makeItems={() => shuffled(SETUPS)}
      question={(s) => t(`trim.cond.${s.id}` as MessageKey)}
      options={(s) => shuffled([s.answer, ...shuffled(all.filter((a) => a !== s.answer)).slice(0, 3)]).map((a) => ({ value: a, label: t(`trim.setup.${a}` as MessageKey) }))}
      answer={(s) => s.answer}
      explanation={(s) => <p>{t(`trim.cond.${s.id}.why` as MessageKey)}</p>}
    />
  )
}
