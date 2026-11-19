import { useState, type ReactNode } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useI18n } from '../../../i18n'
import { BlockView, rich } from '../lessons/LessonPage'
import { metaOf, type Block } from '../lessons/lessons'
import { Feedback, Panel } from '../ui'
import type { Scenario } from './scenario'
import { ALL_SCENARIOS, SALTMERE, scenarioById } from './scenarios'
import { CHAPTER_IDS, fill, type ABlock, type AlmanacText, type ChapterId } from './text'
import { almanacTexts, scenarioTexts } from './texts'
import { fillBlock } from './vars'
import { AlmanacWidget, DayTidesWidget, ScenarioProvider, usePlanVars } from './widgets'

const isChapter = (v: string | null): v is ChapterId => (CHAPTER_IDS as readonly string[]).includes(v ?? '')

const HUB = '/rya/learn/passage-planning'

/** Entry of the Day Skipper lesson "end-to-end passage planning": pick one of the scenarios. */
export function PassagePlanningPage() {
  const { t, lang } = useI18n()
  const [search] = useSearchParams()
  const a = almanacTexts[lang]
  // Old links pointed chapters of the guided lesson at the hub.
  const ch = search.get('ch')
  if (ch) return <Navigate to={`${HUB}/${SALTMERE.id}?ch=${ch}`} replace />
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/rya/day-skipper" className="text-sm text-sea-500 hover:underline">
        ← {t('rya.course.day-skipper.title')}
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 dark:text-white">🧭 {a.title}</h1>
      <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">{a.intro}</p>
      <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">{a.ui.sc.pickIntro}</p>
      <div className="mt-2 rounded-lg border-l-4 border-rose-500 bg-rose-50 px-3 py-1.5 text-xs dark:bg-rose-500/10">⚠️ {a.ui.disclaimer}</div>
      <h2 className="mt-6 text-lg font-semibold text-navy-900 dark:text-white">{a.ui.sc.pick}</h2>
      <div className="mt-3">
        <ScenarioProvider s={SALTMERE}>
          <AlmanacWidget id="scenarios" />
        </ScenarioProvider>
      </div>
    </div>
  )
}

