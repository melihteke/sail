import { useMemo, useRef, useState, type MouseEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Vec2 } from '../../../core/vec'
import type { MessageKey } from '../../../i18n/en'
import { useI18n, type Translate } from '../../../i18n'
import { getStars, recordStars } from '../progress'
import { DirArrow, Feedback, Panel, StarsView, useFixedLoop } from '../ui'
import { anchorLevels, anchorStars, chartDepth, DRAFT, NIGHT_HOURS, playNight, swingRadius, type AnchorEvent, type AnchorLevel, type Frame } from './anchor'

const PREFIX = 'day-skipper:anchor'
const PX = 2.4
const CELL = 10

function depthColour(d: number): string {
  if (d < 0) return '#c8d6a6'
  if (d < 2) return '#9fd3ea'
  if (d < 5) return '#bfe3f2'
  if (d < 10) return '#e0f2fa'
  return '#f8fcfe'
}

export function AnchorGame() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const level = anchorLevels.find((l) => l.id === search.get('level')) ?? anchorLevels[0]
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {anchorLevels.map((l, i) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setSearch({ level: l.id }, { replace: true })}
            className={`rounded-lg border px-3 py-1.5 text-sm ${l.id === level.id ? 'border-navy-900 bg-navy-900 text-white dark:border-sea-500 dark:bg-sea-500' : 'border-slate-300 bg-white dark:border-white/20 dark:bg-white/5'}`}
          >
            {i + 1}. {t(`rya.an.l.${l.id}` as MessageKey)} <StarsView n={getStars(`${PREFIX}:${l.id}`)} size="text-xs" />
          </button>
        ))}
      </div>
      <Bay key={level.id} t={t} level={level} />
    </>
  )
}

