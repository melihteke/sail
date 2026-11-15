import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { MessageKey } from '../../../i18n/en'
import { useI18n, type Translate } from '../../../i18n'
import { QuizRunner } from '../../../lib/QuizRunner'
import { shuffled } from '../../../lib/random'
import { getStars, recordStars } from '../progress'
import { Feedback, Panel, StarsView } from '../ui'

const PREFIX = 'competent-crew:vhf'
const PARTS = ['dsc', 'mayday', 'which'] as const
type Part = (typeof PARTS)[number]

export const NATURES = ['undesignated', 'fire', 'flooding', 'collision', 'grounding', 'sinking', 'adrift', 'abandoning', 'mob'] as const

/** Voice Mayday: each group can be said in any order inside it. */
export const MAYDAY_GROUPS: string[][] = [['call'], ['thisIs'], ['maydayName'], ['position'], ['nature'], ['persons', 'assistance'], ['other'], ['over']]
export const DISTRACTORS = ['panpan', 'securite', 'overOut', 'chat']

export const CALL_TYPES = ['mayday', 'panpan', 'securite'] as const
export const CALL_CASES: { id: string; answer: (typeof CALL_TYPES)[number] }[] = [
  { id: 'mob', answer: 'mayday' },
  { id: 'sinking', answer: 'mayday' },
  { id: 'fire', answer: 'mayday' },
  { id: 'notBreathing', answer: 'mayday' },
  { id: 'brokenArm', answer: 'panpan' },
  { id: 'dismasted', answer: 'panpan' },
  { id: 'engineLane', answer: 'panpan' },
  { id: 'container', answer: 'securite' },
  { id: 'buoyLight', answer: 'securite' },
]

export function VhfGame() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const part: Part = (PARTS as readonly string[]).includes(search.get('part') ?? '') ? (search.get('part') as Part) : 'dsc'
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {PARTS.map((p, i) => (
          <button
            key={p}
            type="button"
            onClick={() => setSearch({ part: p }, { replace: true })}
            className={`rounded-lg border px-3 py-1.5 text-sm ${p === part ? 'border-navy-900 bg-navy-900 text-white dark:border-sea-500 dark:bg-sea-500' : 'border-slate-300 bg-white dark:border-white/20 dark:bg-white/5'}`}
          >
            {i + 1}. {t(`rya.vhf.part.${p}`)} <StarsView n={getStars(`${PREFIX}:${p}`)} size="text-xs" />
          </button>
        ))}
      </div>
      {part === 'dsc' && <DscDrill t={t} />}
      {part === 'mayday' && <MaydayBuilder t={t} />}
      {part === 'which' && <WhichCall t={t} />}
    </>
  )
}

/* ---------------- Radio face ---------------- */

function RadioFace({ t, on, channel, high, display, children }: { t: Translate; on: boolean; channel: number; high: boolean; display?: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border-4 border-slate-800 bg-slate-900 p-4 text-slate-100 shadow-lg">
      <div className="flex items-stretch gap-3">
        <div className={`flex-1 rounded-lg p-3 font-mono ${on ? 'bg-lime-200 text-slate-900' : 'bg-slate-700 text-slate-700'}`}>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-bold">{on ? String(channel).padStart(2, '0') : '--'}</span>
            <span className="text-sm">{on ? (high ? '25W HI' : '1W LO') : ''}</span>
          </div>
          <div className="mt-1 h-5 truncate text-xs">{on ? display ?? t('rya.vhf.ready') : ''}</div>
        </div>
      </div>
      {children}
    </div>
  )
}

/* ---------------- DSC alert ---------------- */

