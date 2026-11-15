import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { MessageKey } from '../../i18n/en'
import { useI18n, type Translate } from '../../i18n'
import { loadJson, saveJson } from '../../lib/storage'
import { courses, COURSE_IDS } from './courses'
import { gameStars } from './progress'
import { lessonMeta } from './lessons/lessons'
import { LessonCards } from './lessons/LessonPage'
import { checkStep, emptyExperience, FLAG_REQS, NUMERIC_REQS, readyIndex, roadmap, type Experience, type RoadStep, type StepId } from './roadmap'
import { Panel, StarsView } from './ui'

const XP_KEY = 'rya-experience'

const NODE_X = [70, 210, 350, 500, 650, 800, 935]
const NODE_Y = [150, 95, 140, 85, 135, 80, 125]

const stepKey = (id: StepId, part: string) => `rya.step.${id}.${part}` as MessageKey
const bullets = (s: string) => s.split('|').map((x) => x.trim()).filter(Boolean)

export function RyaSyllabus() {
  const { t } = useI18n()
  const [xp, setXp] = useState<Experience>(() => ({ ...emptyExperience, ...loadJson<Partial<Experience>>(XP_KEY, {}) }))
  const [selected, setSelected] = useState<StepId>('competentCrew')
  const here = readyIndex(xp)
  const update = (patch: Partial<Experience>) => {
    const next = { ...xp, ...patch }
    setXp(next)
    saveJson(XP_KEY, next)
  }
  const step = roadmap.find((s) => s.id === selected)!

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/" className="text-sm text-sea-500 hover:underline">
        ← {t('common.home')}
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 dark:text-white">{t('rya.title')}</h1>
      <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">{t('rya.intro')}</p>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('rya.road.title')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('rya.road.hint')}</p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-gradient-to-b from-sky-50 to-sky-100 dark:border-white/10 dark:from-navy-900 dark:to-navy-950">
          <Roadmap t={t} selected={selected} onSelect={setSelected} here={here} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_20rem]">
        <StepDetail t={t} step={step} xp={xp} />
        <Calculator t={t} xp={xp} update={update} here={here} />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('rya.courses.title')}</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {COURSE_IDS.map((c) => (
            <CourseCard key={c} t={t} id={c} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('rya.lessons.title')}</h2>
          <Link to="/rya/learn" className="text-sm font-medium text-sea-500 hover:underline">
            {t('rya.lessons.all')} →
          </Link>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('rya.lessons.intro')}</p>
        <div className="mt-3">
          <LessonCards items={lessonMeta} />
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {(['practical', 'theory', 'logbook', 'charter'] as const).map((k) => (
          <Panel key={k}>
            <h3 className="font-semibold">{t(`rya.note.${k}.title`)}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(`rya.note.${k}.text`)}</p>
          </Panel>
        ))}
      </section>
      <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">{t('rya.disclaimer')}</p>
    </div>
  )
}

