import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useI18n, type Translate } from '../../i18n'
import { formatDegMin, noonLatitude, reduceSunLL, sextantFor, toDegMin } from './sextantModel'

const TABS = ['learn', 'demo', 'bring', 'read', 'noon'] as const
type Tab = (typeof TABS)[number]

export function SextantModule() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const req = search.get('tab')
  const tab: Tab = (TABS as readonly string[]).includes(req ?? '') ? (req as Tab) : 'learn'
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/" className="text-sm text-sea-500 hover:underline">
        ← {t('common.home')}
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 dark:text-white">{t('game.sextant.title')}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{t('sx.intro')}</p>
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
            {t(`sx.tab.${k}`)}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === 'learn' && <Learn t={t} />}
        {tab === 'demo' && <Demo t={t} />}
        {tab === 'bring' && <BringDown t={t} />}
        {tab === 'read' && <ReadScale t={t} />}
        {tab === 'noon' && <Noon t={t} />}
      </div>
    </div>
  )
}

/* ---------- Learn ---------- */

const PARTS = [
  { k: 'frame', x: 150, y: 150 },
  { k: 'indexArm', x: 120, y: 95 },
  { k: 'indexMirror', x: 120, y: 40 },
  { k: 'horizonMirror', x: 40, y: 120 },
  { k: 'telescope', x: 120, y: 132 },
  { k: 'shades', x: 75, y: 75 },
  { k: 'arc', x: 150, y: 245 },
  { k: 'drum', x: 205, y: 210 },
  { k: 'handle', x: 235, y: 135 },
] as const

function SextantDrawing({ t }: { t: Translate }) {
  return (
    <svg viewBox="0 0 320 300" className="w-full max-w-md" role="img" aria-label={t('sx.parts')}>
      <rect width="320" height="300" rx="12" fill="#f8fafc" />
      <path d="M120 40 L40 235 A170 170 0 0 0 250 235 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
      <path d="M120 40 L60 200 L200 200 Z" fill="#f8fafc" stroke="#94a3b8" />
      <path d="M40 235 A170 170 0 0 0 250 235" fill="none" stroke="#0f172a" strokeWidth="6" />
      {Array.from({ length: 21 }, (_, i) => {
        const a = ((-28 + i * 2.8) * Math.PI) / 180
        const cx = 120 + Math.sin(a) * 195
        const cy = 40 + Math.cos(a) * 195
        return <line key={i} x1={cx} y1={cy} x2={120 + Math.sin(a) * 186} y2={40 + Math.cos(a) * 186} stroke="#f8fafc" strokeWidth="1" />
      })}
      <line x1="120" y1="40" x2="200" y2="228" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" />
      <circle cx="205" cy="225" r="12" fill="#1d4ed8" stroke="#fff" strokeWidth="2" />
      <rect x="108" y="30" width="24" height="12" fill="#93c5fd" stroke="#1e3a8a" />
      <rect x="36" y="112" width="12" height="26" fill="#93c5fd" stroke="#1e3a8a" />
      <rect x="70" y="120" width="90" height="12" rx="4" fill="#334155" />
      <rect x="66" y="68" width="18" height="8" fill="#a16207" />
      <rect x="66" y="80" width="18" height="8" fill="#ca8a04" />
      <path d="M225 110 q30 20 10 70" fill="none" stroke="#78350f" strokeWidth="10" strokeLinecap="round" />
      {PARTS.map((p, i) => (
        <g key={p.k}>
          <circle cx={p.x} cy={p.y} r="9" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
          <text x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  )
}

function Learn({ t }: { t: Translate }) {
  const steps = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'] as const
  return (
    <div className="space-y-6">
      <section className="grid items-start gap-6 md:grid-cols-2">
        <SextantDrawing t={t} />
        <ol className="space-y-1 text-sm">
          {PARTS.map((p, i) => (
            <li key={p.k}>
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">{i + 1}</span>
              <strong>{t(`sx.part.${p.k}`)}</strong> – {t(`sx.part.${p.k}.text`)}
            </li>
          ))}
        </ol>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-navy-900/60">
        <h2 className="font-semibold">{t('sx.howTitle')}</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {steps.map((s) => (
            <li key={s}>{t(`sx.how.${s}`)}</li>
          ))}
        </ol>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-navy-900/60">
        <h2 className="font-semibold">{t('sx.corrTitle')}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('sx.corrText')}</p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs dark:bg-white/5">{t('sx.corrFormula')}</pre>
        <h3 className="mt-4 font-semibold">{t('sx.noonTitle')}</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('sx.noonText')}</p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs dark:bg-white/5">{t('sx.noonFormula')}</pre>
      </section>
      <p className="text-xs text-slate-500 dark:text-slate-400">{t('sx.disclaimer')}</p>
    </div>
  )
}

/* ---------- Telescope view ---------- */

const PX_PER_MIN = 2
const VIEW = 300

/** View through the telescope: horizon in the middle, reflected sun placed by the reading error. */
function Telescope({ errMin, rock, t }: { errMin: number; rock: number; t: Translate }) {
  const swing = Math.sin(rock) * 70
  const lift = (1 - Math.cos(rock)) * 18
  const cy = VIEW / 2 - (errMin + 16) * PX_PER_MIN - lift
  const cx = VIEW / 2 + swing
  const visible = Math.abs(errMin) < 75
  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="h-72 w-72" role="img" aria-label={t('sx.view')}>
      <defs>
        <clipPath id="sx-clip">
          <circle cx={VIEW / 2} cy={VIEW / 2} r={VIEW / 2 - 4} />
        </clipPath>
        <linearGradient id="sx-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="0.5" stopColor="#bae6fd" />
          <stop offset="0.5" stopColor="#1e3a8a" />
          <stop offset="1" stopColor="#0b3a5c" />
        </linearGradient>
      </defs>
      <g clipPath="url(#sx-clip)">
        <rect width={VIEW} height={VIEW} fill="url(#sx-sky)" />
        <rect x={VIEW / 2} width={VIEW / 2} height={VIEW} fill="#0f172a" opacity="0.12" />
        {visible && (
          <g>
            <circle cx={cx} cy={cy} r={16 * PX_PER_MIN} fill="#fb923c" opacity="0.95" />
            <circle cx={cx} cy={cy} r={16 * PX_PER_MIN + 6} fill="#fdba74" opacity="0.25" />
          </g>
        )}
        <line x1="0" y1={VIEW / 2} x2={VIEW} y2={VIEW / 2} stroke="#e2e8f0" strokeWidth="1" opacity="0.6" />
      </g>
      <circle cx={VIEW / 2} cy={VIEW / 2} r={VIEW / 2 - 4} fill="none" stroke="#0f172a" strokeWidth="8" />
      {!visible && (
        <text x={VIEW / 2} y={VIEW / 2 - 20} textAnchor="middle" fontSize="13" fill="#fff">
          {errMin > 0 ? t('sx.sunAbove') : t('sx.sunBelow')}
        </text>
      )}
    </svg>
  )
}

