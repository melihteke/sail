import type { MessageKey } from '../../i18n/en'
import type { Translate } from '../../i18n'

// Diagram coordinates: wind blows from the top. Each leg is drawn in its own colour and the
// same points form one continuous path for the animated boat.
const UP = '#2563eb'
const DOWN = '#16a34a'
const ROUND = '#ea580c'
type Pt = [number, number]
// Upwind zigzags in the middle, the run is down the left side and the final beat up the right,
// so no two legs cross. Straight legs are point lists; roundings are smooth curves.
const LEGS: { color: string; pts?: Pt[]; d?: string }[] = [
  { color: UP, pts: [[190, 420], [150, 350], [200, 270], [150, 190], [196, 110]] },
  { color: ROUND, d: 'M196 110 Q200 50 178 50 Q140 50 124 62 Q106 74 104 96' },
  { color: DOWN, pts: [[104, 96], [70, 205], [100, 320], [116, 440], [180, 472]] },
  { color: ROUND, d: 'M180 472 Q184 504 208 502 Q232 498 232 468' },
  { color: UP, pts: [[232, 468], [282, 410], [262, 352], [292, 298]] },
]
const pathOf = (l: (typeof LEGS)[number]) => l.d ?? `M${l.pts!.map((p) => p.join(' ')).join(' L')}`
const FULL = LEGS.map((l, i) => (i === 0 ? pathOf(l) : pathOf(l).replace(/^M[\d.]+ [\d.]+ /, ' '))).join('')
const legStart = (l: (typeof LEGS)[number]): Pt => l.pts?.[0] ?? (l.d!.match(/^M([\d.]+) ([\d.]+)/)!.slice(1).map(Number) as Pt)
const STEPS = [
  { n: 1, x: 190, y: 444, color: ROUND },
  { n: 2, x: 128, y: 352, color: UP },
  { n: 3, x: 222, y: 46, color: ROUND },
  { n: 4, x: 46, y: 205, color: DOWN },
  { n: 5, x: 248, y: 506, color: ROUND },
  { n: 6, x: 308, y: 418, color: UP },
]

/** Small chevron in the middle of each straight segment, pointing the way to sail. */
function SegmentArrows({ pts, color }: { pts: Pt[]; color: string }) {
  return (
    <>
      {pts.slice(1).map(([x2, y2], i) => {
        const [x1, y1] = pts[i]!
        const a = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
        return <path key={i} d="M-4 -4.5 L4 0 L-4 4.5" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${(x1 + x2) / 2} ${(y1 + y2) / 2}) rotate(${a})`} />
      })}
    </>
  )
}
function Badge({ n, x, y, color }: { n: number; x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="10" fill={color} stroke="#fff" strokeWidth="2" />
      <text y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
        {n}
      </text>
    </g>
  )
}

/** Beginner-friendly picture of the course: the route to sail, step numbers and an animated boat. */
function CourseDiagram({ t }: { t: Translate }) {
  const mark = (x: number, y: number, label: string, color = '#f97316', at: [number, number, 'start' | 'middle'] = [9, -5, 'start']) => (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-6 6 L-3.5 -7 Q0 -10 3.5 -7 L6 6 Q0 8.5 -6 6Z" fill={color} stroke="#7c2d12" strokeWidth="0.8" />
      <text x={at[0]} y={at[1]} textAnchor={at[2]} fontSize="11" fontWeight="700" fill="#0b3a5c">
        {label}
      </text>
    </g>
  )
  const boat = (x: number, y: number, flag: string, label: string) => (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-11 2 H11 L8 7 H-8Z" fill="#fff" stroke="#334155" />
      <line x1="5" y1="2" x2="5" y2="-12" stroke="#334155" />
      <rect x="5" y="-12" width="9" height="6" fill={flag} />
      <text y="19" textAnchor="middle" fontSize="10" fill="#0b3a5c">
        {label}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 360 540" className="mx-auto w-full max-w-sm" role="img" aria-label={t('rc.rules.diagram')}>
      <defs>
        <marker id="rc-arr-up" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10Z" fill={UP} />
        </marker>
        <marker id="rc-arr-down" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10Z" fill={DOWN} />
        </marker>
        <marker id="rc-arr-round" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10Z" fill={ROUND} />
        </marker>
      </defs>
      <rect width="360" height="540" rx="16" fill="#e0f2fe" />

      {/* wind */}
      <g transform="translate(310 16)">
        <line y1="2" y2="28" stroke="#0b3a5c" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M0 33 L-3.5 26 L0 27.5 L3.5 26Z" fill="#0b3a5c" />
        <text y="46" textAnchor="middle" fontSize="10" fontWeight="600" fill="#0b3a5c">
          {t('rc.wind')}
        </text>
      </g>

      {/* no-go zone inset */}
      <g transform="translate(46 470)">
        <circle r="30" fill="#fff" stroke="#94a3b8" />
        <path d="M0 0 L-21 -21 A30 30 0 0 1 21 -21Z" fill="#fecaca" stroke="#ef4444" strokeWidth="1" />
        <text y="-34" textAnchor="middle" fontSize="9" fill="#b91c1c" fontWeight="700">
          {t('rc.rules.nogo')}
        </text>
        <path d="M0 -6 L-3 4 L3 4Z" fill="#0b3a5c" />
        <text y="44" textAnchor="middle" fontSize="9" fill="#475569">
          ±45°
        </text>
      </g>

      {/* lines */}
      <line x1="134" y1="420" x2="240" y2="420" stroke="#f97316" strokeWidth="2" strokeDasharray="6 4" />
      <circle cx="134" cy="420" r="4.5" fill="#f97316" stroke="#334155" />
      {boat(245, 420, '#f97316', t('rc.rules.start'))}
      <line x1="262" y1="290" x2="320" y2="290" stroke="#2563eb" strokeWidth="2" strokeDasharray="2 4" />
      <circle cx="262" cy="290" r="4.5" fill="#2563eb" stroke="#334155" />
      {boat(326, 290, '#2563eb', t('rc.rules.finish'))}

      {/* route */}
      {/* where each leg begins (drawn first so the previous leg's arrowhead sits on top) */}
      {LEGS.map((l, i) => {
        const [sx, sy] = legStart(l)
        return <circle key={`s${i}`} cx={sx} cy={sy} r="5" fill="#fff" stroke={l.color} strokeWidth="2.2" />
      })}
      {LEGS.map((l, i) => {
        return (
          <g key={i}>
            <path
              d={pathOf(l)}
              fill="none"
              stroke={l.color}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.85"
              markerEnd={`url(#${l.color === UP ? 'rc-arr-up' : l.color === DOWN ? 'rc-arr-down' : 'rc-arr-round'})`}
            />
            {l.pts && <SegmentArrows pts={l.pts} color={l.color} />}
          </g>
        )
      })}

      {mark(180, 70, '1')}
      {mark(124, 84, '1a', '#facc15')}
      {mark(150, 478, '4S', undefined, [0, 22, 'middle'])}
      {mark(210, 478, '4P', undefined, [0, -13, 'middle'])}

      {STEPS.map((s) => (
        <Badge key={s.n} {...s} />
      ))}

      {/* boat sailing the course */}
      <g>
        <path d="M9 0 L-7 -4.5 L-5 0 L-7 4.5Z" fill="#0b3a5c" stroke="#fff" strokeWidth="1" />
        <animateMotion dur="24s" repeatCount="indefinite" rotate="auto" path={FULL} />
      </g>
    </svg>
  )
}

