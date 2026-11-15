import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { MessageKey } from '../../../i18n/en'
import { useI18n, type Translate } from '../../../i18n'
import { getStars, recordStars, starsFromScore } from '../progress'
import { Feedback, Panel, StarsView } from '../ui'
import {
  bearingFrom,
  checkClearing,
  CHURCH,
  DANGER,
  decisionCorrect,
  END_Y,
  fmtTime,
  gateStars,
  heightAt,
  inDanger,
  isSafe,
  LAND,
  NEEDED_HEIGHT,
  nextPosition,
  PASSAGE,
  PILOT_START,
  simulatePassage,
  STREAM,
  type Decision,
  type Pt,
} from './passage'

const PREFIX = 'day-skipper:passage'

export function PassageRunGame() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const part = search.get('part') === 'pilotage' ? 'pilotage' : 'gate'
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {(['gate', 'pilotage'] as const).map((p, i) => (
          <button
            key={p}
            type="button"
            onClick={() => setSearch({ part: p }, { replace: true })}
            className={`rounded-lg border px-3 py-1.5 text-sm ${p === part ? 'border-navy-900 bg-navy-900 text-white dark:border-sea-500 dark:bg-sea-500' : 'border-slate-300 bg-white dark:border-white/20 dark:bg-white/5'}`}
          >
            {i + 1}. {t(`rya.ps.part.${p}`)} <StarsView n={getStars(`${PREFIX}:${p}`)} size="text-xs" />
          </button>
        ))}
      </div>
      {part === 'gate' ? <TidalGate t={t} /> : <Pilotage t={t} />}
    </>
  )
}

/* ---------------- Tidal gate ---------------- */

const DAY0 = 4 * 60
const DAY1 = 21 * 60

