import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { MessageKey } from '../../i18n/en'
import { useI18n, type Translate } from '../../i18n'
import { loadJson, saveJson } from '../../lib/storage'
import coursesJson from './courses.json'
import { RaceGame } from './RaceGame'
import { errorKey, formatRaceTime, leaderboard, listCourses, online, startRace, submitRace, type BoardRow, type CourseRow, type SubmitResult } from './raceApi'
import { RaceRules } from './RaceRules'
import type { CourseData, HelmEvent, RaceState } from './sim'

interface CourseEntry {
  meta: { id: string; name: string; area: string; botTime: number | null }
  course: CourseData
}
const ALL = coursesJson as unknown as CourseEntry[]
const NAME_KEY = 'rc-name'
const TABS = ['race', 'board', 'rules'] as const
type Tab = (typeof TABS)[number]

type Phase =
  | { kind: 'setup' }
  | { kind: 'racing'; session: string | null; run: number }
  | { kind: 'saving'; final: RaceState }
  | { kind: 'result'; final: RaceState; server: SubmitResult | null; error?: string }

function useCourses() {
  const [rows, setRows] = useState<CourseRow[] | null>(null)
  const [offline, setOffline] = useState(!online())
  useEffect(() => {
    if (!online()) {
      setRows(ALL.map((c, i) => ({ id: c.meta.id, name: c.meta.name, area: c.meta.area, active: true, is_current: i === 0, sort: i })))
      return
    }
    listCourses()
      .then((r) => setRows(r.filter((c) => c.active && ALL.some((a) => a.meta.id === c.id))))
      .catch(() => {
        setOffline(true)
        setRows(ALL.map((c, i) => ({ id: c.meta.id, name: c.meta.name, area: c.meta.area, active: true, is_current: i === 0, sort: i })))
      })
  }, [])
  const current = rows?.find((r) => r.is_current) ?? rows?.[0]
  return { rows, current, offline }
}

export function RaceModule() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const req = search.get('tab')
  const tab: Tab = (TABS as readonly string[]).includes(req ?? '') ? (req as Tab) : 'race'
  const { rows, current, offline } = useCourses()
  const [courseId, setCourseId] = useState<string | null>(null)
  const selected = courseId ?? current?.id ?? null

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/" className="text-sm text-sea-500 hover:underline">
        ← {t('common.home')}
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 dark:text-white">{t('game.race.title')}</h1>
      <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">{t('rc.intro')}</p>
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
            {t(`rc.tab.${k}` as MessageKey)}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {!rows ? (
          <p className="py-10 text-center text-sm text-slate-500">…</p>
        ) : tab === 'race' ? (
          <RaceTab t={t} rows={rows} selected={selected} onSelect={setCourseId} offline={offline} showBoard={() => setSearch({ tab: 'board' }, { replace: true })} />
        ) : tab === 'board' ? (
          <BoardTab t={t} rows={rows} selected={selected} onSelect={setCourseId} offline={offline} />
        ) : (
          <RaceRules t={t} />
        )}
      </div>
    </div>
  )
}

function CoursePicker({ t, rows, selected, onSelect }: { t: Translate; rows: CourseRow[]; selected: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('rc.course')}>
      {rows.map((r) => (
        <button
          key={r.id}
          type="button"
          role="radio"
          aria-checked={selected === r.id}
          onClick={() => onSelect(r.id)}
          className={`rounded-xl border px-3 py-2 text-left text-sm transition ${selected === r.id ? 'border-navy-900 bg-navy-900 text-white dark:border-sea-500 dark:bg-sea-500' : 'border-slate-200 bg-white hover:border-slate-400 dark:border-white/10 dark:bg-navy-900/60'}`}
        >
          <span className="block font-semibold">
            {r.name} {r.is_current && <span className="ml-1 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-950">{t('rc.current')}</span>}
          </span>
          <span className={`block text-xs ${selected === r.id ? 'text-sky-100' : 'text-slate-500'}`}>{r.area}</span>
        </button>
      ))}
    </div>
  )
}

