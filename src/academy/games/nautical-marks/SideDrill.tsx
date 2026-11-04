import { useState } from 'react'
import type { MessageKey } from '../../i18n/en'
import type { Translate } from '../../i18n'
import { loadJson, saveJson } from '../../lib/storage'
import { BuoySvg } from './BuoySvg'
import { markById } from './marks'
import { makeSideDrill, type SideQuestion } from './sideQuestions'

const LENGTH = 10
const BEST_KEY = 'sg-side-best'
const DIRS = ['N', 'E', 'S', 'W'] as const

const name = (t: Translate, id: string) => t(`mark.${id}.name` as MessageKey)

function Scene({ q, t }: { q: SideQuestion; t: Translate }) {
  const mark = markById(q.markId)
  const lateral = q.kind === 'lateral'
  return (
    <svg viewBox="0 0 220 260" className="h-72 w-60 shrink-0 rounded-2xl" role="img" aria-label={name(t, q.markId)}>
      <rect width="220" height="260" fill="#cfe8f5" />
      <g opacity="0.5" stroke="#ffffff" strokeWidth="1.2">
        <path d="M20 40 h30 M150 70 h40 M40 150 h25 M160 190 h30 M30 230 h40" />
      </g>
      {lateral ? (
        <>
          <text x="110" y="20" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0b3a5c">
            {q.direction === 'in' ? `⚓ ${t('sd.harbour')}` : `🌊 ${t('sd.sea')}`}
          </text>
          <text x="110" y="254" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0b3a5c">
            {q.direction === 'in' ? `🌊 ${t('sd.sea')}` : `⚓ ${t('sd.harbour')}`}
          </text>
          <BuoySvg mark={mark} x={88} y={50} width={44} height={74} noWater />
          <g transform="translate(110 200)">
            <path d="M0 -26 C8 -16 9 -2 7 22 L-7 22 C-9 -2 -8 -16 0 -26 Z" fill="#0b3a5c" stroke="#fff" strokeWidth="1.5" />
            <path d="M0 -10 L0 16" stroke="#fff" strokeWidth="1.5" />
          </g>
          <path d="M110 170 V140" stroke="#0b3a5c" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#sd-arrow)" />
          <g transform={`translate(196 ${q.direction === 'in' ? 150 : 110})`}>
            <path d={q.direction === 'in' ? 'M0 30 V-30' : 'M0 -30 V30'} stroke="#7c3aed" strokeWidth="3" markerEnd="url(#sd-arrow-b)" />
          </g>
          <text x="196" y="200" textAnchor="middle" fontSize="8" fill="#7c3aed" transform="rotate(-90 196 200)">
            {t('ps.buoyage')}
          </text>
        </>
      ) : (
        <>
          <BuoySvg mark={mark} x={84} y={70} width={52} height={88} noWater />
          <g transform="translate(30 40)">
            <path d="M0 18 V-14" stroke="#0b3a5c" strokeWidth="2.5" markerEnd="url(#sd-arrow)" />
            <text x="0" y="-18" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0b3a5c">
              N
            </text>
          </g>
        </>
      )}
      <defs>
        <marker id="sd-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" fill="#0b3a5c" />
        </marker>
        <marker id="sd-arrow-b" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" fill="#7c3aed" />
        </marker>
      </defs>
    </svg>
  )
}

function explanation(t: Translate, q: SideQuestion): string {
  if (q.kind === 'cardinal') return t('sd.explainCardinal', { mark: name(t, q.markId), dir: t(`dir.${q.answer}`) })
  const base = t(q.direction === 'in' ? 'sd.explainIn' : 'sd.explainOut')
  if (q.markId === 'pref-starboard' || q.markId === 'pref-port') {
    const main = q.markId === 'pref-starboard' ? 'starboard' : 'port'
    const mainNow = q.direction === 'in' ? main : main === 'port' ? 'starboard' : 'port'
    return `${base} ${t('sd.explainPref', { side: t(`side.${mainNow}`) })}`
  }
  return base
}

export function SideDrill({ t }: { t: Translate }) {
  const [questions, setQuestions] = useState(() => makeSideDrill(LENGTH, Math.random))
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => loadJson<number>(BEST_KEY, 0))

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
            setQuestions(makeSideDrill(LENGTH, Math.random))
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
  const options: { value: string; label: string }[] =
    q.kind === 'cardinal'
      ? DIRS.map((d) => ({ value: d, label: t('sd.pass', { dir: t(`dir.${d}`) }) }))
      : [
          { value: 'port', label: t('sd.keepPort') },
          { value: 'starboard', label: t('sd.keepStarboard') },
        ]
  const pick = (v: string) => {
    if (picked) return
    setPicked(v)
    if (v === q.answer) setScore((s) => s + 1)
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
        <span>
          {qi + 1}/{questions.length}
        </span>
        <span>
          {score} ✓ · {t('nm.best', { score: best, total: questions.length })}
        </span>
      </div>
      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Scene q={q} t={t} />
        <div className="w-full">
          <p className="font-medium">
            {q.kind === 'cardinal' ? t('sd.cardinalQ', { mark: name(t, q.markId) }) : t(q.direction === 'in' ? 'sd.lateralIn' : 'sd.lateralOut')}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {options.map((o) => {
              let cls = 'btn-secondary text-left first-letter:uppercase'
              if (picked) {
                if (o.value === q.answer) cls += ' !border-emerald-500 !bg-emerald-50 dark:!bg-emerald-950/50'
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
              <p className={picked === q.answer ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>
                {picked === q.answer ? t('nm.correct') : t('sd.wrong')}
              </p>
              <p className="mt-1">
                <strong>{name(t, q.markId)}.</strong> {explanation(t, q)}
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
