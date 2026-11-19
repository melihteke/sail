import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useI18n } from '../../../i18n'
import { BlockView, rich } from '../lessons/LessonPage'
import { metaOf, type Block } from '../lessons/lessons'
import { Feedback, Panel } from '../ui'
import { WeatherDrill } from './drills'
import { W_CHAPTERS, fill, weatherTexts, type WBlock, type WChapterId, type WeatherText } from './text'
import { WeatherWidget } from './widgets'

const isChapter = (v: string | null): v is WChapterId => (W_CHAPTERS as readonly string[]).includes(v ?? '')

/** Day Skipper lesson: weather, one chapter at a time, with animated widgets and drills. */
export function WeatherPage() {
  const { t, lang } = useI18n()
  const w = weatherTexts[lang]
  const u = w.ui
  const [search, setSearch] = useSearchParams()
  const req = search.get('ch')
  const ch: WChapterId = isChapter(req) ? req : 'start'
  const idx = W_CHAPTERS.indexOf(ch)
  const go = (id: WChapterId) => {
    setSearch({ ch: id }, { replace: true })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const chapter = w.chapters[ch]
  const meta = metaOf('safety')
  const prev = W_CHAPTERS[idx - 1]
  const next = W_CHAPTERS[idx + 1]
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/rya/day-skipper" className="text-sm text-sea-500 hover:underline">
        ← {t('rya.course.day-skipper.title')}
      </Link>
      <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-sea-500">{t('rya.wx.badge')}</div>
      <h1 className="text-3xl font-bold tracking-tight text-navy-900 dark:text-white">🌦️ {w.title}</h1>
      <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">{w.intro}</p>
      <div className="mt-2 rounded-lg border-l-4 border-rose-500 bg-rose-50 px-3 py-1.5 text-xs dark:bg-rose-500/10">⚠️ {u.disclaimer}</div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label={u.chapters} className="min-w-0 lg:sticky lg:top-20 lg:self-start">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{u.chapters}</div>
          <ol className="mt-2 flex flex-wrap gap-1 lg:flex-col">
            {W_CHAPTERS.map((id, i) => (
              <li key={id} className="lg:w-full">
                <button
                  type="button"
                  onClick={() => go(id)}
                  className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left text-xs sm:text-sm lg:gap-2 lg:py-1.5 ${id === ch ? 'bg-navy-900 font-semibold text-white dark:bg-sea-500' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'}`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${id === ch ? 'bg-white/20' : 'bg-slate-200 dark:bg-white/10'}`}>{i}</span>
                  <span>{w.chapters[id].short}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <article className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-sea-500">
            {idx} / {W_CHAPTERS.length - 1}
          </div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white">{chapter.title}</h2>
          {chapter.sections.map((s, i) => (
            <section key={s.h} className="mt-7">
              <h3 className="text-lg font-semibold text-navy-900 dark:text-white">
                <span className="mr-2 text-sea-500">
                  {idx}.{i + 1}
                </span>
                {s.h}
              </h3>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">
                {s.blocks.map((b, j) => (
                  <WBlockView key={j} b={b} render={(x) => <BlockView b={x} t={t} meta={meta} />} />
                ))}
              </div>
            </section>
          ))}
          {ch === 'drills' && <WeatherCheck key={lang} w={w} />}

          <div className="mt-10 flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
            {prev ? (
              <button type="button" className="btn-secondary" onClick={() => go(prev)}>
                ← {w.chapters[prev].short}
              </button>
            ) : (
              <span />
            )}
            {next && (
              <button type="button" className="btn-primary" onClick={() => go(next)}>
                {w.chapters[next].short} →
              </button>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}

function WBlockView({ b, render }: { b: WBlock; render: (b: Block) => ReactNode }) {
  if ('ww' in b) return <WeatherWidget id={b.ww} />
  if ('wd' in b) return <WeatherDrill id={b.wd} />
  return render(b)
}

function WeatherCheck({ w }: { w: WeatherText }) {
  const qs = w.check
  const u = w.ui
  const [picked, setPicked] = useState<(number | null)[]>(() => qs.map(() => null))
  const [orders] = useState(() => qs.map((q) => q.options.map((_, i) => i).sort(() => Math.random() - 0.5)))
  const done = picked.every((p) => p !== null)
  const score = picked.filter((p, i) => p === qs[i].answer).length
  return (
    <section className="mt-10">
      <h3 className="text-lg font-semibold text-navy-900 dark:text-white">✅ {u.final.title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{u.final.intro}</p>
      <div className="mt-3 space-y-4">
        {qs.map((q, qi) => (
          <Panel key={q.q}>
            <p className="font-medium">
              {qi + 1}. {rich(q.q)}
            </p>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {orders[qi].map((oi) => {
                let cls = 'btn-secondary text-left'
                if (picked[qi] !== null) {
                  if (oi === q.answer) cls += ' !border-emerald-500 !bg-emerald-50 dark:!bg-emerald-950/50'
                  else if (oi === picked[qi]) cls += ' !border-rose-500 !bg-rose-50 dark:!bg-rose-950/50'
                }
                return (
                  <button key={oi} type="button" className={cls} onClick={() => picked[qi] === null && setPicked(picked.map((p, i) => (i === qi ? oi : p)))}>
                    {q.options[oi]}
                  </button>
                )
              })}
            </div>
            {picked[qi] !== null && (
              <div className="mt-2">
                <Feedback ok={picked[qi] === q.answer}>
                  <strong>{picked[qi] === q.answer ? u.correct : u.wrong}</strong> {q.why}
                </Feedback>
              </div>
            )}
          </Panel>
        ))}
        {done && (
          <Panel className="text-center">
            <p className="text-lg font-semibold">{fill(u.score, { score, max: qs.length })}</p>
          </Panel>
        )}
      </div>
    </section>
  )
}
