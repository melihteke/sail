import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { TopBoat } from '../../map/TopBoat'
import { norm180 } from '../../core/units'
import type { MessageKey } from '../../i18n/en'
import { useI18n, type Translate } from '../../i18n'
import { hornSymbols, playHorn } from '../../lib/horn'
import { QuizRunner } from '../../lib/QuizRunner'
import { shuffled, withDistractors } from '../../lib/random'
import { dayShapes, lightPictures, rowScenarios, soundSignals, type LightColour, type RowScenario, type Shape, type VesselKind } from './data'

const TABS = ['learn', 'row', 'lights', 'shapes', 'sounds'] as const
type Tab = (typeof TABS)[number]

export function ColregModule() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const req = search.get('tab')
  const tab: Tab = (TABS as readonly string[]).includes(req ?? '') ? (req as Tab) : 'learn'
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/" className="text-sm text-sea-500 hover:underline">
        ← {t('common.home')}
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 dark:text-white">{t('game.colreg.title')}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{t('cr.intro')}</p>
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
            {t(`cr.tab.${k}`)}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === 'learn' && <Learn t={t} />}
        {tab === 'row' && <RightOfWay t={t} />}
        {tab === 'lights' && <LightsQuiz t={t} />}
        {tab === 'shapes' && <ShapesQuiz t={t} />}
        {tab === 'sounds' && <SoundsQuiz t={t} />}
      </div>
    </div>
  )
}

const LADDER = ['nuc', 'ram', 'cbd', 'fishing', 'sail', 'power'] as const

function Learn({ t }: { t: Translate }) {
  const rules = ['r5', 'r7', 'r8', 'r9', 'r10', 'r12', 'r13', 'r14', 'r15', 'r17', 'r19'] as const
  return (
    <div className="grid gap-6 md:grid-cols-[18rem_1fr]">
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-navy-900/60">
        <h2 className="font-semibold">{t('cr.ladder.title')}</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('cr.ladder.desc')}</p>
        <ol className="mt-3 space-y-1">
          {LADDER.map((k, i) => (
            <li key={k} className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-white/5" style={{ marginLeft: i * 6 }}>
              <span className="font-mono text-xs text-slate-400">{i + 1}</span>
              {t(`cr.ladder.${k}`)}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{t('cr.ladder.note')}</p>
      </section>
      <section className="space-y-3">
        {rules.map((r) => (
          <div key={r} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-navy-900/60">
            <h3 className="font-semibold">{t(`cr.learn.${r}.title`)}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(`cr.learn.${r}.text`)}</p>
          </div>
        ))}
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('cr.disclaimer')}</p>
      </section>
    </div>
  )
}

/* ---------- Right of way ---------- */

const W = 400
const OWN = { x: 200, y: 320 }

function Shapes({ x, y, shapes, size = 7 }: { x: number; y: number; shapes: Shape[]; size?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="0" y1={-size} x2="0" y2={shapes.length * size * 2.4} stroke="#334155" strokeWidth="1" />
      {shapes.map((s, i) => {
        const cy = i * size * 2.4
        switch (s) {
          case 'ball':
            return <circle key={i} cx="0" cy={cy} r={size * 0.8} fill="#111827" />
          case 'diamond':
            return <path key={i} d={`M0 ${cy - size} L${size * 0.8} ${cy} L0 ${cy + size} L${-size * 0.8} ${cy} Z`} fill="#111827" />
          case 'cylinder':
            return <rect key={i} x={-size * 0.6} y={cy - size} width={size * 1.2} height={size * 2} fill="#111827" />
          case 'coneDown':
            return <path key={i} d={`M${-size * 0.8} ${cy - size * 0.8} L${size * 0.8} ${cy - size * 0.8} L0 ${cy + size * 0.8} Z`} fill="#111827" />
          case 'coneUp':
            return <path key={i} d={`M${-size * 0.8} ${cy + size * 0.8} L${size * 0.8} ${cy + size * 0.8} L0 ${cy - size * 0.8} Z`} fill="#111827" />
        }
      })}
    </g>
  )
}

const SHAPE_FOR: Partial<Record<VesselKind, Shape[]>> = {
  motorsail: ['coneDown'],
  fishing: ['coneDown', 'coneUp'],
  nuc: ['ball', 'ball'],
  ram: ['ball', 'diamond', 'ball'],
  cbd: ['cylinder'],
}

