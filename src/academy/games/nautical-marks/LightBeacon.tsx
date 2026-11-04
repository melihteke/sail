import { useId } from 'react'
import { lightColorHex, lightState, type LightChar } from '../../core/lights'

interface Props {
  light: LightChar
  /** Seconds, from a shared clock. */
  time: number
  size?: number
  className?: string
}

/** A light seen at night: a glowing dot that follows the light's characteristic. */
export function LightBeacon({ light, time, size = 120, className }: Props) {
  const id = useId().replace(/:/g, '')
  const s = lightState(light, time)
  const hex = lightColorHex[s.color]
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
      <defs>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor={hex} stopOpacity="1" />
          <stop offset="0.25" stopColor={hex} stopOpacity="0.8" />
          <stop offset="1" stopColor={hex} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${id}g)`} opacity={s.on ? 1 : 0} style={{ transition: 'opacity 60ms linear' }} />
      <circle cx="50" cy="50" r="7" fill={s.on ? '#ffffff' : '#334155'} opacity={s.on ? 0.95 : 0.6} />
    </svg>
  )
}
