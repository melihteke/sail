import { Link } from 'react-router-dom'
import type { MessageKey } from '../i18n/en'
import { useI18n } from '../i18n'

interface ModuleCard {
  id: string
  path: string
  icon: string
  comingSoon?: boolean
}

interface Section {
  id: 'navigation' | 'marks' | 'rules' | 'handling' | 'celestial'
  modules: ModuleCard[]
}

const sections: Section[] = [
  {
    id: 'navigation',
    modules: [
      { id: 'routePlanner', path: '/route-planner', icon: '🧭' },
      { id: 'navplan', path: '/nav-planner', icon: '🗺️' },
      { id: 'passage', path: '/nautical-marks?tab=passage', icon: '⚓' },
    ],
  },
  {
    id: 'marks',
    modules: [
      { id: 'nauticalMarks', path: '/nautical-marks', icon: '🛟' },
      { id: 'lights', path: '/nautical-marks?tab=lights', icon: '💡' },
    ],
  },
  { id: 'rules', modules: [{ id: 'colreg', path: '/colreg', icon: '🚢' }] },
  {
    id: 'handling',
    modules: [
      { id: 'mob', path: '/man-overboard', icon: '🆘' },
      { id: 'trim', path: '/sail-trim', icon: '⛵' },
      { id: 'race', path: '', icon: '🏁', comingSoon: true },
    ],
  },
  { id: 'celestial', modules: [{ id: 'sextant', path: '/sextant', icon: '🌞' }] },
]

export function Hub() {
  const { t } = useI18n()
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-navy-900 dark:text-white">{t('hub.title')}</h1>
      <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{t('hub.intro')}</p>
      {sections.map((s) => (
        <section key={s.id} className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t(`hub.section.${s.id}`)}</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.modules.map((g) =>
              g.comingSoon ? (
                <div
                  key={g.id}
                  aria-disabled="true"
                  className="relative block rounded-xl border border-dashed border-slate-300 bg-white/60 p-5 dark:border-white/15 dark:bg-navy-900/30"
                >
                  <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                    {t('common.comingSoon')}
                  </span>
                  <div className="text-3xl opacity-70" aria-hidden>
                    {g.icon}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{t(`game.${g.id}.title` as MessageKey)}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(`game.${g.id}.desc` as MessageKey)}</p>
                </div>
              ) : (
              <Link
                key={g.id}
                to={g.path}
                className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-navy-900/60"
              >
                <div className="text-3xl" aria-hidden>
                  {g.icon}
                </div>
                <h3 className="mt-3 text-lg font-semibold">{t(`game.${g.id}.title` as MessageKey)}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(`game.${g.id}.desc` as MessageKey)}</p>
                <div className="mt-4 text-sm font-medium text-sea-500">{t('common.open')} →</div>
              </Link>
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