function Vessel({ kind, x, y, heading, windFrom }: { kind: VesselKind; x: number; y: number; heading: number; windFrom: number }) {
  const twa = norm180(windFrom - heading)
  let body: ReactNode
  if (kind === 'sail' || kind === 'motorsail') {
    body = <TopBoat x={0} y={0} headingDeg={heading} twa={twa} scale={1.6} />
  } else if (kind === 'power') {
    body = (
      <g transform={`rotate(${heading}) scale(1.4)`}>
        <path d="M0 -20 C8 -12 9 4 7 18 L-7 18 C-9 4 -8 -12 0 -20 Z" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
        <rect x="-4.5" y="-4" width="9" height="10" rx="2" fill="#94a3b8" />
      </g>
    )
  } else {
    const len = kind === 'fishing' ? 40 : 110
    const wid = kind === 'fishing' ? 12 : 22
    const colour = kind === 'tanker' ? '#991b1b' : kind === 'fishing' ? '#1d4ed8' : '#334155'
    body = (
      <g transform={`rotate(${heading})`}>
        <path
          d={`M0 ${-len / 2} C${wid / 2} ${-len / 2 + wid} ${wid / 2} ${-len / 2 + wid} ${wid / 2} ${-len / 2 + wid * 1.2} L${wid / 2} ${len / 2} L${-wid / 2} ${len / 2} L${-wid / 2} ${-len / 2 + wid * 1.2} C${-wid / 2} ${-len / 2 + wid} ${-wid / 2} ${-len / 2 + wid} 0 ${-len / 2} Z`}
          fill={colour}
          stroke="#fff"
          strokeWidth="1.2"
        />
        <rect x={-wid / 2 + 2} y={len / 2 - wid} width={wid - 4} height={wid * 0.7} fill="#e2e8f0" />
        {kind === 'fishing' && (
          <path d={`M-4 ${len / 2} L-14 ${len / 2 + 50} M4 ${len / 2} L14 ${len / 2 + 50} M-14 ${len / 2 + 50} L14 ${len / 2 + 50}`} stroke="#1e293b" strokeDasharray="3 3" fill="none" />
        )}
      </g>
    )
  }
  const shapes = SHAPE_FOR[kind]
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="0" y1="0" x2={Math.sin((heading * Math.PI) / 180) * 70} y2={-Math.cos((heading * Math.PI) / 180) * 70} stroke="#0b3a5c" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.6" />
      {body}
      {shapes && <Shapes x={kind === 'tanker' || kind === 'nuc' || kind === 'ram' || kind === 'cbd' ? 30 : 22} y={-20} shapes={shapes} size={5} />}
    </g>
  )
}

function RowScene({ s, t }: { s: RowScenario; t: Translate }) {
  const r = (s.bearing * Math.PI) / 180
  const ox = OWN.x + Math.sin(r) * s.distance * 300
  const oy = OWN.y - Math.cos(r) * s.distance * 300
  const wr = (s.windFromDeg * Math.PI) / 180
  const usesWind = [s.own, s.other].some((k) => k === 'sail' || k === 'motorsail')
  return (
    <svg viewBox={`0 0 ${W} ${W}`} className="h-80 w-80 rounded-2xl" role="img" aria-label={t(`cr.s.${s.id}.q` as MessageKey)}>
      <rect width={W} height={W} fill="#cfe8f5" />
      {s.channel && (
        <g transform={`translate(${ox} ${oy}) rotate(${s.otherHeading})`}>
          <rect x="-40" y="-400" width="80" height="800" fill="#b6dcef" />
          <line x1="-40" y1="-400" x2="-40" y2="400" stroke="#7c3aed" strokeDasharray="8 6" />
          <line x1="40" y1="-400" x2="40" y2="400" stroke="#7c3aed" strokeDasharray="8 6" />
        </g>
      )}
      <Vessel kind={s.other} x={ox} y={oy} heading={s.otherHeading} windFrom={s.windFromDeg} />
      <Vessel kind={s.own} x={OWN.x} y={OWN.y} heading={0} windFrom={s.windFromDeg} />
      <text x={OWN.x} y={OWN.y + 42} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0b3a5c">
        {t('cr.you')}
      </text>
      {usesWind && (
        <g transform="translate(355 45)">
          <circle r="30" fill="rgba(255,255,255,0.85)" stroke="#94a3b8" />
          <line x1={Math.sin(wr) * 26} y1={-Math.cos(wr) * 26} x2={-Math.sin(wr) * 16} y2={Math.cos(wr) * 16} stroke="#0b3a5c" strokeWidth="3" markerEnd="url(#cr-arrow)" />
          <text y="44" textAnchor="middle" fontSize="11" fill="#0b3a5c">
            {t('rp.wind')}
          </text>
        </g>
      )}
      <defs>
        <marker id="cr-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" fill="#0b3a5c" />
        </marker>
      </defs>
    </svg>
  )
}

