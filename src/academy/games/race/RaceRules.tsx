import type { MessageKey } from '../../i18n/en'
import type { Translate } from '../../i18n'

/** Schematic windward-leeward course: start, 1, 1a, leeward gate, finish upwind of the gate. */
function CourseDiagram({ t }: { t: Translate }) {
  const mark = (x: number, y: number, label: string, color = '#f97316') => (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-6 6 L-3.5 -7 Q0 -10 3.5 -7 L6 6 Q0 8.5 -6 6Z" fill={color} stroke="#7c2d12" strokeWidth="0.8" />
      <text x="9" y="-4" fontSize="11" fontWeight="700" fill="currentColor">
        {label}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 320 400" className="mx-auto w-full max-w-xs" role="img" aria-label={t('rc.rules.diagram')}>
      <rect width="320" height="400" rx="14" fill="#e0f2fe" />
      <g transform="translate(160 22)">
        <line y1="-10" y2="14" stroke="#0b3a5c" strokeWidth="3" />
        <path d="M0 20 L-6 10 L6 10Z" fill="#0b3a5c" />
        <text x="12" y="6" fontSize="10" fill="#0b3a5c">
          {t('rc.wind')}
        </text>
      </g>
      <path d="M150 290 C110 230 105 120 155 70 M150 64 C135 60 110 64 108 82 M100 92 C90 160 110 250 147 335 M160 345 C190 300 200 240 175 200" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#rc-arrow)" />
      <defs>
        <marker id="rc-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L10 5 L0 10Z" fill="#1d4ed8" />
        </marker>
      </defs>
      {mark(160, 62, '1')}
      {mark(105, 80, '1a', '#facc15')}
      {mark(125, 340, '4S')}
      {mark(175, 340, '4P')}
      <line x1="100" y1="295" x2="220" y2="295" stroke="#f97316" strokeWidth="2" strokeDasharray="6 4" />
      <g transform="translate(222 289)">
        <path d="M-8 6 H12 L9 10 H-5Z" fill="#fff" stroke="#334155" />
        <line x1="6" y1="6" x2="6" y2="-8" stroke="#334155" />
        <rect x="6" y="-8" width="8" height="5" fill="#f97316" />
      </g>
      <circle cx="98" cy="295" r="4" fill="#f97316" stroke="#334155" />
      <text x="230" y="312" fontSize="10" fill="currentColor">
        {t('rc.rules.start')}
      </text>
      <line x1="150" y1="200" x2="225" y2="200" stroke="#2563eb" strokeWidth="2" strokeDasharray="2 4" />
      <g transform="translate(227 194)">
        <path d="M-8 6 H12 L9 10 H-5Z" fill="#fff" stroke="#334155" />
        <line x1="6" y1="6" x2="6" y2="-8" stroke="#334155" />
        <rect x="6" y="-8" width="8" height="5" fill="#2563eb" />
      </g>
      <circle cx="148" cy="200" r="4" fill="#2563eb" stroke="#334155" />
      <text x="232" y="216" fontSize="10" fill="currentColor">
        {t('rc.rules.finish')}
      </text>
    </svg>
  )
}

const SEQUENCE = ['warning', 'prep', 'oneMinute', 'start'] as const
const RULES = ['r26', 'r29', 'r28', 'r10', 'r11', 'r13', 'r18', 'r31', 'r44'] as const
const TACTICS = ['shifts', 'puffs', 'laylines', 'startEnd', 'gate', 'shore'] as const

export function RaceRules({ t }: { t: Translate }) {
  return (
    <div className="space-y-8">
      <section className="grid items-start gap-6 md:grid-cols-[20rem_minmax(0,1fr)]">
        <CourseDiagram t={t} />
        <div className="space-y-3 text-sm">
          <h2 className="text-lg font-semibold text-navy-900 dark:text-white">{t('rc.rules.courseTitle')}</h2>
          <p className="text-slate-600 dark:text-slate-300">{t('rc.rules.courseText')}</p>
          <ol className="list-decimal space-y-1 pl-5">
            {(['c1', 'c2', 'c3', 'c4', 'c5'] as const).map((k) => (
              <li key={k}>{t(`rc.rules.${k}` as MessageKey)}</li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-navy-900 dark:text-white">{t('rc.rules.seqTitle')}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          {SEQUENCE.map((k, i) => (
            <div key={k} className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-navy-900/60">
              <p className="font-mono text-xl font-bold">{['5:00', '4:00', '1:00', '0:00'][i]}</p>
              <p className="font-semibold">{t(`rc.rules.seq.${k}` as MessageKey)}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">{t(`rc.rules.seq.${k}.d` as MessageKey)}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">{t('rc.rules.seqGame')}</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-navy-900 dark:text-white">{t('rc.rules.rulesTitle')}</h2>
        <dl className="mt-3 grid gap-3 md:grid-cols-2">
          {RULES.map((k) => (
            <div key={k} className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-navy-900/60">
              <dt className="font-semibold">{t(`rc.rules.${k}` as MessageKey)}</dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-300">{t(`rc.rules.${k}.d` as MessageKey)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-slate-500">{t('rc.rules.source')}</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-navy-900 dark:text-white">{t('rc.rules.tacticsTitle')}</h2>
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {TACTICS.map((k) => (
            <li key={k} className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm dark:border-sky-400/20 dark:bg-sky-950/30">
              <p className="font-semibold">{t(`rc.tac.${k}` as MessageKey)}</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{t(`rc.tac.${k}.d` as MessageKey)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-white/10 dark:bg-navy-900/60">
        <h2 className="font-semibold">{t('rc.rules.gameTitle')}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600 dark:text-slate-300">
          {(['g1', 'g2', 'g3', 'g4', 'g5'] as const).map((k) => (
            <li key={k}>{t(`rc.rules.${k}` as MessageKey)}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