function Roadmap({ t, selected, onSelect, here }: { t: Translate; selected: StepId; onSelect: (s: StepId) => void; here: number }) {
  const path = useMemo(() => {
    let d = `M${NODE_X[0]} ${NODE_Y[0]}`
    for (let i = 1; i < NODE_X.length; i++) {
      const mx = (NODE_X[i - 1] + NODE_X[i]) / 2
      d += ` C${mx} ${NODE_Y[i - 1]} ${mx} ${NODE_Y[i]} ${NODE_X[i]} ${NODE_Y[i]}`
    }
    return d
  }, [])
  const theory: { from: number; to: number; key: MessageKey; row: number }[] = [
    { from: 1, to: 1, key: 'rya.theory.essential', row: 0 },
    { from: 2, to: 2, key: 'rya.theory.daySkipperTheory', row: 1 },
    { from: 3, to: 5, key: 'rya.theory.coastalTheory', row: 0 },
    { from: 6, to: 6, key: 'rya.theory.oceanTheory', row: 1 },
  ]
  return (
    <svg viewBox="0 0 1000 320" className="rya-roadmap block min-w-[760px]" role="img" aria-label={t('rya.road.title')}>
      <defs>
        <radialGradient id="rm-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="60%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rm-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7cc4e4" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1e9bd7" stopOpacity="0.15" />
        </linearGradient>
        <path id="rm-wave" d={`M-120 0${' q10 -5 20 0 q10 5 20 0'.repeat(32)}`} />
      </defs>

      {/* sky */}
      <g className="rm-sun dark:opacity-30">
        <circle cx="52" cy="40" r="34" fill="url(#rm-sun)" className="rm-glow" />
        <circle cx="52" cy="40" r="13" fill="#fcd34d" />
      </g>
      {[0, 1].map((c) => (
        <g key={c} className={`rm-cloud rm-cloud-${c} opacity-80 dark:opacity-15`}>
          <g transform={`translate(0 ${c ? 34 : 22}) scale(${c ? 0.7 : 1})`}>
            <ellipse cx="0" cy="0" rx="30" ry="11" fill="#fff" />
            <ellipse cx="16" cy="-7" rx="18" ry="11" fill="#fff" />
            <ellipse cx="-14" cy="-4" rx="14" ry="8" fill="#fff" />
          </g>
        </g>
      ))}
      {[0, 1].map((g) => (
        <g key={g} className={`rm-gull rm-gull-${g}`}>
          <g transform={`translate(0 ${g ? 26 : 14})`}>
            <path className="rm-wing" d="M-8 0 Q-4 -5 0 0 Q4 -5 8 0" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </g>
      ))}

      {/* sea */}
      <rect x="0" y="198" width="1000" height="30" fill="url(#rm-sea)" />
      <g className="rm-waves-a" opacity="0.5">
        <use href="#rm-wave" y="204" fill="none" stroke="#1e9bd7" strokeWidth="1.5" />
      </g>
      <g className="rm-waves-b" opacity="0.35">
        <use href="#rm-wave" y="216" fill="none" stroke="#0b3a5c" strokeWidth="1.2" />
      </g>

      {/* route: still to go (flowing dashes) and already reached */}
      <path d={path} fill="none" stroke="#1e9bd7" strokeWidth="4" strokeDasharray="10 8" opacity="0.6" className="rm-flow" />
      <path
        d={path}
        fill="none"
        stroke="#0b3a5c"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="1000"
        strokeDashoffset={1000 - (here / 6) * 1000}
        opacity="0.85"
        pathLength={1000}
        style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }}
      />
      {roadmap.map((s, i) => {
        const x = NODE_X[i]
        const y = NODE_Y[i]
        const active = s.id === selected
        const available = !!s.path
        const fill = available ? '#1e9bd7' : s.kind === 'exam' ? '#f59e0b' : '#94a3b8'
        return (
          <g key={s.id} onClick={() => onSelect(s.id)} className="rm-node cursor-pointer" role="button" aria-label={t(stepKey(s.id, 'name'))}>
            {available && <circle cx={x} cy={y} r={22} fill="none" stroke={fill} strokeWidth="2" className="rm-pulse" style={{ animationDelay: `${i * 0.6}s` }} />}
            {active && <circle cx={x} cy={y} r={31} fill="none" stroke="#0b3a5c" strokeWidth="1.5" strokeDasharray="4 5" className="rm-spin dark:stroke-sky-200" />}
            <g className="rm-dot">
              <circle cx={x} cy={y} r={active ? 24 : 20} fill={fill} stroke={active ? '#0b3a5c' : '#fff'} strokeWidth={active ? 4 : 3} />
              <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">
                {i + 1}
              </text>
            </g>
            <text x={x} y={y - 34} textAnchor="middle" fontSize="13" fontWeight={active ? 700 : 600} className="fill-navy-900 dark:fill-white">
              {t(stepKey(s.id, 'short'))}
            </text>
            <text x={x} y={y + 42} textAnchor="middle" fontSize="11" className="fill-slate-500 dark:fill-slate-300">
              {s.kind === 'exam' ? t('rya.exam') : available ? t('rya.availableHere') : t('common.comingSoon')}
            </text>
          </g>
        )
      })}

      {/* the boat sails to the step your experience reaches */}
      <g style={{ transform: `translate(${NODE_X[here]}px, ${NODE_Y[here] - 62}px)`, transition: 'transform 1.2s ease-in-out' }}>
        <g className="rm-bob">
          <path d="M0 -15 L0 9 M0 -15 L13 6 L0 6 Z" stroke="#0b3a5c" strokeWidth="2" fill="#fff" strokeLinejoin="round" />
          <path d="M0 -13 L-9 6 L0 6 Z" fill="#e3f3fb" stroke="#0b3a5c" strokeWidth="1.2" />
          <path d="M0 -15 L5 -13 L0 -11" fill="#dc2626" />
          <path d="M-14 9 L14 9 L9 16 L-9 16 Z" fill="#0b3a5c" />
        </g>
        <path d="M-20 19 q5 -3 10 0 t10 0 t10 0 t10 0" fill="none" stroke="#1e9bd7" strokeWidth="1.5" className="rm-wake" />
      </g>

      <line x1="40" x2="965" y1="240" y2="240" stroke="#94a3b8" strokeDasharray="3 5" />
      <text x="40" y="232" fontSize="11" className="fill-slate-500 dark:fill-slate-300">
        {t('rya.theory.track')}
      </text>
      {theory.map((th) => {
        const x1 = Math.max(8, NODE_X[th.from] - (th.from === th.to ? 115 : 55))
        const x2 = Math.min(992, NODE_X[th.to] + (th.from === th.to ? 115 : 55))
        const y = 250 + th.row * 32
        return (
          <g key={th.key}>
            <line x1={NODE_X[th.from]} x2={NODE_X[th.from]} y1={NODE_Y[th.from] + 50} y2={y} stroke="#1e9bd7" strokeDasharray="2 3" opacity="0.5" />
            <rect x={x1} y={y} width={x2 - x1} height={26} rx={13} fill="#e3f3fb" stroke="#1e9bd7" />
            <text x={(x1 + x2) / 2} y={y + 17} textAnchor="middle" fontSize="11" fill="#0b3a5c" fontWeight={600}>
              📘 {t(th.key)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function StepDetail({ t, step, xp }: { t: Translate; step: RoadStep; xp: Experience }) {
  const checks = checkStep(step, xp)
  return (
    <Panel>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold">{t(stepKey(step.id, 'name'))}</h2>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${step.kind === 'exam' ? 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300' : 'bg-sea-100 text-navy-900 dark:bg-sea-500/20 dark:text-sky-200'}`}>
          {step.kind === 'exam' ? t('rya.exam') : t('rya.course')}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t(stepKey(step.id, 'what'))}</p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        {step.courseDays && (
          <div>
            <dt className="text-xs text-slate-500">{t('rya.duration')}</dt>
            <dd className="font-medium">{t('rya.days', { n: step.courseDays })}</dd>
          </div>
        )}
        {step.minAge && (
          <div>
            <dt className="text-xs text-slate-500">{t('rya.minAge')}</dt>
            <dd className="font-medium">{step.minAge}+</dd>
          </div>
        )}
        {step.theory && (
          <div>
            <dt className="text-xs text-slate-500">{t('rya.theory')}</dt>
            <dd className="font-medium">{t(`rya.theory.${step.theory}`)}</dd>
          </div>
        )}
      </dl>
      <h3 className="mt-4 text-sm font-semibold">{t('rya.before')}</h3>
      {checks.length === 0 ? (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('rya.noPrereq')}</p>
      ) : (
        <ul className="mt-1 space-y-1 text-sm">
          {checks.map((c) => (
            <li key={c.key} className="flex items-center gap-2">
              <span className={c.met ? 'text-emerald-600' : 'text-slate-400'}>{c.met ? '✔' : '○'}</span>
              <span>{typeof c.need === 'number' ? t(`rya.req.${c.key}`, { n: c.need }) : t(`rya.req.${c.key}`)}</span>
              {typeof c.need === 'number' && !c.met && <span className="text-xs text-slate-500">({t('rya.missing', { n: c.need - (c.have as number) })})</span>}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t(stepKey(step.id, 'note'))}</p>
      <h3 className="mt-4 text-sm font-semibold">{t('rya.after')}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
        {bullets(t(stepKey(step.id, 'after'))).map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <div className="mt-4">
        {step.path ? (
          <Link to={step.path} className="btn-primary inline-block">
            {t('rya.openCourse')} →
          </Link>
        ) : (
          <span className="text-sm text-slate-500">{t('rya.later')}</span>
        )}
      </div>
    </Panel>
  )
}

function Calculator({ t, xp, update, here }: { t: Translate; xp: Experience; update: (p: Partial<Experience>) => void; here: number }) {
  const next = roadmap[here + 1]
  const missing = next ? checkStep(next, xp).filter((c) => !c.met) : []
  return (
    <Panel>
      <h2 className="font-semibold">{t('rya.calc.title')}</h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('rya.calc.hint')}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {NUMERIC_REQS.map((k) => (
          <label key={k} className="text-xs">
            <span className="text-slate-500">{t(`rya.calc.${k}`)}</span>
            <input
              type="number"
              min={0}
              value={xp[k] || ''}
              placeholder="0"
              onChange={(e) => update({ [k]: Math.max(0, Number(e.target.value) || 0) })}
              className="mt-0.5 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-white/20 dark:bg-white/5"
            />
          </label>
        ))}
      </div>
      <div className="mt-2 space-y-1">
        {FLAG_REQS.map((k) => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={xp[k]} onChange={(e) => update({ [k]: e.target.checked })} />
            {t(`rya.calc.${k}`)}
          </label>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-sea-100 p-3 text-sm text-navy-900 dark:bg-sea-500/15 dark:text-sky-100">
        <p>
          ⛵ {t('rya.calc.ready')} <strong>{t(stepKey(roadmap[here].id, 'name'))}</strong>
        </p>
        {next && (
          <p className="mt-1">
            {t('rya.calc.next', { step: t(stepKey(next.id, 'name')) })}{' '}
            {missing.map((c) => (typeof c.need === 'number' ? t(`rya.calc.more.${c.key}` as MessageKey, { n: c.need - (c.have as number) }) : t(`rya.req.${c.key}`))).join(' · ')}
          </p>
        )}
      </div>
    </Panel>
  )
}

function CourseCard({ t, id }: { t: Translate; id: (typeof COURSE_IDS)[number] }) {
  const c = courses[id]
  const stars = c.games.reduce((s, g) => s + gameStars(`${id}:${g.id}`, g.levels ?? []), 0)
  return (
    <Link
      to={`/rya/${id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-navy-900/60"
    >
      <div className="text-3xl" aria-hidden>
        {id === 'competent-crew' ? '🧑‍✈️' : '⚓'}
      </div>
      <h3 className="mt-3 text-lg font-semibold">{t(`rya.course.${id}.title`)}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(`rya.course.${id}.desc`)}</p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-slate-500">
          {t('rya.games', { n: c.games.length })} · <StarsView n={Math.round(stars / c.games.length)} />
        </span>
        <span className="font-medium text-sea-500">{t('common.open')} →</span>
      </div>
    </Link>
  )
}