function RightOfWay({ t }: { t: Translate }) {
  return (
    <QuizRunner
      bestKey="sg-colreg-row"
      makeItems={() => shuffled(rowScenarios).slice(0, 10)}
      picture={(s) => <RowScene s={s} t={t} />}
      question={(s) => (
        <>
          <p>{t(`cr.s.${s.id}.q` as MessageKey)}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('cr.whatDo')}</p>
        </>
      )}
      options={() => (['standOn', 'giveWay', 'bothStarboard'] as const).map((v) => ({ value: v, label: t(`cr.ans.${v}`) }))}
      answer={(s) => s.answer}
      explanation={(s) => (
        <p>
          <strong>
            {t('cr.rule')} {s.rule}.
          </strong>{' '}
          {t(`cr.s.${s.id}.why` as MessageKey)}
        </p>
      )}
    />
  )
}

/* ---------- Lights ---------- */

const LIGHT_HEX: Record<LightColour, string> = { white: '#fff7d6', red: '#ff453a', green: '#30d158', yellow: '#ffd60a' }

function LightScene({ lights }: { lights: { x: number; y: number; c: LightColour }[] }) {
  return (
    <svg viewBox="0 0 260 200" className="h-56 w-72 rounded-2xl" aria-hidden>
      <defs>
        <linearGradient id="cr-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#020617" />
          <stop offset="1" stopColor="#0b1a33" />
        </linearGradient>
        <radialGradient id="cr-glow">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="260" height="200" fill="url(#cr-night)" />
      <line x1="0" y1="168" x2="260" y2="168" stroke="#1e293b" />
      {lights.map((l, i) => {
        const cx = 130 + l.x * 90
        const cy = 160 - l.y * 130
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r="14" fill={LIGHT_HEX[l.c]} opacity="0.25" />
            <circle cx={cx} cy={cy} r="4.5" fill={LIGHT_HEX[l.c]} />
          </g>
        )
      })}
    </svg>
  )
}

function LightsQuiz({ t }: { t: Translate }) {
  const ids = lightPictures.map((l) => l.id)
  return (
    <>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{t('cr.lightsIntro')}</p>
      <QuizRunner
        bestKey="sg-colreg-lights"
        makeItems={() => shuffled(lightPictures).slice(0, 10)}
        picture={(l) => <LightScene lights={l.lights} />}
        question={() => t('cr.lightsQ')}
        options={(l) => withDistractors(l.id, ids).map((id) => ({ value: id, label: t(`cr.l.${id}` as MessageKey) }))}
        answer={(l) => l.id}
        explanation={(l) => <p>{t(`cr.l.${l.id}` as MessageKey)}</p>}
      />
    </>
  )
}

function ShapesQuiz({ t }: { t: Translate }) {
  const ids = dayShapes.map((d) => d.id)
  return (
    <QuizRunner
      bestKey="sg-colreg-shapes"
      makeItems={() => shuffled(dayShapes)}
      picture={(d) => (
        <svg viewBox="0 0 160 200" className="h-56 w-44 rounded-2xl" aria-hidden>
          <rect width="160" height="200" fill="#e0f2fe" />
          <Shapes x={80} y={40} shapes={d.shapes} size={14} />
        </svg>
      )}
      question={() => t('cr.shapesQ')}
      options={(d) => withDistractors(d.id, ids).map((id) => ({ value: id, label: t(`cr.d.${id}` as MessageKey) }))}
      answer={(d) => d.id}
    />
  )
}

function SoundsQuiz({ t }: { t: Translate }) {
  const ids = soundSignals.map((s) => s.id)
  const [stop, setStop] = useState<(() => void) | null>(null)
  const play = (pattern: string) => {
    stop?.()
    setStop(() => playHorn(pattern))
  }
  return (
    <>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{t('cr.soundsIntro')}</p>
      <QuizRunner
        bestKey="sg-colreg-sounds"
        makeItems={() => shuffled(soundSignals)}
        picture={(s) => (
          <button type="button" className="btn-primary h-24 w-48 text-lg" onClick={() => play(s.pattern)}>
            🔊 {t('cr.play')}
          </button>
        )}
        question={() => t('cr.soundsQ')}
        options={(s) => withDistractors(s.id, ids).map((id) => ({ value: id, label: t(`cr.snd.${id}` as MessageKey) }))}
        answer={(s) => s.id}
        explanation={(s) => (
          <p>
            <span className="font-mono text-lg">{hornSymbols(s.pattern)}</span> · {t(`cr.snd.${s.id}` as MessageKey)}
          </p>
        )}
      />
    </>
  )
}