function Bay({ t, level }: { t: Translate; level: AnchorLevel }) {
  const [anchor, setAnchor] = useState<Vec2 | null>(null)
  const [chain, setChain] = useState(25)
  const [hover, setHover] = useState<Vec2 | null>(null)
  const [playing, setPlaying] = useState(false)
  const [result, setResult] = useState<{ frames: Frame[]; event: AnchorEvent } | null>(null)
  const [fi, setFi] = useState(0)
  const fiRef = useRef(0)

  const cells = useMemo(() => {
    const out: { x: number; y: number; d: number }[] = []
    for (let x = 0; x < level.w; x += CELL) for (let y = 0; y < level.h; y += CELL) out.push({ x, y, d: chartDepth(level, { x: x + CELL / 2, y: y + CELL / 2 }) })
    return out
  }, [level])
  const soundings = useMemo(() => {
    const out: { x: number; y: number; d: number }[] = []
    for (let x = 20; x < level.w; x += 40) for (let y = 15; y < level.h; y += 35) {
      const d = chartDepth(level, { x, y })
      if (d > -1.5) out.push({ x, y, d })
    }
    return out
  }, [level])

  useFixedLoop(
    playing,
    (dt) => {
      if (!result) return
      fiRef.current = Math.min(result.frames.length - 1, fiRef.current + dt * 20)
      setFi(Math.floor(fiRef.current))
      if (fiRef.current >= result.frames.length - 1) {
        setPlaying(false)
        const stars = anchorStars(result.event)
        if (stars > 0) recordStars(`${PREFIX}:${level.id}`, stars)
      }
    },
    () => {},
    30,
  )

  const toWorld = (e: MouseEvent<SVGSVGElement>): Vec2 => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * level.w, y: level.h - ((e.clientY - r.top) / r.height) * level.h }
  }
  const sy = (y: number) => (level.h - y) * PX
  const sx = (x: number) => x * PX

  const run = () => {
    if (!anchor) return
    const r = playNight(level, anchor, chain)
    setResult(r)
    fiRef.current = 0
    setFi(0)
    setPlaying(r.frames.length > 0)
    if (r.frames.length === 0) setPlaying(false)
  }
  const clear = () => {
    setResult(null)
    setPlaying(false)
  }

  const frame = result?.frames[fi]
  const finished = result && !playing
  const depthHW = anchor ? chartDepth(level, anchor) + level.tideNow : 0
  const hoverDepth = hover ? chartDepth(level, hover) : null

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_19rem]">
      <div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
          <svg
            viewBox={`0 0 ${level.w * PX} ${level.h * PX}`}
            className="block w-full cursor-crosshair"
            onClick={(e) => {
              if (playing) return
              setAnchor(toWorld(e))
              clear()
            }}
            onMouseMove={(e) => setHover(toWorld(e))}
            onMouseLeave={() => setHover(null)}
          >
            {cells.map((c) => (
              <rect key={`${c.x},${c.y}`} x={sx(c.x)} y={sy(c.y + CELL)} width={CELL * PX + 0.5} height={CELL * PX + 0.5} fill={depthColour(c.d)} />
            ))}
            {level.land.map((poly, i) => (
              <polygon key={i} points={poly.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')} fill="#e9d8a6" stroke="#a16207" strokeWidth="1.5" />
            ))}
            {soundings.map((s) => (
              <text key={`${s.x},${s.y}`} x={sx(s.x)} y={sy(s.y)} fontSize="11" textAnchor="middle" fill={s.d < 0 ? '#3f6212' : '#334155'} fontStyle="italic" textDecoration={s.d < 0 ? 'underline' : undefined}>
                {Math.abs(s.d).toFixed(0)}
              </text>
            ))}
            {level.rocks.map((r, i) => (
              <g key={i} transform={`translate(${sx(r.c.x)} ${sy(r.c.y)})`}>
                <circle r={r.r * PX} fill="#78716c" stroke="#44403c" />
                <text y="4" textAnchor="middle" fontSize="12" fill="#fff">
                  ✱
                </text>
              </g>
            ))}
            {level.boats.map((b, i) => {
              const p = frame?.others[i] ?? b.at
              return (
                <g key={i}>
                  <circle cx={sx(b.at.x)} cy={sy(b.at.y)} r={swingRadius(b.chain, chartDepth(level, b.at) + level.tideNow) * PX} fill="#f59e0b" fillOpacity="0.07" stroke="#f59e0b" strokeDasharray="4 4" />
                  <text x={sx(b.at.x)} y={sy(b.at.y) + 4} textAnchor="middle" fontSize="11">
                    ⚓
                  </text>
                  <circle cx={sx(p.x)} cy={sy(p.y)} r={5 * PX} fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
                  <text x={sx(p.x)} y={sy(p.y) + 4} textAnchor="middle" fontSize="10" fill="#334155">
                    {String.fromCharCode(65 + i)}
                  </text>
                </g>
              )
            })}
            {anchor && (
              <g>
                <circle cx={sx(anchor.x)} cy={sy(anchor.y)} r={swingRadius(chain, depthHW) * PX} fill="#1e9bd7" fillOpacity="0.08" stroke="#1e9bd7" strokeWidth="2" strokeDasharray="6 4" />
                <text x={sx(anchor.x)} y={sy(anchor.y) + 5} textAnchor="middle" fontSize="16">
                  ⚓
                </text>
                {frame && (
                  <>
                    <line x1={sx(anchor.x)} y1={sy(anchor.y)} x2={sx(frame.pos.x)} y2={sy(frame.pos.y)} stroke="#334155" strokeWidth="1.5" strokeDasharray="2 3" />
                    <circle cx={sx(frame.pos.x)} cy={sy(frame.pos.y)} r={5 * PX} fill="#0b3a5c" stroke="#fff" strokeWidth="2" />
                  </>
                )}
              </g>
            )}
          </svg>
          <div className="pointer-events-none absolute right-2 top-2 rounded-lg bg-white/85 p-2 text-xs tabular-nums dark:bg-navy-900/80">
            {frame ? (
              <>
                <div>
                  🕑 {String(Math.floor(21 + frame.hour) % 24).padStart(2, '0')}:{String(Math.round((frame.hour % 1) * 60) % 60).padStart(2, '0')}
                </div>
                <div className="flex items-center gap-1">
                  <svg width="22" height="22" viewBox="-11 -11 22 22">
                    <DirArrow x={0} y={0} toDeg={frame.wind + 180} len={18} color="#0b3a5c" width={2} />
                  </svg>
                  {Math.round(frame.wind)}°
                </div>
                <div>🌊 {t('rya.an.tide')} {frame.tide.toFixed(1)} m</div>
                <div className={frame.underKeel < 0.5 ? 'text-rose-600' : ''}>⚓ {t('rya.an.underKeel')} {frame.underKeel.toFixed(1)} m</div>
              </>
            ) : (
              <>
                <div>🌊 {t('rya.an.tideNow', { h: level.tideNow.toFixed(1) })}</div>
                <div>{t('rya.an.tideLow', { h: level.tideLow.toFixed(1) })}</div>
                <div className="mt-1">{t('rya.an.forecast')}</div>
                <div>{level.winds.map((w) => `${w}°`).join(' → ')}</div>
                {hoverDepth !== null && <div className="mt-1">📍 {t('rya.an.charted', { d: hoverDepth.toFixed(1) })}</div>}
              </>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">🎯 {t(`rya.an.l.${level.id}.goal` as MessageKey)}</p>
      </div>
      <Panel className="space-y-3 self-start">
        <div className="text-sm">
          {anchor ? (
            <>
              <div>{t('rya.an.chartedHere', { d: chartDepth(level, anchor).toFixed(1) })}</div>
              <div>{t('rya.an.depthNow', { d: depthHW.toFixed(1) })}</div>
              <div className="text-slate-500">{t('rya.an.draft', { d: DRAFT })}</div>
            </>
          ) : (
            <span className="text-slate-500">{t('rya.an.pick')}</span>
          )}
        </div>
        <label className="block text-sm">
          <span className="font-semibold">{t('rya.an.chain', { m: chain })}</span>
          <input type="range" min={10} max={80} step={5} value={chain} onChange={(e) => (setChain(Number(e.target.value)), clear())} className="mt-1 w-full accent-navy-900" />
          {anchor && depthHW > 0 && <span className="text-xs text-slate-500">{t('rya.an.scope', { s: (chain / depthHW).toFixed(1) })}</span>}
        </label>
        <button type="button" className="btn-primary w-full" disabled={!anchor || playing} onClick={run}>
          🌙 {t('rya.an.night', { h: NIGHT_HOURS })}
        </button>
        {finished && result && <AnchorResult t={t} e={result.event} />}
        <p className="text-xs text-slate-500 dark:text-slate-400">💡 {t('rya.an.rule')}</p>
      </Panel>
    </div>
  )
}

function AnchorResult({ t, e }: { t: Translate; e: AnchorEvent }) {
  const stars = anchorStars(e)
  const time = (h: number) => `${String(Math.floor(21 + h) % 24).padStart(2, '0')}:${String(Math.round((h % 1) * 60) % 60).padStart(2, '0')}`
  let text: string
  switch (e.kind) {
    case 'ok':
      text = t('rya.an.ok', { s: e.scope.toFixed(1), k: e.minUnderKeel.toFixed(1) })
      break
    case 'land':
      text = t('rya.an.land')
      break
    case 'tooShallow':
      text = t('rya.an.tooShallow', { d: e.depth.toFixed(1) })
      break
    case 'drag':
      text = t('rya.an.drag', { s: e.scope.toFixed(1), time: time(e.hour) })
      break
    case 'aground':
      text = t('rya.an.aground', { time: time(e.hour) })
      break
    case 'rock':
      text = t('rya.an.rock', { time: time(e.hour) })
      break
    case 'boat':
      text = t('rya.an.boat', { time: time(e.hour), b: String.fromCharCode(65 + e.boat) })
      break
  }
  return (
    <div className="space-y-2 text-center">
      {stars > 0 && <StarsView n={stars} size="text-2xl" />}
      <Feedback ok={stars > 0}>{text}</Feedback>
    </div>
  )
}