function TidalGate({ t }: { t: Translate }) {
  const [depart, setDepart] = useState(6 * 60)
  const [committed, setCommitted] = useState<number | null>(null)
  const r = useMemo(() => simulatePassage(depart), [depart])
  const W = 640
  const H = 150
  const x = (m: number) => ((m - DAY0) / (DAY1 - DAY0)) * W
  const stars = gateStars(r)

  const curve = useMemo(() => {
    const pts: string[] = []
    for (let m = DAY0; m <= DAY1; m += 10) pts.push(`${x(m)},${H - 10 - (heightAt(m) / 6) * (H - 20)}`)
    return pts.join(' ')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const yH = (h: number) => H - 10 - (h / 6) * (H - 20)

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
      <div className="space-y-3">
        <Panel className="text-sm">
          <p>{t('rya.ps.gate.brief', { d: PASSAGE.distance, s: PASSAGE.boatSpeed, hw: fmtTime(PASSAGE.hw), hh: PASSAGE.hwHeight, lh: PASSAGE.lwHeight })}</p>
          <p className="mt-1">{t('rya.ps.gate.bar', { dries: PASSAGE.barDries, draft: PASSAGE.draft, c: PASSAGE.clearance, need: NEEDED_HEIGHT.toFixed(1) })}</p>
        </Panel>
        <Panel className="p-2">
          <div className="px-2 text-xs font-semibold text-slate-500">{t('rya.ps.gate.stream')}</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
            <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="#94a3b8" />
            <rect x={x(depart)} y="0" width={Math.max(0, x(r.arrive) - x(depart))} height={H} fill="#1e9bd7" opacity="0.12" />
            {STREAM.map((s, i) => {
              const m = PASSAGE.hw + (i - 6) * 60
              const bh = (s / 2.5) * (H / 2 - 12)
              return (
                <g key={i}>
                  <rect x={x(m) - 9} y={s >= 0 ? H / 2 - bh : H / 2} width="18" height={Math.abs(bh)} fill={s >= 0 ? '#16a34a' : '#dc2626'} opacity="0.75" />
                  <text x={x(m)} y={H - 2} fontSize="9" textAnchor="middle" fill="#64748b">
                    {i === 6 ? 'HW' : `${i - 6 > 0 ? '+' : ''}${i - 6}`}
                  </text>
                  <text x={x(m)} y={10} fontSize="9" textAnchor="middle" fill="#64748b">
                    {fmtTime(m)}
                  </text>
                </g>
              )
            })}
            <text x="4" y={H / 2 - 4} fontSize="9" fill="#16a34a">
              {t('rya.ps.gate.fair')}
            </text>
            <text x="4" y={H / 2 + 12} fontSize="9" fill="#dc2626">
              {t('rya.ps.gate.foul')}
            </text>
          </svg>
        </Panel>
        <Panel className="p-2">
          <div className="px-2 text-xs font-semibold text-slate-500">{t('rya.ps.gate.tide')}</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
            <line x1="0" x2={W} y1={yH(NEEDED_HEIGHT)} y2={yH(NEEDED_HEIGHT)} stroke="#f59e0b" strokeDasharray="5 4" />
            <text x={W - 4} y={yH(NEEDED_HEIGHT) - 4} fontSize="9" textAnchor="end" fill="#b45309">
              {t('rya.ps.gate.need', { h: NEEDED_HEIGHT.toFixed(1) })}
            </text>
            <polyline points={curve} fill="none" stroke="#0b3a5c" strokeWidth="2" />
            <line x1={x(r.arrive)} x2={x(r.arrive)} y1="0" y2={H} stroke={r.barOk ? '#16a34a' : '#dc2626'} strokeWidth="2" />
            <circle cx={x(r.arrive)} cy={yH(r.heightAtBar)} r="5" fill={r.barOk ? '#16a34a' : '#dc2626'} />
            {[6, 8, 10, 12, 14, 16, 18, 20].map((h) => (
              <text key={h} x={x(h * 60)} y={H - 1} fontSize="9" textAnchor="middle" fill="#64748b">
                {String(h).padStart(2, '0')}:00
              </text>
            ))}
          </svg>
        </Panel>
      </div>
      <Panel className="space-y-3 self-start">
        <label className="block text-sm">
          <span className="font-semibold">{t('rya.ps.gate.etd', { time: fmtTime(depart) })}</span>
          <input type="range" min={4 * 60} max={12 * 60} step={15} value={depart} onChange={(e) => (setDepart(Number(e.target.value)), setCommitted(null))} className="mt-1 w-full accent-navy-900" />
        </label>
        <dl className="grid grid-cols-2 gap-1 text-sm tabular-nums">
          <dt className="text-slate-500">{t('rya.ps.gate.eta')}</dt>
          <dd className="font-semibold">{fmtTime(r.arrive)}</dd>
          <dt className="text-slate-500">{t('rya.ps.gate.sog')}</dt>
          <dd className="font-semibold">
            {r.avgSog.toFixed(1)} {t('common.kn')}
          </dd>
          <dt className="text-slate-500">{t('rya.ps.gate.height')}</dt>
          <dd className={`font-semibold ${r.barOk ? 'text-emerald-600' : 'text-rose-600'}`}>{r.heightAtBar.toFixed(1)} m</dd>
        </dl>
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => {
            setCommitted(depart)
            if (stars > 0) recordStars(`${PREFIX}:gate`, stars)
          }}
        >
          ✅ {t('rya.ps.gate.commit')}
        </button>
        {committed !== null && (
          <div className="space-y-2 text-center">
            {stars > 0 && <StarsView n={stars} size="text-2xl" />}
            <Feedback ok={stars > 0}>{t(r.barOk ? (stars === 3 ? 'rya.ps.gate.best' : 'rya.ps.gate.ok') : r.arrive < PASSAGE.hw ? 'rya.ps.gate.early' : 'rya.ps.gate.late')}</Feedback>
          </div>
        )}
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <p className="font-semibold">{t('rya.ps.gate.twelfths')}</p>
          <p>1 · 2 · 3 · 3 · 2 · 1 /12</p>
        </div>
      </Panel>
    </div>
  )
}