/** Scenario 1: the guided lesson, one chapter at a time. */
function GuidedLesson() {
  const { t, lang } = useI18n()
  const a = almanacTexts[lang]
  const st = scenarioTexts[SALTMERE.id][lang]
  const [search, setSearch] = useSearchParams()
  const req = search.get('ch')
  const ch: ChapterId = isChapter(req) ? req : 'start'
  const idx = CHAPTER_IDS.indexOf(ch)
  const go = (id: ChapterId) => {
    setSearch({ ch: id }, { replace: true })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const chapter = a.chapters[ch]
  const meta = metaOf('tides')
  const prev = CHAPTER_IDS[idx - 1]
  const next = CHAPTER_IDS[idx + 1]
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to={HUB} className="text-sm text-sea-500 hover:underline">
        ← {a.ui.sc.back}
      </Link>
      <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-sea-500">1 · {a.ui.sc.guided}</div>
      <h1 className="text-3xl font-bold tracking-tight text-navy-900 dark:text-white">
        <span aria-hidden>{SALTMERE.icon}</span> {st.title}
      </h1>
      <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">{st.summary}</p>
      <div className="mt-2 rounded-lg border-l-4 border-rose-500 bg-rose-50 px-3 py-1.5 text-xs dark:bg-rose-500/10">⚠️ {a.ui.disclaimer}</div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label={a.ui.chapters} className="min-w-0 lg:sticky lg:top-20 lg:self-start">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{a.ui.chapters}</div>
          <ol className="mt-2 flex flex-wrap gap-1 lg:flex-col">
            {CHAPTER_IDS.map((id, i) => (
              <li key={id} className="lg:w-full">
                <button
                  type="button"
                  onClick={() => go(id)}
                  className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left text-xs sm:text-sm lg:gap-2 lg:py-1.5 ${id === ch ? 'bg-navy-900 font-semibold text-white dark:bg-sea-500' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'}`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${id === ch ? 'bg-white/20' : 'bg-slate-200 dark:bg-white/10'}`}>{i}</span>
                  <span>{a.chapters[id].short}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <article className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-sea-500">
            {idx} / {CHAPTER_IDS.length - 1}
          </div>
          <h3 className="text-2xl font-bold text-navy-900 dark:text-white">{chapter.title}</h3>
          {chapter.sections.map((s, i) => (
            <section key={s.h} className="mt-7">
              <h4 className="text-lg font-semibold text-navy-900 dark:text-white">
                <span className="mr-2 text-sea-500">
                  {idx}.{i + 1}
                </span>
                {s.h}
              </h4>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">
                {s.blocks.map((b, j) => (
                  <ABlockView key={j} b={b} render={(x) => <BlockView b={x} t={t} meta={meta} />} />
                ))}
              </div>
            </section>
          ))}
          {ch === 'practice' && <AlmanacCheck key={lang} a={a} />}

          <div className="mt-10 flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
            {prev ? (
              <button type="button" className="btn-secondary" onClick={() => go(prev)}>
                ← {a.chapters[prev].short}
              </button>
            ) : (
              <span />
            )}
            {next && (
              <button type="button" className="btn-primary" onClick={() => go(next)}>
                {a.chapters[next].short} →
              </button>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}

function ABlockView({ b, render }: { b: ABlock; render: (b: Block) => ReactNode }) {
  if ('aw' in b) return <AlmanacWidget id={b.aw} />
  return render(b)
}

/** One extra scenario: the whole plan on one page, step by step, with the scenario's own chart and almanac. */
export function ScenarioRoute() {
  const { scenario } = useParams()
  if (scenario === SALTMERE.id)
    return (
      <ScenarioProvider s={SALTMERE}>
        <GuidedLesson />
      </ScenarioProvider>
    )
  const s = scenarioById(scenario)
  if (!s) return <Navigate to={HUB} replace />
  return (
    <ScenarioProvider key={s.id} s={s}>
      <ScenarioPage s={s} />
    </ScenarioProvider>
  )
}

function ScenarioPage({ s }: { s: Scenario }) {
  const { t, lang } = useI18n()
  const a = almanacTexts[lang]
  const u = a.ui
  const st = scenarioTexts[s.id][lang]
  const vars = usePlanVars()
  const meta = metaOf('tides')
  const extra = (k: keyof AlmanacText['ui']['sc']['h']) => (st.sections?.[k] ?? []).map((b) => fillBlock(b, vars))
  const gate = !!s.tidal?.gate
  const sections: { k: keyof AlmanacText['ui']['sc']['h']; blocks: ReactNode[] }[] = []
  const blocks = (k: keyof AlmanacText['ui']['sc']['h'], before: ReactNode[] = [], after: ReactNode[] = []) => {
    const text = extra(k).map((b, j) => <ABlockView key={`t${j}`} b={b} render={(x) => <BlockView b={x} t={t} meta={meta} />} />)
    sections.push({ k, blocks: [...before, ...text, ...after] })
  }
  blocks('brief', [], [<AlmanacWidget key="c" id="chart" />])
  if (s.tidal) {
    blocks('almanac', [], [<AlmanacWidget key="t" id="tideTable" />, ...(s.tidal.secondary ? [<AlmanacWidget key="d" id="diffBox" />, <AlmanacWidget key="s" id="secondary" />] : [])])
    blocks('tides', [<DayTidesWidget key="dt" />], [<AlmanacWidget key="cs" id="curveStd" />])
    if (gate) blocks('gate', [], [<AlmanacWidget key="cg" id="curveGate" />])
    blocks('streams', [], [<AlmanacWidget key="at" id="atlas" />, <AlmanacWidget key="di" id="diamonds" />, <AlmanacWidget key="sd" id="streamDay" />])
    blocks('departure', [], [<AlmanacWidget key="dp" id="departure" />])
  } else {
    blocks('tides')
    blocks('streams', [], [<AlmanacWidget key="cu" id="currents" />])
    blocks('departure')
  }
  blocks('overview', [<AlmanacWidget key="ov" id="overview" />])
  blocks('route', [<AlmanacWidget key="lg" id="legs" />])
  blocks('cts', [], [<AlmanacWidget key="ct" id="cts" />])
  blocks('sheet', [<AlmanacWidget key="sh" id="sheet" />])
  blocks('practice', [<AlmanacWidget key="pr" id="practice" />])
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to={HUB} className="text-sm text-sea-500 hover:underline">
        ← {u.sc.back}
      </Link>
      <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-sea-500">
        {ALL_SCENARIOS.indexOf(s) + 1} · {u.sc.worked}
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-navy-900 dark:text-white">
        <span aria-hidden>{s.icon}</span> {st.title}
      </h1>
      <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">{st.summary}</p>
      <div className="mt-2 rounded-lg border-l-4 border-rose-500 bg-rose-50 px-3 py-1.5 text-xs dark:bg-rose-500/10">⚠️ {u.disclaimer}</div>
      <nav className="mt-4 flex flex-wrap gap-1 text-xs">
        {sections.map((x, i) => (
          <a key={x.k} href={`#${x.k}`} onClick={(e) => (e.preventDefault(), document.getElementById(x.k)?.scrollIntoView({ behavior: 'smooth' }))} className="rounded-full border border-slate-300 px-2.5 py-0.5 text-slate-600 hover:bg-slate-50 dark:border-white/20 dark:text-slate-300">
            {i + 1}. {u.sc.h[x.k]}
          </a>
        ))}
      </nav>
      {sections.map((x, i) => (
        <section key={x.k} id={x.k} className="mt-8 scroll-mt-20">
          <h2 className="text-xl font-semibold text-navy-900 dark:text-white">
            <span className="mr-2 text-sea-500">{i + 1}.</span>
            {u.sc.h[x.k]}
          </h2>
          <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">{x.blocks}</div>
        </section>
      ))}
      <div className="mt-10 border-t border-slate-200 pt-4 dark:border-white/10">
        <Link to={HUB} className="btn-secondary">
          ← {u.sc.back}
        </Link>
      </div>
    </div>
  )
}

function AlmanacCheck({ a }: { a: AlmanacText }) {
  const qs = a.check
  const [picked, setPicked] = useState<(number | null)[]>(() => qs.map(() => null))
  // Shuffle once per mount so the right answer is not always in the same place.
  const [orders] = useState(() => qs.map((q) => q.options.map((_, i) => i).sort(() => Math.random() - 0.5)))
  const done = picked.every((p) => p !== null)
  const score = picked.filter((p, i) => p === qs[i].answer).length
  return (
    <section className="mt-10">
      <h4 className="text-lg font-semibold text-navy-900 dark:text-white">✅ {a.ui.check.title}</h4>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{a.ui.check.intro}</p>
      <div className="mt-3 space-y-4">
        {qs.map((q, qi) => (
          <Panel key={q.q}>
            <p className="font-medium">
              {qi + 1}. {rich(q.q)}
            </p>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {orders[qi].map((oi) => {
                const o = q.options[oi]
                let cls = 'btn-secondary text-left'
                if (picked[qi] !== null) {
                  if (oi === q.answer) cls += ' !border-emerald-500 !bg-emerald-50 dark:!bg-emerald-950/50'
                  else if (oi === picked[qi]) cls += ' !border-rose-500 !bg-rose-50 dark:!bg-rose-950/50'
                }
                return (
                  <button key={oi} type="button" className={cls} onClick={() => picked[qi] === null && setPicked(picked.map((p, i) => (i === qi ? oi : p)))}>
                    {o}
                  </button>
                )
              })}
            </div>
            {picked[qi] !== null && (
              <div className="mt-2">
                <Feedback ok={picked[qi] === q.answer}>
                  <strong>{picked[qi] === q.answer ? a.ui.check.correct : a.ui.check.wrong}</strong> {q.why}
                </Feedback>
              </div>
            )}
          </Panel>
        ))}
        {done && (
          <Panel className="text-center">
            <p className="text-lg font-semibold">{fill(a.ui.check.score, { score, max: qs.length })}</p>
          </Panel>
        )}
      </div>
    </section>
  )
}
