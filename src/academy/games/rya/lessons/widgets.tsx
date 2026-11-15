import { lazy, Suspense, useMemo, useState } from 'react'
import { pointOfSail } from '../../../core/environment'
import { norm180 } from '../../../core/units'
import type { MessageKey } from '../../../i18n/en'
import { useI18n, type Translate } from '../../../i18n'
import { TopBoat } from '../../../map/TopBoat'
import { lightScreenOffset, visibleLights, type VesselType } from '../collision/encounter'
import { TYPES } from '../lookout/LookoutGame'
import { DirArrow } from '../ui'
import { Frame, Num } from './frame'
import { swingRadius, tideWindow, TWELFTHS, twelfthsHeight, type WidgetId } from './lessons'
import { GateWidget, StreamWidget, TideAnchorWidget } from './tideWidgets'

const Rig3DExplorer = lazy(() => import('../rig3d/Rig3D'))

const fmt = (min: number) => `${String(Math.floor((((min % 1440) + 1440) % 1440) / 60)).padStart(2, '0')}:${String(Math.round(((min % 60) + 60) % 60)).padStart(2, '0')}`
const n1 = (v: number) => v.toFixed(1)

export function LessonWidget({ id }: { id: WidgetId }) {
  const { t } = useI18n()
  if (id === 'rig3d')
    return (
      <Frame title={t('rya.r3.widgetTitle')}>
        <Suspense fallback={<p className="p-8 text-center text-sm text-slate-500">…</p>}>
          <Rig3DExplorer />
        </Suspense>
      </Frame>
    )
  if (id === 'stream') return <StreamWidget t={t} />
  if (id === 'gate') return <GateWidget t={t} />
  if (id === 'tideanchor') return <TideAnchorWidget t={t} />
  if (id === 'twelfths') return <Twelfths t={t} />
  if (id === 'scope') return <Scope t={t} />
  if (id === 'points') return <Points t={t} />
  return <Lights t={t} />
}

/* ---------------- Rule of twelfths ---------------- */

