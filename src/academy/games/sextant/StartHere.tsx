import type { MessageKey } from '../../i18n/en'
import type { Translate } from '../../i18n'
import { Card, Why } from './ui'

/** Earth with parallel sun rays: the further from the GP, the lower the sun. */
function SunHeightDrawing({ t }: { t: Translate }) {
  const cx = 150
  const cy = 300
  const R = 200
  const people = [
    { th: 0, label: '90°' },
    { th: 30, label: '60°' },
    { th: 60, label: '30°' },
  ]
  return (
    <svg viewBox="0 0 400 230" className="w-full" role="img" aria-label={t('cn.start.figA')}>
      <rect width="400" height="230" fill="#e0f2fe" rx="12" />
      {[40, 105, 215, 290, 370].map((x) => (
        <line key={x} x1={x} y1="28" x2={x} y2="70" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 4" />
      ))}
      <text x="200" y="18" fontSize="12" textAnchor="middle" fill="#b45309" fontWeight="600">
        ☀ {t('cn.start.rays')}
      </text>
      <path d={`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="#1d5f8c" />
      {people.map(({ th, label }) => {
        const a = (th * Math.PI) / 180
        const x = cx + Math.sin(a) * R
        const y = cy - Math.cos(a) * R
        const tx = Math.cos(a)
        const ty = Math.sin(a)
        const alt = 90 - th
        const arc = 26
        // Altitude is measured from the horizon on the side facing the sun, up to the (vertical) sun ray.
        const end = { x: x - tx * arc, y: y - ty * arc }
        const up = { x, y: y - arc }
        return (
          <g key={th}>
            <line x1={x - tx * 40} y1={y - ty * 40} x2={x + tx * 40} y2={y + ty * 40} stroke="#0f172a" strokeWidth="1.5" />
            <line x1={x} y1={y} x2={x} y2={y - 70} stroke="#f59e0b" strokeWidth="2" />
            {alt < 90 && <path d={`M${end.x} ${end.y} A${arc} ${arc} 0 0 1 ${up.x} ${up.y}`} fill="none" stroke="#b45309" />}
            <circle cx={x} cy={y} r="5" fill={th === 0 ? '#dc2626' : '#0b3a5c'} stroke="#fff" />
            <text x={th === 0 ? x + 8 : x - 34} y={y - 34} fontSize="13" fontWeight="700" fill="#b45309" textAnchor={th === 0 ? 'start' : 'end'}>
              {label}
            </text>
            <text x={x} y={y + 22} fontSize="10" textAnchor="middle" fill="#fff">
              {th === 0 ? 'GP' : `${th * 60} nm`}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Two circles of equal altitude around two GPs cross at the observer. */
function CirclesDrawing({ t }: { t: Translate }) {
  return (
    <svg viewBox="0 0 400 230" className="w-full" role="img" aria-label={t('cn.start.figB')}>
      <rect width="400" height="230" fill="#e0f2fe" rx="12" />
      <circle cx="200" cy="118" r="105" fill="#1d5f8c" />
      <ellipse cx="160" cy="105" rx="70" ry="52" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
      <ellipse cx="250" cy="120" rx="62" ry="48" fill="none" stroke="#a78bfa" strokeWidth="2.5" />
      <circle cx="160" cy="105" r="5" fill="#f59e0b" />
      <text x="160" y="98" fontSize="10" textAnchor="middle" fill="#fde68a">GP 1</text>
      <circle cx="250" cy="120" r="5" fill="#a78bfa" />
      <text x="250" y="113" fontSize="10" textAnchor="middle" fill="#ede9fe">GP 2</text>
      <circle cx="201" cy="64" r="7" fill="#16a34a" stroke="#fff" strokeWidth="2" />
      <text x="212" y="58" fontSize="12" fontWeight="700" fill="#fff">{t('cn.start.you')}</text>
      <circle cx="198" cy="153" r="4" fill="none" stroke="#fff" strokeDasharray="2 2" />
      <text x="208" y="170" fontSize="9" fill="#e2e8f0">{t('cn.start.other')}</text>
    </svg>
  )
}

const KID = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] as const
const JOB = ['ie', 'when', 'measure', 'correct', 'almanac', 'lat', 'lon', 'plot'] as const

export function StartHere({ t, goTo }: { t: Translate; goTo: (tab: string) => void }) {
  return (
    <div className="space-y-6">
      <Why title={t('cn.start.whyTitle')}>
        <p>{t('cn.start.why1')}</p>
        <p>{t('cn.start.why2')}</p>
      </Why>

      <section>
        <h2 className="text-xl font-semibold text-navy-900 dark:text-white">{t('cn.start.kidTitle')}</h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <ol className="space-y-3">
            {KID.map((k, i) => (
              <li key={k} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">{i + 1}</span>
                <div>
                  <p className="font-semibold">{t(`cn.start.${k}.t` as MessageKey)}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{t(`cn.start.${k}` as MessageKey)}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="space-y-4">
            <figure>
              <SunHeightDrawing t={t} />
              <figcaption className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('cn.start.figA')}</figcaption>
            </figure>
            <figure>
              <CirclesDrawing t={t} />
              <figcaption className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('cn.start.figB')}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <Card>
        <h2 className="font-semibold">{t('cn.start.numbersTitle')}</h2>
        <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
          {(['n1', 'n2', 'n3', 'n4'] as const).map((k) => (
            <li key={k}>• {t(`cn.start.${k}` as MessageKey)}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-semibold">{t('cn.start.jobTitle')}</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {JOB.map((s) => (
            <li key={s}>
              <strong>{t(`cn.fix.step.${s}` as MessageKey)}</strong>: {t(`cn.fix.plan.${s}` as MessageKey)}
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={() => goTo('fix')}>
            🧭 {t('cn.start.goFix')}
          </button>
          <button type="button" className="btn-secondary" onClick={() => goTo('3d')}>
            🔭 {t('cn.start.go3d')}
          </button>
          <button type="button" className="btn-secondary" onClick={() => goTo('almanac')}>
            📖 {t('cn.start.goAlmanac')}
          </button>
          <button type="button" className="btn-secondary" onClick={() => goTo('glossary')}>
            🔤 {t('cn.start.goGlossary')}
          </button>
        </div>
      </Card>

      <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-400/30 dark:bg-rose-950/40 dark:text-rose-200">⚠️ {t('cn.start.safety')}</p>
    </div>
  )
}
