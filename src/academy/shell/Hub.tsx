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
  id: 'navigation' | 'marks' | 'rules' | 'handling' | 'communication' | 'celestial'
  modules: ModuleCard[]
}

/** RYA courses in the order they are taken. */
const COURSES = [
  { id: 'ryaCompetentCrew', path: '/rya/competent-crew', icon: '🧑‍✈️', level: 'hub.rya.level1' },
  { id: 'ryaDaySkipper', path: '/rya/day-skipper', icon: '⚓', level: 'hub.rya.level2' },
] as const

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
      { id: 'race', path: '/race', icon: '🏁' },
    ],
  },
  { id: 'communication', modules: [{ id: 'vhf', path: '/rya/learn/radio', icon: '📻' }] },
  {
    id: 'celestial',
    modules: [
      { id: 'sextant', path: '/sextant', icon: '🌞' },
      { id: 'celestialFix', path: '/sextant?tab=fix', icon: '📍' },
      { id: 'sextant3d', path: '/sextant?tab=3d', icon: '🔭' },
      { id: 'almanac', path: '/sextant?tab=almanac', icon: '📖' },
      { id: 'celestialMethods', path: '/sextant?tab=methods', icon: '✨' },
    ],
  },
]

export function Hub() {
  const { t } = useI18n()
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-navy-900 dark:text-white">{t('hub.title')}</h1>
      <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{t('hub.intro')}</p>
      <Curriculum />
      <div className="mt-10 border-t border-slate-200 pt-6 dark:border-white/10">
        <h2 className="text-xl font-bold tracking-tight text-navy-900 dark:text-white">{t('hub.topics')}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('hub.topicsIntro')}</p>
      </div>
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

function Curriculum() {
  const { t } = useI18n()
  return (
    <section className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-700 to-sky-800 p-5 text-white shadow-lg sm:p-7">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">🎓 {t('hub.rya.badge')}</div>
      <h2 className="mt-3 text-2xl font-bold tracking-tight">{t('hub.section.rya')}</h2>
      <p className="mt-1 max-w-2xl text-sm text-sky-100">{t('hub.rya.intro')}</p>
      <Link to="/rya" className="mt-5 flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/20 transition hover:bg-white/20">
        <span className="text-2xl" aria-hidden>
          🗺️
        </span>
        <span className="flex-1">
          <span className="block font-semibold">{t('game.ryaSyllabus.title')}</span>
          <span className="block text-xs text-sky-100">{t('hub.rya.roadmap')}</span>
        </span>
        <span aria-hidden>→</span>
      </Link>
      <ol className="mt-4 grid items-stretch gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        {COURSES.map((c, i) => (
          <li key={c.id} className="contents">
            {i > 0 && (
              <span className="self-center justify-self-center text-2xl text-sky-200" aria-hidden>
                <span className="md:hidden">↓</span>
                <span className="hidden md:inline">→</span>
              </span>
            )}
            <Link to={c.path} className="flex flex-col rounded-xl bg-white p-5 text-navy-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-navy-900 dark:text-white dark:ring-1 dark:ring-white/15">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sea-500 text-sm font-bold text-white">{i + 1}</span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-sea-500">{t('hub.rya.step', { n: i + 1 })}</div>
                  <h3 className="text-lg font-semibold leading-tight">
                    <span aria-hidden>{c.icon}</span> {t(`game.${c.id}.title` as MessageKey)}
                  </h3>
                </div>
              </div>
              <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{t(c.level)}</div>
              <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-300">{t(`game.${c.id}.desc` as MessageKey)}</p>
              <div className="mt-4 text-sm font-semibold text-sea-500">{t('hub.rya.start')} →</div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