function Twelfths({ t }: { t: Translate }) {
  const [lwTime, setLwTime] = useState(7)
  const [lw, setLw] = useState(0.8)
  const [hw, setHw] = useState(5.0)
  const [need, setNeed] = useState(3.8)
  const [hours, setHours] = useState(4)
  const range = Math.max(0, hw - lw)
  const twelfth = range / 12
  const height = twelfthsHeight(lw, hw, hours)
  const win = tideWindow(lw, hw, need)
  const W = 520
  const H = 150
  const top = Math.max(hw, need) + 0.5
  const x = (h: number) => 20 + (h / 12) * (W - 40)
  const y = (v: number) => H - 20 - (v / top) * (H - 35)
  const curve = useMemo(() => Array.from({ length: 121 }, (_, i) => `${x(i / 10)},${y(twelfthsHeight(lw, hw, i / 10))}`).join(' '), [lw, hw, top])
  const lwMin = lwTime * 60
  return (
    <Frame title={t('rya.lw.tw.title')}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Num label={t('rya.lw.tw.lwTime')} value={lwTime} onChange={setLwTime} step={0.5} max={23.5} />
        <Num label={t('rya.lw.tw.lwHeight')} value={lw} onChange={setLw} max={10} />
        <Num label={t('rya.lw.tw.hwHeight')} value={hw} onChange={setHw} max={15} />
        <Num label={t('rya.lw.tw.need')} value={need} onChange={setNeed} max={15} />
      </div>
      <p className="mt-2 text-sm">
        {t('rya.lw.tw.range', { r: n1(range), tw: (twelfth).toFixed(2) })}
      </p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-center text-xs tabular-nums">
          <thead>
            <tr className="text-slate-500">
              <th className="text-left">{t('rya.lw.tw.time')}</th>
              {TWELFTHS.map((_, i) => (
                <th key={i}>{fmt(lwMin + i * 60)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-left text-slate-500">{t('rya.lw.tw.total')}</td>
              {TWELFTHS.map((f, i) => (
                <td key={i}>{f}/12</td>
              ))}
            </tr>
            <tr className="font-semibold">
              <td className="text-left font-normal text-slate-500">{t('rya.lw.tw.height')}</td>
              {TWELFTHS.map((f, i) => (
                <td key={i} className={lw + f * twelfth >= need ? 'text-emerald-600' : ''}>
                  {n1(lw + f * twelfth)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 block w-full rounded-lg bg-white dark:bg-navy-900/60">
        {win && <rect x={x(win[0])} y={0} width={x(win[1]) - x(win[0])} height={H - 20} fill="#22c55e" opacity="0.12" />}
        <line x1={x(0)} x2={x(12)} y1={y(need)} y2={y(need)} stroke="#f59e0b" strokeDasharray="5 4" />
        <polyline points={curve} fill="none" stroke="#0b3a5c" strokeWidth="2.5" />
        <line x1={x(hours)} x2={x(hours)} y1={0} y2={H - 20} stroke="#1e9bd7" />
        <circle cx={x(hours)} cy={y(height)} r="5" fill={height >= need ? '#16a34a' : '#dc2626'} />
        {[0, 3, 6, 9, 12].map((h) => (
          <text key={h} x={x(h)} y={H - 5} fontSize="10" textAnchor="middle" fill="#64748b">
            {fmt(lwMin + h * 60)}
          </text>
        ))}
        <text x={x(0) + 2} y={10} fontSize="10" fill="#64748b">
          LW
        </text>
        <text x={x(6)} y={10} fontSize="10" textAnchor="middle" fill="#64748b">
          HW
        </text>
      </svg>
      <input type="range" min={0} max={12} step={0.25} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="mt-2 w-full accent-navy-900" />
      <p className="text-sm">
        🕑 <strong>{fmt(lwMin + hours * 60)}</strong> → {t('rya.lw.tw.result', { h: (Math.round(height * 100) / 100).toFixed(2) })}{' '}
        <span className={height >= need ? 'text-emerald-600' : 'text-rose-600'}>{height >= need ? '✔' : '✘'}</span>
      </p>
      <p className="mt-1 text-sm">{win ? t('rya.lw.tw.window', { from: fmt(lwMin + win[0] * 60), to: fmt(lwMin + win[1] * 60) }) : t('rya.lw.tw.never')}</p>
    </Frame>
  )
}

/* ---------------- Scope and swinging circle ---------------- */

function Scope({ t }: { t: Translate }) {
  const [charted, setCharted] = useState(4)
  const [tideNow, setTideNow] = useState(4.2)
  const [tideLow, setTideLow] = useState(0.6)
  const [chain, setChain] = useState(35)
  const draft = 1.8
  const depthNow = charted + tideNow
  const scope = depthNow > 0 ? chain / depthNow : 0
  const radius = swingRadius(chain, depthNow)
  const lowDepth = charted + tideLow
  const underKeel = lowDepth - draft
  const verdict = scope < 4 ? 'drag' : scope <= 7 ? 'ok' : 'much'
  const W = 520
  const H = 160
  const sea = 30
  const k = (H - sea - 15) / Math.max(depthNow, 1)
  const bottomY = sea + depthNow * k
  const horiz = Math.min(W - 80, Math.sqrt(Math.max(0, chain * chain - depthNow * depthNow)) * 6)
  return (
    <Frame title={t('rya.lw.sc.title')}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Num label={t('rya.lw.sc.charted')} value={charted} onChange={setCharted} max={30} />
        <Num label={t('rya.lw.sc.tideNow')} value={tideNow} onChange={setTideNow} max={12} />
        <Num label={t('rya.lw.sc.tideLow')} value={tideLow} onChange={setTideLow} max={12} />
        <Num label={t('rya.lw.sc.chain')} value={chain} onChange={setChain} step={5} max={120} />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 block w-full rounded-lg bg-gradient-to-b from-sky-100 to-sky-300 dark:from-navy-900 dark:to-[#1c4a66]">
        <line x1={0} x2={W} y1={sea} y2={sea} stroke="#0b3a5c" strokeOpacity="0.4" />
        <rect x={0} y={bottomY} width={W} height={H - bottomY} fill="#d6c7a8" />
        <path d={`M${40 + horiz} ${sea - 6} l30 0 l-6 10 l-24 0 z`} fill="#0b3a5c" />
        <line x1={40 + horiz} y1={sea + 3} x2={40} y2={bottomY} stroke="#475569" strokeWidth="2" strokeDasharray="4 3" />
        <text x={36} y={bottomY - 2} fontSize="16">
          ⚓
        </text>
        <text x={W - 8} y={sea + (bottomY - sea) / 2} fontSize="11" textAnchor="end" fill="#0b3a5c">
          {n1(depthNow)} m
        </text>
      </svg>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-slate-500">{t('rya.lw.sc.depthNow')}</dt>
          <dd className="font-semibold">{n1(depthNow)} m</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{t('rya.lw.sc.scope')}</dt>
          <dd className={`font-semibold ${verdict === 'drag' ? 'text-rose-600' : verdict === 'ok' ? 'text-emerald-600' : 'text-amber-600'}`}>{n1(scope)} : 1</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{t('rya.lw.sc.minChain')}</dt>
          <dd className="font-semibold">{Math.ceil(depthNow * 4)} m</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{t('rya.lw.sc.radius')}</dt>
          <dd className="font-semibold">{Math.round(radius)} m</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{t('rya.lw.sc.lowDepth')}</dt>
          <dd className="font-semibold">{n1(lowDepth)} m</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{t('rya.lw.sc.underKeel')}</dt>
          <dd className={`font-semibold ${underKeel < 0.5 ? 'text-rose-600' : 'text-emerald-600'}`}>{n1(underKeel)} m</dd>
        </div>
      </dl>
      <p className="mt-2 text-sm">
        {t(`rya.lw.sc.${verdict}` as MessageKey)} {underKeel < 0.5 && t('rya.lw.sc.aground')}
      </p>
    </Frame>
  )
}

/* ---------------- Points of sail ---------------- */

function Points({ t }: { t: Translate }) {
  const [heading, setHeading] = useState(60)
  const twa = norm180(0 - heading)
  const abs = Math.abs(twa)
  const pos = pointOfSail(abs, 45)
  return (
    <Frame title={t('rya.lw.pt.title')}>
      <div className="grid items-center gap-4 sm:grid-cols-[14rem_1fr]">
        <svg viewBox="-110 -110 220 220" className="mx-auto block w-56">
          <circle r="95" fill="#e3f3fb" stroke="#94a3b8" />
          <path d="M0 0 L-67 -67 A95 95 0 0 1 67 -67 Z" fill="#fecaca" opacity="0.7" />
          <DirArrow x={0} y={-95} toDeg={180} len={26} color="#0b3a5c" width={2} />
          <TopBoat x={0} y={0} headingDeg={heading} twa={abs < 45 ? 0 : twa} scale={2} />
        </svg>
        <div>
          <input type="range" min={0} max={359} value={heading} onChange={(e) => setHeading(Number(e.target.value))} className="w-full accent-navy-900" aria-label={t('rya.lw.pt.heading')} />
          <p className="mt-2 text-lg font-semibold">{t(`pos.${pos}` as MessageKey)}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            TWA {Math.round(abs)}° · {abs < 1 ? '–' : t(twa > 0 ? 'rya.lw.pt.stbdTack' : 'rya.lw.pt.portTack')}
          </p>
          <p className="mt-1 text-sm">{abs >= 45 && (abs < 95 ? t('rya.lw.pt.canSpill') : t('rya.lw.pt.cannotSpill'))}</p>
          <p className="mt-1 text-xs text-slate-500">{t('rya.lw.pt.hint')}</p>
        </div>
      </div>
    </Frame>
  )
}

/* ---------------- Lights ---------------- */

const LIGHT_HEX = { white: '#fffbe6', red: '#ff3b30', green: '#34d399' }

function aspectKey(type: VesselType, rel: number): string {
  if (type === 'anchored') return 'allRound'
  if (Math.abs(rel) >= 112.5) return 'stern'
  if (Math.abs(rel) < 6) return 'headOn'
  return rel > 0 ? 'starboard' : 'port'
}

function Lights({ t }: { t: Translate }) {
  const [type, setType] = useState<VesselType>('powerSmall')
  const [rel, setRel] = useState(0)
  const lights = visibleLights(type, rel)
  return (
    <Frame title={t('rya.lw.li.title')}>
      <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
        <div>
          <svg viewBox="-120 -70 240 100" className="block w-full rounded-lg bg-gradient-to-b from-[#020617] to-[#0b1730]">
            <line x1={-120} x2={120} y1={10} y2={10} stroke="#1e293b" />
            {lights.map((l, i) => (
              <circle key={i} cx={lightScreenOffset(l, rel) * 22} cy={10 - l.h * 14} r={5} fill={LIGHT_HEX[l.colour]} style={{ filter: `drop-shadow(0 0 6px ${LIGHT_HEX[l.colour]})` }} />
            ))}
          </svg>
          <input type="range" min={-180} max={180} value={rel} onChange={(e) => setRel(Number(e.target.value))} className="mt-2 w-full accent-navy-900" />
          <p className="text-sm">{t('rya.lw.li.from', { deg: rel === 0 ? '0°' : `${Math.abs(rel)}° ${rel > 0 ? t('rya.stbd') : t('rya.port')}` })}</p>
          <p className="text-sm font-semibold">→ {t(`rya.lo.aspect.${aspectKey(type, rel)}` as MessageKey)}</p>
        </div>
        <div>
          <svg viewBox="-50 -50 100 100" className="mx-auto block w-28">
            <circle r="45" fill="none" stroke="#94a3b8" strokeDasharray="3 3" />
            <path d="M0 -14 C6 -6 6 6 4 12 L-4 12 C-6 6 -6 -6 0 -14 Z" fill="#7f1d1d" />
            <g transform={`rotate(${rel})`}>
              <text y={-38} textAnchor="middle" fontSize="12">
                👁
              </text>
            </g>
          </svg>
          <div className="mt-2 grid gap-1">
            {TYPES.map((ty) => (
              <button key={ty} type="button" onClick={() => setType(ty)} className={`btn-secondary px-2 py-1 text-left text-xs ${ty === type ? '!border-navy-900 !bg-sea-100 dark:!border-sea-500 dark:!bg-sea-500/20' : ''}`}>
                {t(`rya.lo.type.${ty}` as MessageKey)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">💡 {t(`rya.lo.why.${type}` as MessageKey)}</p>
    </Frame>
  )
}