const STEP_COLORS = [ROUND, UP, ROUND, DOWN, ROUND, UP]

/** Small picture of the triangle course: 1 upwind, 2 to the side, 3 downwind, all left to port. */
function TriangleDiagram({ t }: { t: Translate }) {
  const mark = (x: number, y: number, label: string) => (
    <g transform={`translate(${x} ${y})`}>
      <circle r="4.5" fill="#f97316" stroke="#7c2d12" strokeWidth="0.7" />
      <text x="7" y="3" fontSize="9" fontWeight="700" fill="#0b3a5c">
        {label}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 120 130" className="h-28 w-24 shrink-0" role="img" aria-label={t('rc.rules.triangle.t')}>
      <rect width="120" height="130" rx="10" fill="#e0f2fe" />
      <line x1="104" y1="8" x2="104" y2="24" stroke="#0b3a5c" strokeWidth="1" />
      <path d="M104 28 L101.5 23 L104 24 L106.5 23Z" fill="#0b3a5c" />
      <path d="M62 112 L62 26" stroke={UP} strokeWidth="2" strokeDasharray="4 3" fill="none" />
      <path d="M62 26 L22 66" stroke={DOWN} strokeWidth="2" fill="none" />
      <path d="M22 66 L60 104" stroke={DOWN} strokeWidth="2" fill="none" />
      {mark(62, 22, '1')}
      {mark(18, 66, '2')}
      {mark(62, 108, '3')}
    </svg>
  )
}
const SEQUENCE = ['warning', 'prep', 'oneMinute', 'start'] as const
const RULES = ['r26', 'r29', 'r28', 'r10', 'r11', 'r13', 'r18', 'r31', 'r44'] as const
const TACTICS = ['shifts', 'puffs', 'laylines', 'startEnd', 'gate', 'shore'] as const

export function RaceRules({ t }: { t: Translate }) {
  return (
    <div className="space-y-8">
      <section className="grid items-start gap-6 md:grid-cols-[22rem_minmax(0,1fr)]">
        <div>
          <CourseDiagram t={t} />
          <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-5 rounded" style={{ background: UP }} /> {t('rc.rules.legend.up')}
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-5 rounded" style={{ background: DOWN }} /> {t('rc.rules.legend.down')}
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-5 rounded" style={{ background: ROUND }} /> {t('rc.rules.legend.round')}
            </li>
          </ul>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <h2 className="text-lg font-semibold text-navy-900 dark:text-white">{t('rc.rules.courseTitle')}</h2>
            <p className="mt-1 text-slate-600 dark:text-slate-300">{t('rc.rules.courseText')}</p>
          </div>
          <ol className="space-y-3">
            {(['s1', 's2', 's3', 's4', 's5', 's6'] as const).map((k, i) => (
              <li key={k} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: STEP_COLORS[i] }}>
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{t(`rc.rules.${k}.t` as MessageKey)}</p>
                  <p className="text-slate-600 dark:text-slate-300">{t(`rc.rules.${k}` as MessageKey)}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-slate-700 dark:border-sky-400/20 dark:bg-sky-950/30 dark:text-slate-200">
            🎮 {t('rc.rules.inGame')}
          </p>
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-slate-700 dark:border-amber-400/20 dark:bg-amber-950/30 dark:text-slate-200">
            ⬅️ {t('rc.rules.portTip')}
          </p>
          <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-navy-900/60">
            <TriangleDiagram t={t} />
            <div>
              <p className="font-semibold">{t('rc.rules.triangle.t')}</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{t('rc.rules.triangle')}</p>
            </div>
          </div>
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