function useRock(active: boolean): number {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      setPhase(Math.sin(((now - t0) / 1000) * 2.2) * 1.1)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      setPhase(0)
    }
  }, [active])
  return phase
}

function ArmControls({ deg, min, setDeg, setMin, t }: { deg: number; min: number; setDeg: (v: number) => void; setMin: (v: number) => void; t: Translate }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="flex justify-between">
          <span>{t('sx.indexArm')}</span>
          <span className="font-mono">{deg}°</span>
        </span>
        <input type="range" min={0} max={90} value={deg} onChange={(e) => setDeg(Number(e.target.value))} className="w-full accent-sea-500" />
      </label>
      <label className="block text-sm">
        <span className="flex justify-between">
          <span>{t('sx.drum')}</span>
          <span className="font-mono">{min.toFixed(1)}′</span>
        </span>
        <input type="range" min={0} max={59.9} step={0.1} value={min} onChange={(e) => setMin(Number(e.target.value))} className="w-full accent-sea-500" />
      </label>
      <p className="font-mono text-lg">
        {t('sx.reading')}: {deg}° {min.toFixed(1)}′
      </p>
    </div>
  )
}

function Demo({ t }: { t: Translate }) {
  const target = 38 + 24.6 / 60
  const [deg, setDeg] = useState(20)
  const [min, setMin] = useState(0)
  const [rocking, setRocking] = useState(false)
  const rock = useRock(rocking)
  const err = (target - (deg + min / 60)) * 60
  return (
    <div className="grid gap-6 md:grid-cols-[18rem_1fr]">
      <Telescope errMin={err} rock={rock} t={t} />
      <div className="space-y-4">
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>{t('sx.demo.1')}</li>
          <li>{t('sx.demo.2')}</li>
          <li>{t('sx.demo.3')}</li>
          <li>{t('sx.demo.4')}</li>
        </ol>
        <ArmControls deg={deg} min={min} setDeg={setDeg} setMin={setMin} t={t} />
        <button type="button" className="btn-secondary" onMouseDown={() => setRocking(true)} onMouseUp={() => setRocking(false)} onMouseLeave={() => setRocking(false)} onTouchStart={() => setRocking(true)} onTouchEnd={() => setRocking(false)}>
          ↔ {t('sx.rock')}
        </button>
        {Math.abs(err) < 1 && <p className="rounded-lg bg-emerald-50 p-2 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">{t('sx.demo.done', { reading: formatDegMin(target, '', '') })}</p>}
      </div>
    </div>
  )
}