/* ---------------- Pilotage with a clearing bearing ---------------- */

const SCALE = 120
const VB = { x0: -0.8, x1: 3.6, y0: -2.6, y1: 3.8 }
const px = (p: Pt) => ({ x: (p.x - VB.x0) * SCALE, y: (VB.y1 - p.y) * SCALE })
const poly = (ps: Pt[]) =>
  ps
    .map(px)
    .map((p) => `${p.x},${p.y}`)
    .join(' ')

function Pilotage({ t }: { t: Translate }) {
  const [clearing, setClearing] = useState(40)
  const [phase, setPhase] = useState<'setup' | 'run' | 'done'>('setup')
  const [check, setCheck] = useState<ReturnType<typeof checkClearing> | null>(null)
  const [pos, setPos] = useState<Pt>(PILOT_START)
  const [track, setTrack] = useState<{ p: Pt; ok: boolean }[]>([])
  const [answered, setAnswered] = useState<{ d: Decision; ok: boolean } | null>(null)
  const [aground, setAground] = useState(false)
  const reading = Math.round(bearingFrom(pos, CHURCH))
  const correct = track.filter((x) => x.ok).length

  const lineEnd = (() => {
    const back = ((clearing + 180) * Math.PI) / 180
    return px({ x: CHURCH.x + Math.sin(back) * 7, y: CHURCH.y + Math.cos(back) * 7 })
  })()
  const c = px(CHURCH)

  const tryLine = () => {
    const r = checkClearing(clearing)
    setCheck(r)
    if (r.ok) setPhase('run')
  }
  const decide = (d: Decision) => {
    if (answered) return
    setAnswered({ d, ok: decisionCorrect(reading, clearing, d) })
  }
  const advance = () => {
    if (!answered) return
    const nt = [...track, { p: pos, ok: answered.ok }]
    setTrack(nt)
    const np = nextPosition(pos, answered.d)
    setAnswered(null)
    if (inDanger(np)) {
      setPos(np)
      setAground(true)
      setPhase('done')
      return
    }
    setPos(np)
    if (np.y >= END_Y) {
      setPhase('done')
      const stars = starsFromScore(nt.filter((x) => x.ok).length, nt.length)
      if (stars > 0) recordStars(`${PREFIX}:pilotage`, stars)
    }
  }
  const restart = () => {
    setPhase('setup')
    setCheck(null)
    setPos(PILOT_START)
    setTrack([])
    setAnswered(null)
    setAground(false)
  }
  const revealBoat = phase !== 'run' || !!answered

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
      <div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
          <svg viewBox={`0 0 ${(VB.x1 - VB.x0) * SCALE} ${(VB.y1 - VB.y0) * SCALE}`} className="block max-h-[600px] w-full bg-[#e0f2fa]">
            <polygon points={poly(LAND)} fill="#e9d8a6" stroke="#a16207" />
            <polygon points={poly(DANGER)} fill="#78716c" fillOpacity="0.5" stroke="#44403c" strokeDasharray="4 3" />
            <text x={px({ x: 2.2, y: 0.8 }).x} y={px({ x: 2.2, y: 0.8 }).y} fontSize="14" textAnchor="middle">
              ✱✱
            </text>
            <g transform={`translate(${c.x} ${c.y})`}>
              <path d="M0 -14 L6 -4 L6 8 L-6 8 L-6 -4 Z" fill="#7c2d12" />
              <line x1="0" y1="-20" x2="0" y2="-12" stroke="#7c2d12" strokeWidth="2" />
              <line x1="-4" y1="-17" x2="4" y2="-17" stroke="#7c2d12" strokeWidth="2" />
              <text x="10" y="4" fontSize="12" fill="#7c2d12">
                {t('rya.ps.pl.church')}
              </text>
            </g>
            <line x1={c.x} y1={c.y} x2={lineEnd.x} y2={lineEnd.y} stroke="#dc2626" strokeWidth="2.5" strokeDasharray="10 6" />
            <text x={lineEnd.x + 6} y={lineEnd.y - 6} fontSize="13" fill="#dc2626" fontWeight={700}>
              NLT {clearing}°
            </text>
            {track.map((tp, i) => {
              const p = px(tp.p)
              return <circle key={i} cx={p.x} cy={p.y} r="5" fill={tp.ok ? '#16a34a' : '#dc2626'} />
            })}
            {revealBoat && (
              <g transform={`translate(${px(pos).x} ${px(pos).y})`}>
                <path d="M0 -10 C4 -4 4 4 3 8 L-3 8 C-4 4 -4 -4 0 -10 Z" fill={aground ? '#dc2626' : '#0b3a5c'} stroke="#fff" />
              </g>
            )}
            {phase === 'run' && !answered && (
              <text x={px(pos).x} y={px(pos).y} fontSize="22" textAnchor="middle" fill="#64748b">
                ?
              </text>
            )}
          </svg>
          {phase === 'run' && (
            <div className="absolute left-3 top-3 rounded-xl bg-navy-900/90 px-4 py-2 text-white shadow">
              <div className="text-xs opacity-80">{t('rya.ps.pl.reading')}</div>
              <div className="text-3xl font-bold tabular-nums">{String(reading).padStart(3, '0')}°</div>
            </div>
          )}
        </div>
        {phase === 'done' && (
          <Panel className="mt-3 text-center">
            {aground ? (
              <Feedback ok={false}>{t('rya.ps.pl.aground')}</Feedback>
            ) : (
              <>
                <StarsView n={starsFromScore(correct, track.length)} size="text-3xl" />
                <p className="mt-1 font-semibold">{t('rya.score', { score: correct, max: track.length })}</p>
              </>
            )}
            <button type="button" className="btn-primary mt-2" onClick={restart}>
              ↺ {t('rya.retry')}
            </button>
          </Panel>
        )}
      </div>
      <Panel className="space-y-3 self-start">
        {phase === 'setup' ? (
          <>
            <p className="text-sm">{t('rya.ps.pl.brief')}</p>
            <label className="block text-sm">
              <span className="font-semibold">{t('rya.ps.pl.line', { b: clearing })}</span>
              <input type="range" min={0} max={60} step={1} value={clearing} onChange={(e) => (setClearing(Number(e.target.value)), setCheck(null))} className="mt-1 w-full accent-navy-900" />
            </label>
            <button type="button" className="btn-primary w-full" onClick={tryLine}>
              ✏️ {t('rya.ps.pl.check')}
            </button>
            {check && !check.ok && <Feedback ok={false}>{t(`rya.ps.pl.err.${check.reason}` as MessageKey)}</Feedback>}
          </>
        ) : phase === 'run' ? (
          <>
            <p className="text-sm">{t('rya.ps.pl.rule', { b: clearing })}</p>
            <div className="grid gap-1.5">
              {(['hold', 'port', 'starboard'] as const).map((d) => (
                <button key={d} type="button" className={`btn-secondary text-left ${answered?.d === d ? (answered.ok ? '!border-emerald-500 !bg-emerald-50 dark:!bg-emerald-950/50' : '!border-rose-500 !bg-rose-50 dark:!bg-rose-950/50') : ''}`} disabled={!!answered} onClick={() => decide(d)}>
                  {t(`rya.ps.pl.d.${d}` as MessageKey)}
                </button>
              ))}
            </div>
            {answered && (
              <>
                <Feedback ok={answered.ok}>{t(isSafe(reading, clearing) ? 'rya.ps.pl.wasSafe' : 'rya.ps.pl.wasUnsafe', { r: reading, b: clearing })}</Feedback>
                <button type="button" className="btn-primary w-full" onClick={advance}>
                  {t('nm.next')} →
                </button>
              </>
            )}
          </>
        ) : null}
        <p className="text-xs text-slate-500 dark:text-slate-400">💡 {t('rya.ps.pl.tip')}</p>
      </Panel>
    </div>
  )
}
