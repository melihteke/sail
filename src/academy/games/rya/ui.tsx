import { useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { MessageKey } from '../../i18n/en'
import { useI18n } from '../../i18n'
import type { CourseId } from './courses'
import { lessonSets, lessonsForGame } from './lessons/lessons'

export function StarsView({ n, size = 'text-base' }: { n: number; size?: string }) {
  return (
    <span className={`${size} tracking-tight`} aria-label={`${n}/3`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < n ? 'text-amber-400' : 'opacity-30'}>
          ★
        </span>
      ))}
    </span>
  )
}

/** Page frame for a course game: back link to its course, title and intro. */
export function GameShell({ course, game, children }: { course: CourseId; game: string; children: ReactNode }) {
  const { t } = useI18n()
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to={`/rya/${course}`} className="text-sm text-sea-500 hover:underline">
        ← {t(`rya.course.${course}.title` as MessageKey)}
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 dark:text-white">{t(`rya.g.${game}.title` as MessageKey)}</h1>
      <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">{t(`rya.g.${game}.intro` as MessageKey)}</p>
      <LessonLinks game={game} />
      <div className="mt-6">{children}</div>
    </div>
  )
}

function LessonLinks({ game }: { game: string }) {
  const { t, lang } = useI18n()
  const items = lessonsForGame(game)
  if (!items.length) return null
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
      <span className="text-slate-500 dark:text-slate-400">📖 {t('rya.lessons.readFirst')}</span>
      {items.map((m) => (
        <Link key={m.id} to={`/rya/learn/${m.id}`} className="rounded-full border border-sea-500/40 bg-sea-100/60 px-3 py-0.5 font-medium text-navy-900 hover:bg-sea-100 dark:bg-sea-500/10 dark:text-sky-100">
          {m.icon} {lessonSets[lang][m.id].title}
        </Link>
      ))}
    </div>
  )
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-navy-900/60 ${className}`}>{children}</div>
}

export function Feedback({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        ok
          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-200'
          : 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-200'
      }`}
    >
      {children}
    </div>
  )
}

/** Fixed-step simulation loop: calls `tick(dt)` at `hz` while running, then `frame()` once per animation frame. */
export function useFixedLoop(running: boolean, tick: (dt: number) => void, frame: () => void, hz = 60, speed = 1) {
  const tickRef = useRef(tick)
  const frameRef = useRef(frame)
  tickRef.current = tick
  frameRef.current = frame
  useEffect(() => {
    if (!running) return
    let raf = 0
    let last = performance.now()
    let acc = 0
    const dt = 1 / hz
    const loop = (now: number) => {
      acc += Math.min(0.25, (now - last) / 1000) * speed
      last = now
      while (acc >= dt) {
        tickRef.current(dt)
        acc -= dt
      }
      frameRef.current()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [running, hz, speed])
}

/** Keyboard shortcuts while mounted; ignores typing in form fields. */
export function useKeys(handler: (e: KeyboardEvent) => boolean | void) {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) return
      if (ref.current(e) === true) e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

/** Arrow showing a direction (compass bearing the arrow points TO), centred on (x, y). */
export function DirArrow({ x, y, toDeg, len = 30, color = '#1e9bd7', width = 3, label }: { x: number; y: number; toDeg: number; len?: number; color?: string; width?: number; label?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform={`rotate(${toDeg})`}>
        <line x1={0} y1={len / 2} x2={0} y2={-len / 2 + 6} stroke={color} strokeWidth={width} strokeLinecap="round" />
        <path d={`M0 ${-len / 2} L${-5 - width} ${-len / 2 + 9} L${5 + width} ${-len / 2 + 9} Z`} fill={color} />
      </g>
      {label && (
        <text y={len / 2 + 14} textAnchor="middle" fontSize="11" fill={color} fontWeight={600}>
          {label}
        </text>
      )}
    </g>
  )
}

export function TabBar<T extends string>({ tabs, value, onChange, label }: { tabs: readonly T[]; value: T; onChange: (t: T) => void; label: (t: T) => string }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 dark:bg-white/5" role="tablist">
      {tabs.map((k) => (
        <button
          key={k}
          type="button"
          role="tab"
          aria-selected={value === k}
          onClick={() => onChange(k)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium ${value === k ? 'bg-white shadow dark:bg-navy-700' : 'text-slate-500 dark:text-slate-400'}`}
        >
          {label(k)}
        </button>
      ))}
    </div>
  )
}