/* ---------- Practice: bring the sun down ---------- */

const ROUNDS = 5
const newAltitude = () => 15 + Math.random() * 55

function BringDown({ t }: { t: Translate }) {
  const [round, setRound] = useState(0)
  const [target, setTarget] = useState(newAltitude)
  const [deg, setDeg] = useState(10)
  const [min, setMin] = useState(0)
  const [rocking, setRocking] = useState(false)
  const rock = useRock(rocking)
  const [result, setResult] = useState<number | null>(null)
  const [total, setTotal] = useState(0)
  const err = (target - (deg + min / 60)) * 60

  if (round >= ROUNDS) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-navy-900/60">
        <div className="text-5xl font-bold text-navy-900 dark:text-white">{(total / ROUNDS).toFixed(1)}′</div>
        <p className="mt-1 text-sm text-slate-500">{t('sx.avgError')}</p>
        <button
          type="button"
          className="btn-primary mt-4"
          onClick={() => {
            setRound(0)
            setTotal(0)
            setTarget(newAltitude())
            setResult(null)
          }}
        >
          {t('nm.restart')}
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-[18rem_1fr]">
      <Telescope errMin={err} rock={rock} t={t} />
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('sx.bringIntro')}</p>
        <p className="text-sm font-medium">{t('mob.round', { n: round + 1, total: ROUNDS })}</p>
        <ArmControls deg={deg} min={min} setDeg={(v) => result === null && setDeg(v)} setMin={(v) => result === null && setMin(v)} t={t} />
        <button type="button" className="btn-secondary" onMouseDown={() => setRocking(true)} onMouseUp={() => setRocking(false)} onMouseLeave={() => setRocking(false)} onTouchStart={() => setRocking(true)} onTouchEnd={() => setRocking(false)}>
          ↔ {t('sx.rock')}
        </button>
        {result === null ? (
          <button
            type="button"
            className="btn-primary ml-2"
            onClick={() => {
              const e = Math.abs(err)
              setResult(e)
              setTotal((x) => x + e)
            }}
          >
            📸 {t('sx.takeSight')}
          </button>
        ) : (
          <div className={`rounded-lg border p-3 text-sm ${result <= 1 ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40' : result <= 3 ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/40' : 'border-rose-300 bg-rose-50 dark:bg-rose-950/40'}`}>
            <p className="font-semibold">{t('sx.error', { e: result.toFixed(1) })}</p>
            <p>{t('sx.trueWas', { reading: formatDegMin(target, '', '') })}</p>
            <button
              type="button"
              className="btn-primary mt-2"
              onClick={() => {
                setRound((x) => x + 1)
                setTarget(newAltitude())
                setResult(null)
              }}
            >
              {t('nm.next')} →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Practice: read the scale ---------- */

function ScaleDrawing({ deg, min }: { deg: number; min: number }) {
  return (
    <svg viewBox="0 0 360 230" className="w-full max-w-md rounded-2xl" aria-hidden>
      <rect width="360" height="230" fill="#f8fafc" />
      <rect x="10" y="20" width="340" height="60" fill="#e2e8f0" stroke="#64748b" />
      {Array.from({ length: 11 }, (_, i) => {
        const d = deg - 5 + i
        const x = 180 + (d - deg) * 30
        return (
          <g key={i}>
            <line x1={x} y1="20" x2={x} y2={i % 5 === 0 ? 50 : 42} stroke="#0f172a" strokeWidth="1.5" />
            <text x={x} y="68" textAnchor="middle" fontSize="12" fill="#0f172a">
              {d}
            </text>
          </g>
        )
      })}
      <path d={`M${180 + (min / 60) * 30} 82 l-7 14 h14 z`} fill="#1d4ed8" />
      <line x1={180 + (min / 60) * 30} y1="20" x2={180 + (min / 60) * 30} y2="84" stroke="#1d4ed8" strokeWidth="2" />
      <g transform="translate(180 160)">
        <circle r="56" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
        {Array.from({ length: 60 }, (_, i) => {
          const a = ((i * 6 - min * 6) * Math.PI) / 180
          const r1 = i % 10 === 0 ? 40 : i % 5 === 0 ? 45 : 49
          return (
            <g key={i}>
              <line x1={Math.sin(a) * r1} y1={-Math.cos(a) * r1} x2={Math.sin(a) * 55} y2={-Math.cos(a) * 55} stroke="#0f172a" strokeWidth={i % 10 === 0 ? 1.8 : 1} />
              {i % 10 === 0 && (
                <text x={Math.sin(a) * 30} y={-Math.cos(a) * 30 + 4} textAnchor="middle" fontSize="10" fill="#0f172a">
                  {i}
                </text>
              )}
            </g>
          )
        })}
        <path d="M0 -60 l-6 -10 h12 z" fill="#ef4444" />
      </g>
    </svg>
  )
}

function ReadScale({ t }: { t: Translate }) {
  const make = () => ({ deg: 10 + Math.floor(Math.random() * 70), min: Math.round(Math.random() * 119) / 2 })
  const [q, setQ] = useState(make)
  const [d, setD] = useState('')
  const [m, setM] = useState('')
  const [checked, setChecked] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [n, setN] = useState(0)
  const check = () => {
    const ok = Number(d) === q.deg && Math.abs(Number(m) - q.min) <= 0.5
    setChecked(ok)
    setN((x) => x + 1)
    if (ok) setScore((s) => s + 1)
  }
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ScaleDrawing deg={q.deg} min={q.min} />
      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('sx.readIntro')}</p>
        <p className="text-sm text-slate-500">
          {score}/{n}
        </p>
        <div className="flex items-center gap-2">
          <input aria-label={t('sx.degrees')} className="w-20 rounded border border-slate-300 bg-white px-2 py-1 font-mono dark:border-white/20 dark:bg-navy-900" value={d} onChange={(e) => setD(e.target.value)} inputMode="numeric" />
          <span>°</span>
          <input aria-label={t('sx.minutes')} className="w-24 rounded border border-slate-300 bg-white px-2 py-1 font-mono dark:border-white/20 dark:bg-navy-900" value={m} onChange={(e) => setM(e.target.value.replace(',', '.'))} inputMode="decimal" />
          <span>′</span>
        </div>
        {checked === null ? (
          <button type="button" className="btn-primary" onClick={check} disabled={!d || !m}>
            ✓ {t('ps.check')}
          </button>
        ) : (
          <div className={`rounded-lg border p-3 text-sm ${checked ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40' : 'border-rose-300 bg-rose-50 dark:bg-rose-950/40'}`}>
            <p className="font-semibold">{checked ? t('nm.correct') : t('sx.readWas', { reading: `${q.deg}° ${q.min.toFixed(1)}′` })}</p>
            <p className="mt-1">{t('sx.readTip')}</p>
            <button
              type="button"
              className="btn-primary mt-2"
              onClick={() => {
                setQ(make())
                setD('')
                setM('')
                setChecked(null)
              }}
            >
              {t('nm.next')} →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Practice: noon sight ---------- */

function makeNoon() {
  const lat = 30 + Math.random() * 25
  const dec = -20 + Math.random() * 40
  const ho = 90 - (lat - dec)
  const ie = Math.round((Math.random() * 6 - 3) * 10) / 10
  const eye = 2 + Math.round(Math.random() * 4)
  const hs = sextantFor(ho, ie, eye)
  const hsDM = toDegMin(hs)
  const hsRounded = hsDM.d + hsDM.m / 60
  const decDM = toDegMin(dec)
  const decRounded = decDM.sign * (decDM.d + decDM.m / 60)
  return { hs: hsRounded, ie, eye, dec: decRounded }
}

function Noon({ t }: { t: Translate }) {
  const [q, setQ] = useState(makeNoon)
  const [d, setD] = useState('')
  const [m, setM] = useState('')
  const [checked, setChecked] = useState<boolean | null>(null)
  const red = useMemo(() => reduceSunLL(q.hs, q.ie, q.eye), [q])
  const lat = noonLatitude(red.ho, q.dec, 'S')
  const check = () => {
    const answer = Number(d) + Number(m) / 60
    setChecked(Math.abs(answer - lat) * 60 <= 2)
  }
  const fmt = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}′`
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm dark:border-white/10 dark:bg-navy-900/60">
        <p>{t('sx.noonIntro')}</p>
        <dl className="mt-3 grid grid-cols-2 gap-y-1 font-mono">
          <dt>Hs ☉</dt>
          <dd>{formatDegMin(q.hs, '', '')}</dd>
          <dt>{t('sx.ie')}</dt>
          <dd>
            {Math.abs(q.ie).toFixed(1)}′ {q.ie >= 0 ? t('sx.onArc') : t('sx.offArc')}
          </dd>
          <dt>{t('sx.eye')}</dt>
          <dd>{q.eye} m</dd>
          <dt>Dec</dt>
          <dd>{formatDegMin(q.dec)}</dd>
          <dt>{t('sx.sunBearing')}</dt>
          <dd>{t('sx.south')}</dd>
        </dl>
      </section>
      <div className="space-y-3">
        <p className="text-sm font-medium">{t('sx.yourLatitude')}</p>
        <div className="flex items-center gap-2">
          <input aria-label={t('sx.degrees')} className="w-20 rounded border border-slate-300 bg-white px-2 py-1 font-mono dark:border-white/20 dark:bg-navy-900" value={d} onChange={(e) => setD(e.target.value)} inputMode="numeric" />
          <span>°</span>
          <input aria-label={t('sx.minutes')} className="w-24 rounded border border-slate-300 bg-white px-2 py-1 font-mono dark:border-white/20 dark:bg-navy-900" value={m} onChange={(e) => setM(e.target.value.replace(',', '.'))} inputMode="decimal" />
          <span>′ N</span>
        </div>
        {checked === null ? (
          <div className="flex gap-2">
            <button type="button" className="btn-primary" onClick={check} disabled={!d || !m}>
              ✓ {t('ps.check')}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setChecked(false)}>
              {t('sx.showSolution')}
            </button>
          </div>
        ) : (
          <div className={`rounded-lg border p-3 text-sm ${checked ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40' : 'border-amber-300 bg-amber-50 dark:bg-amber-950/40'}`}>
            <p className="font-semibold">{checked ? t('nm.correct') : t('sx.solution')}</p>
            <table className="mt-2 w-full font-mono text-xs">
              <tbody>
                <tr><td>Hs</td><td className="text-right">{formatDegMin(q.hs, '', '')}</td></tr>
                <tr><td>{t('sx.ic')}</td><td className="text-right">{fmt(red.icMin)}</td></tr>
                <tr><td>{t('sx.dip')}</td><td className="text-right">{fmt(-red.dipMin)}</td></tr>
                <tr className="border-t border-slate-300"><td>Ha</td><td className="text-right">{formatDegMin(red.ha, '', '')}</td></tr>
                <tr><td>{t('sx.refr')}</td><td className="text-right">{fmt(-red.refrMin)}</td></tr>
                <tr><td>{t('sx.sd')}</td><td className="text-right">{fmt(red.sdMin)}</td></tr>
                <tr className="border-t border-slate-300"><td>Ho</td><td className="text-right">{formatDegMin(red.ho, '', '')}</td></tr>
                <tr><td>ZD = 90° − Ho</td><td className="text-right">{formatDegMin(90 - red.ho, '', '')}</td></tr>
                <tr><td>Dec</td><td className="text-right">{formatDegMin(q.dec)}</td></tr>
                <tr className="border-t border-slate-300 font-bold"><td>Lat = ZD + Dec</td><td className="text-right">{formatDegMin(lat)}</td></tr>
              </tbody>
            </table>
            <button
              type="button"
              className="btn-primary mt-3"
              onClick={() => {
                setQ(makeNoon())
                setD('')
                setM('')
                setChecked(null)
              }}
            >
              {t('nm.next')} →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
