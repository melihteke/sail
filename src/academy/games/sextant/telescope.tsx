import { useEffect, useId, useState } from 'react'
import type { Translate } from '../../i18n'

/* ---------- Telescope view ---------- */

const PX_PER_MIN = 2
const VIEW = 300

/**
 * View through the telescope: horizon in the middle, reflected sun placed by the reading error.
 * In `horizon` mode (index error check) the mirror half shows a second, reflected horizon instead of the sun.
 */
export function Telescope({ errMin, rock, t, mode = 'sun', className = 'h-72 w-72' }: { errMin: number; rock: number; t: Translate; mode?: 'sun' | 'horizon'; className?: string }) {
  const uid = useId().replace(/:/g, '')
  const swing = Math.sin(rock) * 70
  const lift = (1 - Math.cos(rock)) * 18
  const cy = VIEW / 2 - (errMin + 16) * PX_PER_MIN - lift
  const cx = VIEW / 2 + swing
  const visible = mode === 'horizon' || Math.abs(errMin) < 75
  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className={className} role="img" aria-label={t('sx.view')}>
      <defs>
        <clipPath id={`${uid}-clip`}>
          <circle cx={VIEW / 2} cy={VIEW / 2} r={VIEW / 2 - 4} />
        </clipPath>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="0.5" stopColor="#bae6fd" />
          <stop offset="0.5" stopColor="#1e3a8a" />
          <stop offset="1" stopColor="#0b3a5c" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${uid}-clip)`}>
        <rect width={VIEW} height={VIEW} fill={`url(#${uid}-sky)`} />
        <rect x={VIEW / 2} width={VIEW / 2} height={VIEW} fill="#0f172a" opacity="0.12" />
        {mode === 'horizon' && (
          <g>
            <rect x={VIEW / 2} y={VIEW / 2 - errMin * PX_PER_MIN * 4} width={VIEW / 2} height={VIEW} fill="#1e3a8a" />
            <rect x={VIEW / 2} y={-VIEW} width={VIEW / 2} height={VIEW * 1.5 - errMin * PX_PER_MIN * 4} fill="#bae6fd" />
            <rect x={VIEW / 2} width={VIEW / 2} height={VIEW} fill="#0f172a" opacity="0.12" />
          </g>
        )}
        {mode === 'sun' && visible && (
          <g>
            <circle cx={cx} cy={cy} r={16 * PX_PER_MIN} fill="#fb923c" opacity="0.95" />
            <circle cx={cx} cy={cy} r={16 * PX_PER_MIN + 6} fill="#fdba74" opacity="0.25" />
          </g>
        )}
        <line x1="0" y1={VIEW / 2} x2={VIEW} y2={VIEW / 2} stroke="#e2e8f0" strokeWidth="1" opacity="0.6" />
      </g>
      <circle cx={VIEW / 2} cy={VIEW / 2} r={VIEW / 2 - 4} fill="none" stroke="#0f172a" strokeWidth="8" />
      {!visible && (
        <foreignObject x={40} y={VIEW / 2 - 78} width={VIEW - 80} height={70}>
          <div style={{ color: '#fff', fontSize: 13, lineHeight: 1.3, textAlign: 'center', textShadow: '0 1px 2px rgba(0,0,0,.6)' }}>{errMin > 0 ? t('sx.sunAbove') : t('sx.sunBelow')}</div>
        </foreignObject>
      )}
    </svg>
  )
}

export function useRock(active: boolean): number {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      setPhase(Math.sin(((now - t0) / 1000) * 2.2) * 1.1)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      setPhase(0)
    }
  }, [active])
  return phase
}

export function ArmControls({ deg, min, setDeg, setMin, t }: { deg: number; min: number; setDeg: (v: number) => void; setMin: (v: number) => void; t: Translate }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="flex justify-between">
          <span>{t('sx.indexArm')}</span>
          <span className="font-mono">{deg}°</span>
        </span>
        <input type="range" min={0} max={90} value={deg} onChange={(e) => setDeg(Number(e.target.value))} className="w-full accent-sea-500" />
      </label>
      <label className="block text-sm">
        <span className="flex justify-between">
          <span>{t('sx.drum')}</span>
          <span className="font-mono">{min.toFixed(1)}′</span>
        </span>
        <input type="range" min={0} max={59.9} step={0.1} value={min} onChange={(e) => setMin(Number(e.target.value))} className="w-full accent-sea-500" />
      </label>
      <p className="font-mono text-lg">
        {t('sx.reading')}: {deg}° {min.toFixed(1)}′
      </p>
    </div>
  )
}