function RaceTab({ t, rows, selected, onSelect, offline, showBoard }: { t: Translate; rows: CourseRow[]; selected: string | null; onSelect: (id: string) => void; offline: boolean; showBoard: () => void }) {
  const entry = useMemo(() => ALL.find((c) => c.meta.id === selected) ?? null, [selected])
  const [name, setName] = useState(() => loadJson<string>(NAME_KEY, ''))
  const [phase, setPhase] = useState<Phase>({ kind: 'setup' })
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [run, setRun] = useState(0)
  const [lastPractice, setLastPractice] = useState(false)

  const begin = async (practice = false) => {
    if (!entry) return
    setError(null)
    const clean = name.trim().replace(/\s+/g, ' ')
    if (!practice && (clean.length < 2 || clean.length > 24)) {
      setError(t('rc.err.name'))
      return
    }
    saveJson(NAME_KEY, clean)
    setLastPractice(practice)
    let session: string | null = null
    if (!practice && !offline) {
      setBusy(true)
      try {
        session = await startRace(entry.meta.id, clean)
      } catch (e) {
        setBusy(false)
        setError(t(errorKey((e as Error).message)))
        return
      }
      setBusy(false)
    }
    setRun((r) => r + 1)
    setPhase({ kind: 'racing', session, run: run + 1 })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const finish = useCallback(
    async (final: RaceState, events: HelmEvent[], session: string | null) => {
      if (!session || final.status !== 'finished') {
        setPhase({ kind: 'result', final, server: null })
        return
      }
      setPhase({ kind: 'saving', final })
      try {
        const server = await submitRace(session, events)
        setPhase({ kind: 'result', final, server })
      } catch (e) {
        setPhase({ kind: 'result', final, server: null, error: (e as Error).message })
      }
    },
    [],
  )

  if (!entry) return <p className="text-sm text-slate-500">{t('rc.noCourses')}</p>

  if (phase.kind === 'racing') {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm">
            <strong>{entry.meta.name}</strong> · {entry.meta.area}
            {!phase.session && <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-white/10">{t('rc.practice')}</span>}
          </p>
          <button type="button" className="btn-secondary" onClick={() => setPhase({ kind: 'setup' })}>
            {t('rc.abandon')}
          </button>
        </div>
        <RaceGame key={phase.run} course={entry.course} t={t} onEnd={(final, events) => void finish(final, events, phase.session)} />
      </div>
    )
  }

  if (phase.kind === 'saving' || phase.kind === 'result') {
    return <ResultView t={t} entry={entry} phase={phase} name={name.trim()} again={() => void begin(lastPractice)} setup={() => setPhase({ kind: 'setup' })} showBoard={showBoard} />
  }

  const w = entry.course.wind
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-5">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t('rc.course')}</h2>
          <div className="mt-2">
            <CoursePicker t={t} rows={rows} selected={selected} onSelect={onSelect} />
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-navy-900/60">
          <h3 className="font-semibold">
            {entry.meta.name} <span className="font-normal text-slate-500">· {entry.meta.area}</span>
          </h3>
          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
            <dt className="text-slate-500">{t('rc.wind')}</dt>
            <dd className="font-mono">
              {w.dir}° · {w.speed} kn
            </dd>
            <dt className="text-slate-500">{t('rc.beat')}</dt>
            <dd className="font-mono">{entry.course.legM} m</dd>
            <dt className="text-slate-500">{t('rc.par')}</dt>
            <dd className="font-mono">{formatRaceTime(entry.meta.botTime)}</dd>
            <dt className="text-slate-500">{t('rc.order')}</dt>
            <dd className="font-mono text-xs">{['S', ...entry.course.legs.map((l) => l.label)].join(' → ')}</dd>
            <dt className="text-slate-500">{t('rc.type')}</dt>
            <dd>{t(entry.course.type === 'triangle' ? 'rc.type.triangle' : 'rc.type.wl')}</dd>
          </dl>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t('rc.briefing')}</p>
        </section>
      </div>
      <aside className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-navy-900/60">
        <label className="block text-sm font-medium" htmlFor="rc-name">
          {t('rc.yourName')}
        </label>
        <input
          id="rc-name"
          value={name}
          maxLength={24}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void begin()}
          placeholder={t('rc.namePlaceholder')}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-white/20 dark:bg-navy-900"
        />
        <p className="text-xs text-slate-500">{t('rc.nameHelp')}</p>
        {error && <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
        <button type="button" className="btn-primary w-full py-2.5 text-base" disabled={busy} onClick={() => void begin()}>
          {busy ? '…' : `⛵ ${t('rc.start')}`}
        </button>
        <button type="button" className="btn-secondary w-full" onClick={() => void begin(true)}>
          {t('rc.practiceStart')}
        </button>
        {offline && <p className="text-xs text-amber-700">{t('rc.offline')}</p>}
        <p className="text-xs text-slate-500">{t('rc.fair')}</p>
      </aside>
    </div>
  )
}