function DscDrill({ t }: { t: Translate }) {
  const [on, setOn] = useState(false)
  const [nature, setNature] = useState<(typeof NATURES)[number]>('undesignated')
  const [coverOpen, setCoverOpen] = useState(false)
  const [hold, setHold] = useState(0)
  const [holding, setHolding] = useState(false)
  const [sent, setSent] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [msg, setMsg] = useState<{ ok: boolean; key: MessageKey } | null>(null)
  const recorded = useRef(false)

  useEffect(() => {
    if (!holding || sent) return
    const id = setInterval(() => setHold((h) => Math.min(5, h + 0.1)), 100)
    return () => clearInterval(id)
  }, [holding, sent])

  useEffect(() => {
    if (hold >= 5 && !sent) {
      setSent(true)
      setHolding(false)
      const ok = nature === 'fire'
      if (!ok) setMistakes((m) => m + 1)
      setMsg({ ok, key: ok ? 'rya.vhf.dsc.sent' : 'rya.vhf.dsc.sentWrongNature' })
    }
  }, [hold, sent, nature])

  useEffect(() => {
    if (sent && !recorded.current) {
      recorded.current = true
      recordStars(`${PREFIX}:dsc`, mistakes === 0 ? 3 : mistakes <= 1 ? 2 : 1)
    }
  }, [sent, mistakes])

  const press = () => {
    if (!on) {
      setMistakes((m) => m + 1)
      return setMsg({ ok: false, key: 'rya.vhf.dsc.off' })
    }
    if (!coverOpen) {
      setMistakes((m) => m + 1)
      return setMsg({ ok: false, key: 'rya.vhf.dsc.cover' })
    }
    setHolding(true)
  }
  const release = () => {
    if (!holding) return
    setHolding(false)
    if (hold < 5 && !sent) {
      setMistakes((m) => m + 1)
      setMsg({ ok: false, key: 'rya.vhf.dsc.short' })
      setHold(0)
    }
  }
  const reset = () => {
    setOn(false)
    setNature('undesignated')
    setCoverOpen(false)
    setHold(0)
    setSent(false)
    setMistakes(0)
    setMsg(null)
    recorded.current = false
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_18rem]">
      <div>
        <Panel className="mb-3 text-sm">🔥 {t('rya.vhf.dsc.scenario')}</Panel>
        <RadioFace t={t} on={on} channel={16} high display={sent ? t('rya.vhf.dsc.display') : holding ? t('rya.vhf.dsc.holding', { s: (5 - hold).toFixed(1) }) : on ? t(`rya.vhf.nature.${nature}` as MessageKey) : undefined}>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setOn((o) => !o)} className={`rounded-full px-4 py-2 text-sm font-bold ${on ? 'bg-emerald-500 text-white' : 'bg-slate-700'}`}>
              ⏻ {t('rya.vhf.power')}
            </button>
            <label className="text-xs">
              {t('rya.vhf.dsc.menu')}
              <select disabled={!on || sent} value={nature} onChange={(e) => setNature(e.target.value as (typeof NATURES)[number])} className="ml-2 rounded bg-slate-800 px-2 py-1 text-slate-100">
                {NATURES.map((n) => (
                  <option key={n} value={n}>
                    {t(`rya.vhf.nature.${n}` as MessageKey)}
                  </option>
                ))}
              </select>
            </label>
            <div className="relative ml-auto">
              <button
                type="button"
                onPointerDown={press}
                onPointerUp={release}
                onPointerLeave={release}
                className="relative h-16 w-16 rounded-full bg-red-600 text-xs font-bold text-white shadow-inner"
                style={{ background: `conic-gradient(#fbbf24 ${(hold / 5) * 360}deg, #dc2626 0deg)` }}
              >
                DISTRESS
              </button>
              <button
                type="button"
                onClick={() => setCoverOpen((c) => !c)}
                className={`absolute -top-2 left-0 h-6 w-16 rounded-t-lg border border-slate-500 bg-slate-400/80 text-[10px] text-slate-900 transition-transform ${coverOpen ? '-translate-y-6 rotate-[-25deg]' : 'h-20'}`}
              >
                {coverOpen ? t('rya.vhf.dsc.coverOpen') : t('rya.vhf.dsc.coverClosed')}
              </button>
            </div>
          </div>
        </RadioFace>
        {msg && (
          <div className="mt-3">
            <Feedback ok={msg.ok}>{t(msg.key)}</Feedback>
          </div>
        )}
      </div>
      <Panel className="self-start text-sm">
        <h3 className="font-semibold">{t('rya.vhf.dsc.stepsTitle')}</h3>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-slate-600 dark:text-slate-300">
          <li>{t('rya.vhf.dsc.s1')}</li>
          <li>{t('rya.vhf.dsc.s2')}</li>
          <li>{t('rya.vhf.dsc.s3')}</li>
          <li>{t('rya.vhf.dsc.s4')}</li>
        </ol>
        {sent && (
          <div className="mt-3 text-center">
            <StarsView n={mistakes === 0 ? 3 : mistakes <= 1 ? 2 : 1} size="text-2xl" />
            <button type="button" className="btn-secondary mt-2 w-full" onClick={reset}>
              ↺ {t('rya.retry')}
            </button>
          </div>
        )}
      </Panel>
    </div>
  )
}

/* ---------------- Voice Mayday ---------------- */

