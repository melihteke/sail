import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { MessageKey } from '../../i18n/en'
import { useI18n } from '../../i18n'
import { getBest, getPreferredMode, setPreferredMode, type Mode } from './progress'
import { groups, scenarios } from './scenarios'

const difficultyClass = {
  easy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  hard: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200',
}

export function RoutePlannerHome() {
  const { t } = useI18n()
  const [mode, setMode] = useState<Mode>(getPreferredMode)

  const choose = (m: Mode) => {
    setMode(m)
    setPreferredMode(m)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/" className="text-sm text-sea-500 hover:underline">
        ← {t('common.home')}
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 dark:text-white">
        {t('game.routePlanner.title')}
      </h1>
      <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">{t('rp.homeIntro')}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_18rem]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-navy-900/60">
          <h2 className="font-semibold">{t('rp.howTo')}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
            <li>{t('rp.howTo1')}</li>
            <li>{t('rp.howTo2')}</li>
            <li>{t('rp.howTo3')}</li>
            <li>{t('rp.howTo4')}</li>
          </ul>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-navy-900/60">
          <h2 className="font-semibold">{t('rp.mode')}</h2>
          <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-white/5" role="radiogroup">
            {(['learning', 'challenge'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                onClick={() => choose(m)}
                className={`rounded-md px-2 py-1.5 text-sm font-medium ${
                  mode === m ? 'bg-white shadow dark:bg-navy-700' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t(`rp.mode.${m}`)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t(`rp.mode.${mode}Desc`)}</p>
        </section>
      </div>

      <Link
        to="/route-planner/free"
        className="mt-8 flex items-center gap-4 rounded-xl border-2 border-dashed border-sea-500 bg-sea-100 p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-navy-900"
      >
        <span className="text-4xl" aria-hidden>
          🌍
        </span>
        <span>
          <span className="block text-lg font-semibold">{t('scenario.free.title')}</span>
          <span className="block text-sm text-slate-600 dark:text-slate-300">{t('scenario.free.desc')}</span>
        </span>
      </Link>

      {groups.map((g) => (
        <section key={g}>
          <h2 className="mt-8 text-xl font-semibold">{t(`rp.group.${g}`)}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t(`rp.group.${g}Desc`)}</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {scenarios
              .filter((s) => s.group === g)
              .map((s) => {
          const best = getBest(s.id, mode)
          return (
            <Link
              key={s.id}
              to={`/route-planner/${s.id}?mode=${mode}`}
              className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-navy-900/60"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{t(`scenario.${s.id}.title` as MessageKey)}</h3>
                <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${difficultyClass[s.difficulty]}`}>
                  {t(`rp.difficulty.${s.difficulty}`)}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {t(`scenario.${s.id}.desc` as MessageKey)}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  {t('rp.wind')}: {t('rp.windFrom', { deg: s.env.windFromDeg })} · {s.env.windSpeedKn} {t('common.kn')}
                </span>
                {s.env.currentSpeedKn > 0 && (
                  <span>
                    {t('rp.current')}: {t('rp.currentTo', { deg: s.env.currentSetDeg })} · {s.env.currentSpeedKn}{' '}
                    {t('common.kn')}
                  </span>
                )}
              </div>
              <div className="mt-3 text-sm font-medium">
                {best !== undefined ? (
                  <span className="text-sea-500">{t('rp.best', { score: best })}</span>
                ) : (
                  <span className="text-slate-400">{t('rp.notPlayed')}</span>
                )}
              </div>
            </Link>
          )
        })}
          </div>
        </section>
      ))}
    </div>
  )
}