function ResultView({
  t,
  entry,
  phase,
  name,
  again,
  setup,
  showBoard,
}: {
  t: Translate
  entry: CourseEntry
  phase: Extract<Phase, { kind: 'saving' | 'result' }>
  name: string
  again: () => void
  setup: () => void
  showBoard: () => void
}) {
  const f = phase.final
  const server = phase.kind === 'result' ? phase.server : null
  const time = server?.time ?? f.finishTime
  const finished = f.status === 'finished'
  const [board, setBoard] = useState<BoardRow[] | null>(null)
  useEffect(() => {
    if (phase.kind === 'result' && online()) leaderboard(entry.meta.id).then(setBoard).catch(() => setBoard(null))
  }, [phase.kind, entry.meta.id])

  const headline = finished
    ? t('rc.res.finished')
    : f.status === 'crashed'
      ? t('rc.res.crashed')
      : f.status === 'outside'
        ? t('rc.res.outside')
        : t('rc.res.timeout')
  const avg = finished && time ? ((f.distance / time) * 3600) / 1852 : null

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section className={`rounded-2xl border p-6 ${finished ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-950/30' : 'border-rose-200 bg-rose-50 dark:border-rose-400/20 dark:bg-rose-950/30'}`}>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{entry.meta.name}</p>
        <h2 className="mt-1 text-2xl font-bold text-navy-900 dark:text-white">{headline}</h2>
        {finished && <p className="mt-2 font-mono text-5xl font-bold tabular-nums text-navy-900 dark:text-white">{formatRaceTime(time)}</p>}
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-slate-500">{t('rc.tacks')}</dt>
            <dd className="text-xl font-semibold">{server?.tacks ?? f.tacks}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t('rc.gybes')}</dt>
            <dd className="text-xl font-semibold">{server?.gybes ?? f.gybes}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t('rc.distance')}</dt>
            <dd className="text-xl font-semibold">{Math.round(server?.distance ?? f.distance)} m</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t('rc.avgSpeed')}</dt>
            <dd className="text-xl font-semibold">{avg ? `${avg.toFixed(1)} kn` : '–'}</dd>
          </div>
        </dl>
        <div className="mt-4 space-y-1 text-sm">
          {phase.kind === 'saving' && <p>{t('rc.res.saving')}</p>}
          {server?.accepted === false && <p className="text-rose-700">{t(server.reason === 'expired' ? 'rc.res.expired' : 'rc.res.tooFast')}</p>}
          {server?.accepted && finished && (
            <>
              <p className="text-lg font-semibold">
                {server.on_board ? t('rc.res.rank', { rank: server.rank ?? '?', size: server.board_size ?? '?' }) : t('rc.res.offBoard')}
              </p>
              {server.personal_best ? <p>🏆 {t('rc.res.pb')}</p> : <p>{t('rc.res.notPb', { best: formatRaceTime(server.best_time) })}</p>}
            </>
          )}
          {phase.kind === 'result' && !server && finished && <p className="text-slate-600">{phase.error ? t('rc.err.generic') : t('rc.res.practice')}</p>}
          {entry.meta.botTime && finished && time && <p className="text-slate-600">{time <= entry.meta.botTime ? t('rc.res.beatPar') : t('rc.res.par', { par: formatRaceTime(entry.meta.botTime) })}</p>}
          {!finished && <p className="text-slate-600">{t(`rc.tip.${f.status}` as MessageKey)}</p>}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={again}>
            ↻ {t('rc.again')}
          </button>
          <button type="button" className="btn-secondary" onClick={setup}>
            {t('rc.otherCourse')}
          </button>
          <button type="button" className="btn-secondary" onClick={showBoard}>
            🏁 {t('rc.tab.board')}
          </button>
        </div>
      </section>
      <aside>{board && <BoardTable t={t} rows={board.slice(0, 10)} highlight={name} compact />}</aside>
    </div>
  )
}

function BoardTable({ t, rows, highlight, compact = false }: { t: Translate; rows: BoardRow[]; highlight?: string; compact?: boolean }) {
  if (!rows.length) return <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">{t('rc.board.empty')}</p>
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-navy-900/60">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-white/5">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">{t('rc.board.name')}</th>
            <th className="px-3 py-2 text-right">{t('rc.board.time')}</th>
            <th className="hidden px-3 py-2 text-right sm:table-cell">{t('rc.tacks')}</th>
            <th className="hidden px-3 py-2 text-right sm:table-cell">{t('rc.gybes')}</th>
            {!compact && <th className="hidden px-3 py-2 text-right md:table-cell">{t('rc.board.date')}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className={`border-t border-slate-100 dark:border-white/5 ${highlight && r.name.toLowerCase() === highlight.toLowerCase() ? 'bg-amber-50 font-semibold dark:bg-amber-400/10' : ''}`}>
              <td className="px-3 py-1.5">{i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td>
              <td className="px-3 py-1.5">{r.name}</td>
              <td className="px-3 py-1.5 text-right font-mono">{formatRaceTime(r.time_s)}</td>
              <td className="hidden px-3 py-1.5 text-right sm:table-cell">{r.tacks}</td>
              <td className="hidden px-3 py-1.5 text-right sm:table-cell">{r.gybes}</td>
              {!compact && <td className="hidden px-3 py-1.5 text-right text-xs text-slate-500 md:table-cell">{new Date(r.created_at).toLocaleDateString()}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BoardTab({ t, rows, selected, onSelect, offline }: { t: Translate; rows: CourseRow[]; selected: string | null; onSelect: (id: string) => void; offline: boolean }) {
  const [board, setBoard] = useState<BoardRow[] | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (!selected || offline) return
    setBoard(null)
    setFailed(false)
    leaderboard(selected).then(setBoard).catch(() => setFailed(true))
  }, [selected, offline])
  const me = loadJson<string>(NAME_KEY, '')
  return (
    <div className="space-y-4">
      <CoursePicker t={t} rows={rows} selected={selected} onSelect={onSelect} />
      {offline || failed ? <p className="text-sm text-amber-700">{t('rc.offline')}</p> : board ? <BoardTable t={t} rows={board} highlight={me} /> : <p className="text-sm text-slate-500">…</p>}
      <p className="text-xs text-slate-500">{t('rc.board.note')}</p>
    </div>
  )
}