function MaydayBuilder({ t }: { t: Translate }) {
  const [channel, setChannel] = useState(72)
  const [high, setHigh] = useState(false)
  const [ptt, setPtt] = useState(false)
  const [said, setSaid] = useState<string[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [msg, setMsg] = useState<{ ok: boolean; key: MessageKey } | null>(null)
  const blocks = useMemo(() => shuffled([...MAYDAY_GROUPS.flat(), ...DISTRACTORS]), [])
  const gi = (() => {
    let i = 0
    while (i < MAYDAY_GROUPS.length && MAYDAY_GROUPS[i].every((b) => said.includes(b))) i++
    return i
  })()
  const finished = gi >= MAYDAY_GROUPS.length && !ptt
  const recorded = useRef(false)
  useEffect(() => {
    if (finished && !recorded.current) {
      recorded.current = true
      recordStars(`${PREFIX}:mayday`, mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1)
    }
  }, [finished, mistakes])

  const wrong = (key: MessageKey) => {
    setMistakes((m) => m + 1)
    setMsg({ ok: false, key })
  }
  const say = (b: string) => {
    if (gi >= MAYDAY_GROUPS.length) return
    if (channel !== 16 || !high) return wrong('rya.vhf.my.channel')
    if (!ptt) return wrong('rya.vhf.my.ptt')
    if (!MAYDAY_GROUPS[gi].includes(b)) return wrong(DISTRACTORS.includes(b) ? (`rya.vhf.my.bad.${b}` as MessageKey) : 'rya.vhf.my.order')
    setSaid((s) => [...s, b])
    setMsg(null)
  }
  const togglePtt = () => {
    if (ptt && gi < MAYDAY_GROUPS.length && said.length > 0) wrong('rya.vhf.my.releasedEarly')
    setPtt((p) => !p)
  }
  const reset = () => {
    setChannel(72)
    setHigh(false)
    setPtt(false)
    setSaid([])
    setMistakes(0)
    setMsg(null)
    recorded.current = false
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_20rem]">
      <div>
        <Panel className="mb-3 text-sm">🌊 {t('rya.vhf.my.scenario')}</Panel>
        <RadioFace t={t} on channel={channel} high={high} display={ptt ? `📡 ${t('rya.vhf.tx')}` : undefined}>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" className="rounded bg-slate-700 px-3 py-1 text-sm" onClick={() => setChannel((c) => (c <= 1 ? 88 : c - 1))}>
              CH −
            </button>
            <button type="button" className="rounded bg-slate-700 px-3 py-1 text-sm" onClick={() => setChannel((c) => (c >= 88 ? 1 : c + 1))}>
              CH +
            </button>
            <button type="button" className="rounded bg-sky-700 px-3 py-1 text-sm font-bold" onClick={() => setChannel(16)}>
              16/9
            </button>
            <button type="button" className={`rounded px-3 py-1 text-sm ${high ? 'bg-amber-500 text-slate-900' : 'bg-slate-700'}`} onClick={() => setHigh((h) => !h)}>
              H/L
            </button>
            <button type="button" onClick={togglePtt} className={`ml-auto rounded-full px-5 py-3 text-sm font-bold ${ptt ? 'bg-red-600 text-white ring-4 ring-red-300' : 'bg-slate-600'}`}>
              🎙️ PTT {ptt ? t('rya.vhf.my.release') : t('rya.vhf.my.press')}
            </button>
          </div>
        </RadioFace>
        <div className="mt-3 min-h-[6rem] rounded-xl border border-dashed border-slate-300 p-3 text-sm dark:border-white/20">
          {said.length === 0 ? <span className="text-slate-400">{t('rya.vhf.my.empty')}</span> : said.map((b) => <p key={b}>“{t(`rya.vhf.b.${b}` as MessageKey)}”</p>)}
        </div>
        {msg && (
          <div className="mt-2">
            <Feedback ok={msg.ok}>{t(msg.key)}</Feedback>
          </div>
        )}
        {finished && (
          <Panel className="mt-3 text-center">
            <StarsView n={mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1} size="text-3xl" />
            <p className="mt-1 font-semibold">{t('rya.vhf.my.done')}</p>
            <button type="button" className="btn-primary mt-2" onClick={reset}>
              ↺ {t('rya.retry')}
            </button>
          </Panel>
        )}
      </div>
      <Panel className="self-start">
        <h3 className="text-sm font-semibold">{t('rya.vhf.my.blocks')}</h3>
        <div className="mt-2 grid gap-1.5">
          {blocks.map((b) => (
            <button key={b} type="button" className="btn-secondary text-left text-xs" disabled={said.includes(b)} onClick={() => say(b)}>
              {t(`rya.vhf.b.${b}` as MessageKey)}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">❌ {mistakes}</p>
      </Panel>
    </div>
  )
}

/* ---------------- Which call? ---------------- */

function WhichCall({ t }: { t: Translate }) {
  return (
    <QuizRunner<(typeof CALL_CASES)[number]>
      makeItems={() => shuffled(CALL_CASES)}
      question={(c) => t(`rya.vhf.case.${c.id}` as MessageKey)}
      options={() => CALL_TYPES.map((x) => ({ value: x, label: t(`rya.vhf.type.${x}` as MessageKey) }))}
      answer={(c) => c.answer}
      explanation={(c) => t(`rya.vhf.case.${c.id}.why` as MessageKey)}
      bestKey="rya-vhf-which"
      columns={1}
      onFinish={(score, total) => recordStars(`${PREFIX}:which`, score === total ? 3 : score >= total - 2 ? 2 : 1)}
    />
  )
}
