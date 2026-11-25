import { Fragment, useState, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { url } from '@/lib/url'
import type { MessageKey } from '../../../i18n/en'
import { useI18n, type Translate } from '../../../i18n'
import { loadJson, saveJson } from '../../../lib/storage'
import type { CourseId } from '../courses'
import { Feedback, Panel } from '../ui'
import { isLesson, LESSON_IDS, lessonMeta, lessonSets, metaOf, type Block, type CheckQuestion, type LessonId, type LessonMeta } from './lessons'
import { LessonWidget } from './widgets'

const DONE_KEY = 'rya-lessons'

export function lessonScores(): Record<string, number> {
  return loadJson<Record<string, number>>(DONE_KEY, {})
}

/** Renders **bold** inline markup. */
export function rich(text: string): ReactNode {
  return text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>))
}

export function LessonCards({ items }: { items: LessonMeta[] }) {
  const { t, lang } = useI18n()
  const scores = lessonScores()
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((m) => {
        const text = lessonSets[lang][m.id]
        const done = scores[m.id] !== undefined
        return (
          <Link
            key={m.id}
            to={`/rya/learn/${m.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-navy-900/60"
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl" aria-hidden>
                {m.icon}
              </span>
              {done && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">✔ {scores[m.id]}/{text.check.length}</span>}
            </div>
            <h3 className="mt-3 text-lg font-semibold">{text.title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{text.summary}</p>
            <div className="mt-4 text-sm font-medium text-sea-500">📖 {t('rya.lessons.open')} →</div>
          </Link>
        )
      })}
    </div>
  )
}

/** Featured card for the stand-alone "end-to-end passage planning" lesson. */
function BigLessonCard({ to, icon, k }: { to: string; icon: string; k: 'pp' | 'wx' }) {
  const { t } = useI18n()
  return (
    <Link
      to={to}
      className="mt-4 flex flex-col gap-3 rounded-xl border-2 border-sea-500/50 bg-gradient-to-r from-sky-50 to-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center dark:from-sea-500/10 dark:to-navy-900/60"
    >
      <span className="text-4xl" aria-hidden>
        {icon}
      </span>
      <div className="flex-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-sea-500">{t(`rya.${k}.badge`)}</div>
        <h3 className="mt-0.5 text-lg font-semibold">{t(`rya.${k}.title`)}</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(`rya.${k}.summary`)}</p>
      </div>
      <div className="text-sm font-medium text-sea-500">📖 {t('rya.lessons.open')} →</div>
    </Link>
  )
}

export const PassagePlanCard = () => <BigLessonCard to="/rya/learn/passage-planning" icon="🧭" k="pp" />
export const WeatherCard = () => <BigLessonCard to="/rya/learn/weather" icon="🌦️" k="wx" />

export function LessonIndex() {
  const { t } = useI18n()
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/rya" className="text-sm text-sea-500 hover:underline">
        ← {t('rya.title')}
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 dark:text-white">{t('rya.lessons.title')}</h1>
      <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">{t('rya.lessons.intro')}</p>
      <div className="mt-6">
        <LessonCards items={lessonMeta} />
        <PassagePlanCard />
        <WeatherCard />
      </div>
    </div>
  )
}

export function LessonRoute() {
  const { lesson } = useParams()
  if (!isLesson(lesson)) return <Navigate to="/rya/learn" replace />
  return <LessonPage key={lesson} id={lesson} />
}

function gameLink(meta: LessonMeta, game: string): { course: CourseId; game: string } {
  return meta.games.find((g) => g.game === game) ?? { course: 'day-skipper', game }
}

function LessonPage({ id }: { id: LessonId }) {
  const { t, lang } = useI18n()
  const meta = metaOf(id)
  const text = lessonSets[lang][id]
  const idx = LESSON_IDS.indexOf(id)
  const prev = LESSON_IDS[idx - 1]
  const next = LESSON_IDS[idx + 1]
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/rya/learn" className="text-sm text-sea-500 hover:underline">
        ← {t('rya.lessons.title')}
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 dark:text-white">
        <span aria-hidden>{meta.icon}</span> {text.title}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{text.summary}</p>

      <Panel className="mt-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('rya.lessons.contents')}</div>
        <ol className="mt-2 grid list-decimal gap-x-6 gap-y-1 pl-5 text-sm sm:grid-cols-2">
          {text.sections.map((s, i) => (
            <li key={s.h}>
              <a href={`#s${i}`} onClick={(e) => (e.preventDefault(), document.getElementById(`s${i}`)?.scrollIntoView({ behavior: 'smooth' }))} className="text-sea-500 hover:underline">
                {s.h}
              </a>
            </li>
          ))}
          <li>
            <a href="#check" onClick={(e) => (e.preventDefault(), document.getElementById('check')?.scrollIntoView({ behavior: 'smooth' }))} className="text-sea-500 hover:underline">
              {t('rya.lessons.check')}
            </a>
          </li>
        </ol>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {meta.games.map((g) => (
            <Link key={g.game} to={`/rya/${g.course}/${g.game}`} className="btn-secondary">
              🎮 {t(`rya.g.${g.game}.title` as MessageKey)}
            </Link>
          ))}
        </div>
      </Panel>

      {text.sections.map((s, i) => (
        <section key={s.h} id={`s${i}`} className="mt-8 scroll-mt-20">
          <h2 className="text-xl font-semibold text-navy-900 dark:text-white">
            <span className="mr-2 text-sea-500">{i + 1}.</span>
            {s.h}
          </h2>
          <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">
            {s.blocks.map((b, j) => (
              <BlockView key={j} b={b} t={t} meta={meta} />
            ))}
          </div>
        </section>
      ))}

      <section id="check" className="mt-10 scroll-mt-20">
        <h2 className="text-xl font-semibold text-navy-900 dark:text-white">✅ {t('rya.lessons.check')}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('rya.lessons.checkIntro')}</p>
        <Check key={lang} id={id} questions={text.check} t={t} />
      </section>

      <div className="mt-10 flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
        {prev ? (
          <Link to={`/rya/learn/${prev}`} className="btn-secondary">
            ← {lessonSets[lang][prev].title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/rya/learn/${next}`} className="btn-primary">
            {lessonSets[lang][next].title} →
          </Link>
        )}
      </div>
    </div>
  )
}

export function BlockView({ b, t, meta }: { b: Block; t: Translate; meta: LessonMeta }) {
  if ('p' in b) return <p>{rich(b.p)}</p>
  if ('list' in b)
    return (
      <ul className="list-disc space-y-1 pl-5">
        {b.list.map((x) => (
          <li key={x}>{rich(x)}</li>
        ))}
      </ul>
    )
  if ('steps' in b)
    return (
      <ol className="space-y-1.5">
        {b.steps.map((x, i) => (
          <li key={x} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white dark:bg-sea-500">{i + 1}</span>
            <span>{rich(x)}</span>
          </li>
        ))}
      </ol>
    )
  if ('ex' in b)
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-400/30 dark:bg-amber-400/10">
        <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">✏️ {t('rya.lessons.example')}</div>
        <div className="mt-1 font-semibold">{b.ex.title}</div>
        <ol className="mt-2 space-y-1 font-mono text-[13px]">
          {b.ex.lines.map((l, i) => (
            <li key={i}>
              <span className="mr-2 text-amber-600">{i + 1}.</span>
              {rich(l)}
            </li>
          ))}
        </ol>
      </div>
    )
  if ('tip' in b) return <div className="rounded-lg border-l-4 border-sea-500 bg-sea-100/60 px-4 py-2 text-sm dark:bg-sea-500/10">💡 {rich(b.tip)}</div>
  if ('warn' in b) return <div className="rounded-lg border-l-4 border-rose-500 bg-rose-50 px-4 py-2 text-sm dark:bg-rose-500/10">⚠️ {rich(b.warn)}</div>
  if ('table' in b)
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {b.table.head.map((h, i) => (
                <th key={i} className="border-b-2 border-slate-300 px-2 py-1.5 text-left font-semibold dark:border-white/20">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.table.rows.map((r, i) => (
              <tr key={i} className="odd:bg-slate-50 dark:odd:bg-white/5">
                {r.map((c, j) => (
                  <td key={j} className="border-b border-slate-200 px-2 py-1.5 align-top dark:border-white/10">
                    {rich(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  if ('img' in b)
    return (
      <figure className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-navy-900/60">
        <img src={url(b.img.src)} alt={b.img.alt} loading="lazy" style={b.img.width ? { width: b.img.width } : undefined} className="mx-auto block h-auto max-w-full" />
        <figcaption className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{b.img.alt}</figcaption>
      </figure>
    )
  if ('widget' in b) return <LessonWidget id={b.widget} />
  const g = gameLink(meta, b.game)
  return (
    <Link
      to={`/rya/${g.course}/${g.game}`}
      className="flex items-center justify-between rounded-xl border-2 border-emerald-400/60 bg-emerald-50 px-4 py-3 font-medium text-emerald-800 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200"
    >
      <span>🎮 {t('rya.lessons.practice', { game: t(`rya.g.${g.game}.title` as MessageKey) })}</span>
      <span>→</span>
    </Link>
  )
}

function Check({ id, questions, t }: { id: LessonId; questions: CheckQuestion[]; t: Translate }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null))
  const answered = picked.filter((p) => p !== null).length
  const score = picked.filter((p, i) => p === questions[i].answer).length
  const pick = (qi: number, oi: number) => {
    if (picked[qi] !== null) return
    const nextPicked = picked.map((p, i) => (i === qi ? oi : p))
    setPicked(nextPicked)
    if (nextPicked.every((p) => p !== null)) {
      const s = nextPicked.filter((p, i) => p === questions[i].answer).length
      const all = lessonScores()
      all[id] = Math.max(all[id] ?? 0, s)
      saveJson(DONE_KEY, all)
    }
  }
  // Shuffle once per mount so the right answer is not always first.
  const [orders] = useState(() => questions.map((q) => q.options.map((_, i) => i).sort(() => Math.random() - 0.5)))
  return (
    <div className="mt-3 space-y-4">
      {questions.map((q, qi) => (
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
                <button key={oi} type="button" className={cls} onClick={() => pick(qi, oi)}>
                  {q.options[oi]}
                </button>
              )
            })}
          </div>
          {picked[qi] !== null && (
            <div className="mt-2">
              <Feedback ok={picked[qi] === q.answer}>
                <strong>{picked[qi] === q.answer ? t('nm.correct') : t('sd.wrong')}</strong> {q.why}
              </Feedback>
            </div>
          )}
        </Panel>
      ))}
      {answered === questions.length && (
        <Panel className="text-center">
          <p className="text-lg font-semibold">{t('rya.score', { score, max: questions.length })}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t(score === questions.length ? 'rya.lessons.allRight' : 'rya.lessons.reread')}</p>
        </Panel>
      )}
    </div>
  )
}
