import { useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { pointOfSail } from '../../../core/environment'
import type { MessageKey } from '../../../i18n/en'
import { useI18n, type Translate } from '../../../i18n'
import { shuffled } from '../../../lib/random'
import { getStars, recordStars, starsFromScore, type Stars } from '../progress'
import { TopBoat } from '../../../map/TopBoat'
import { DirArrow, Panel, StarsView } from '../ui'
import { CONTROL_IDS, CONTROL_PARTS, JIB_CONTROLS, MAIN_CONTROLS, ROPE_COLORS, SAILING, STOWED, TASKS, judgeMove, rigState, taskStart, type ControlId, type Controls, type Task } from './rigModel'
import { buildRigScene, PART_LABELS, VIEW_IDS, type RigSceneApi, type ViewId } from './scene'

const k = (s: string) => s as MessageKey
const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const RATE = 0.45
export const RIG3D_STARS_ID = 'competent-crew:rig3d:challenge'

function HoldButton({ onStep, className, children, label }: { onStep: (dt: number) => void; className: string; children: ReactNode; label: string }) {
  const step = useRef(onStep)
  step.current = onStep
  const raf = useRef(0)
  const stop = () => cancelAnimationFrame(raf.current)
  useEffect(() => stop, [])
  return (
    <button
      type="button"
      aria-label={label}
      className={`select-none touch-none ${className}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        let last = performance.now()
        const tick = (now: number) => {
          step.current(Math.min(0.05, (now - last) / 1000))
          last = now
          raf.current = requestAnimationFrame(tick)
        }
        raf.current = requestAnimationFrame(tick)
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onClick={(e) => {
        if (e.detail === 0) step.current(0.25)
      }}
    >
      {children}
    </button>
  )
}

interface ExplorerProps {
  value: Controls
  setValue: Dispatch<SetStateAction<Controls>>
  /** Changing this number snaps the 3D model to `value` without animation. */
  snap?: number
  compact?: boolean
  top?: ReactNode
}

function RigExplorer({ value, setValue, snap = 0, compact = false, top }: ExplorerProps) {
  const { t, lang } = useI18n()
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<RigSceneApi | null>(null)
  const lastSnap = useRef(snap)
  const [failed, setFailed] = useState(false)
  const [selected, setSelected] = useState<ControlId | null>(null)
  const [wind, setWind] = useState(50)
  const [fromStbd, setFromStbd] = useState(true)
  const [view, setView] = useState<ViewId>('side')
  const [lineLabels, setLineLabels] = useState(() => typeof window === 'undefined' || window.innerWidth >= 640)
  const [partLabels, setPartLabels] = useState(false)

  useEffect(() => {
    if (!host.current) return
    try {
      api.current = buildRigScene(host.current, (id) => setSelected(id))
    } catch {
      setFailed(true)
    }
    return () => {
      api.current?.dispose()
      api.current = null
    }
  }, [])

  useEffect(() => {
    api.current?.setControls(value, snap !== lastSnap.current)
    lastSnap.current = snap
  }, [value, snap])
  useEffect(() => api.current?.setWind(wind, fromStbd), [wind, fromStbd])
  useEffect(() => api.current?.setSelected(selected), [selected])
  useEffect(() => api.current?.setLabelMode(lineLabels, partLabels), [lineLabels, partLabels])
  useEffect(() => {
    api.current?.setLabels({
      controls: Object.fromEntries(CONTROL_IDS.map((id) => [id, t(k(`rya.r3.c.${id}.name`))])) as Record<ControlId, string>,
      parts: Object.fromEntries(PART_LABELS.map((id) => [id, t(k(`rya.r3.l.${id}`))])) as Record<(typeof PART_LABELS)[number], string>,
    })
  }, [t])

  const adjust = (id: ControlId, delta: number) => {
    setSelected(id)
    setValue((prev) => ({ ...prev, [id]: clamp01(prev[id] + delta) }))
  }

  const s = rigState(value, wind)
  const pos = pointOfSail(wind, 40)
  const term = (id: ControlId) => (lang === 'en' ? '' : t(k(`rya.r3.c.${id}.term`)))

  const row = (id: ControlId) => (
    <li key={id} className={`rounded-lg border px-2 py-1.5 transition ${selected === id ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10' : 'border-slate-200 bg-white dark:border-white/10 dark:bg-navy-900/60'}`}>
      <button type="button" className="flex w-full items-center gap-2 text-left text-sm" onClick={() => setSelected(id)}>
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: ROPE_COLORS[id] }} aria-hidden />
        <span className="truncate font-medium">{t(k(`rya.r3.c.${id}.name`))}</span>
        {term(id) && <span className="truncate text-[11px] text-slate-500 dark:text-slate-400">({term(id)})</span>}
      </button>
      <div className="mt-1 flex items-center gap-1.5">
        <HoldButton label={t('rya.r3.ease')} onStep={(dt) => adjust(id, -RATE * dt)} className="shrink-0 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-100 active:bg-slate-200 dark:border-white/20 dark:hover:bg-white/10">
          ⟵ {t('rya.r3.ease')}
        </HoldButton>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value[id]}
          onChange={(e) => {
            setSelected(id)
            setValue((prev) => ({ ...prev, [id]: Number(e.target.value) }))
          }}
          className="min-w-0 flex-1"
          style={{ accentColor: ROPE_COLORS[id] }}
          aria-label={t(k(`rya.r3.c.${id}.name`))}
        />
        <HoldButton label={t('rya.r3.pull')} onStep={(dt) => adjust(id, RATE * dt)} className="shrink-0 rounded-md bg-navy-900 px-2 py-1 text-xs font-medium text-white hover:bg-navy-800 active:bg-sea-500 dark:bg-sea-500">
          {t('rya.r3.pull')} ⟶
        </HoldButton>
      </div>
    </li>
  )

  const info = (
    <Panel className="text-sm">
      {selected ? (
        <>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: ROPE_COLORS[selected] }} aria-hidden />
            <h3 className="font-semibold">
              {t(k(`rya.r3.c.${selected}.name`))} {term(selected) && <span className="font-normal text-slate-500">({term(selected)})</span>}
            </h3>
          </div>
          <p className="mt-1 text-slate-700 dark:text-slate-200">{t(k(`rya.r3.c.${selected}.does`))}</p>
          <div className="mt-1.5 grid gap-x-4 gap-y-1 sm:grid-cols-2">
            <p>
              <b>{t('rya.r3.pull')}:</b> {t(k(`rya.r3.c.${selected}.pull`))}
            </p>
            <p>
              <b>{t('rya.r3.ease')}:</b> {t(k(`rya.r3.c.${selected}.ease`))}
            </p>
          </div>
          <p className="mt-1.5 w-fit rounded bg-amber-50 px-2 py-0.5 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            ✨ {t('rya.r3.moves')}: {CONTROL_PARTS[selected].map((p) => t(k(`rya.r3.p.${p}`))).join(', ')}
          </p>
        </>
      ) : (
        <p className="text-slate-600 dark:text-slate-300">{t('rya.r3.select')}</p>
      )}
    </Panel>
  )

  const hint = <p className="text-center text-xs text-slate-500 dark:text-slate-400">🖐️ {t('rya.r3.drag')}</p>
  // Wide layout: sticky 3D view + info on the left, controls on the right. Narrow/compact: sticky 3D view on top.
  const wide = !compact
  const canvasSize = wide ? 'aspect-[4/3] max-h-[42vh] lg:aspect-auto lg:h-[min(54vh,34rem)] lg:max-h-none' : 'aspect-[4/3] max-h-[45vh]'

  return (
    <div className="space-y-4">
      {top}
      <div className={wide ? 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start' : 'space-y-4'}>
        <div className="sticky top-14 z-20 space-y-2 bg-background pb-2 pt-2">
          <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
            <div ref={host} className={`relative w-full cursor-grab active:cursor-grabbing ${canvasSize}`} role="img" aria-label={t('rya.r3.canvas')} />
            {failed && <p className="absolute inset-0 grid place-items-center bg-white/90 p-4 text-sm text-slate-700">{t('rya.r3.noWebgl')}</p>}
            <div className="absolute right-2 top-2 z-10 flex flex-wrap justify-end gap-1">
              {VIEW_IDS.map((vw) => (
                <button
                  key={vw}
                  type="button"
                  onClick={() => {
                    setView(vw)
                    api.current?.setView(vw)
                  }}
                  className={`rounded px-2 py-0.5 text-xs font-medium shadow-sm ${view === vw ? 'bg-navy-900 text-white' : 'bg-white/85 text-slate-700 hover:bg-white'}`}
                >
                  {t(k(`rya.r3.view.${vw}`))}
                </button>
              ))}
            </div>
            {s.warnings.length > 0 && (
              <ul className="pointer-events-none absolute bottom-2 left-2 right-2 z-10 space-y-1 text-xs">
                {s.warnings.map((w) => (
                  <li key={w} className="w-fit rounded bg-amber-100/95 px-2 py-0.5 font-medium text-amber-900">
                    ⚠️ {t(k(`rya.r3.w.${w}`))}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {hint}
          {wide && <div className="hidden lg:block">{info}</div>}
        </div>
        <div className="space-y-3">
          <div className={wide ? 'lg:hidden' : ''}>{info}</div>
          <div>
            <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('rya.r3.groupMain')}</h3>
            <ul className="space-y-1.5">{MAIN_CONTROLS.map(row)}</ul>
          </div>
          <div>
            <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('rya.r3.groupJib')}</h3>
            <ul className="space-y-1.5">{JIB_CONTROLS.map(row)}</ul>
          </div>
          <Panel className="space-y-2 text-sm">
            <label className="block">
              <span className="flex justify-between">
                <span>{t('rya.r3.windAngle')}</span>
                <span className="font-mono">{Math.round(wind)}°</span>
              </span>
              <input type="range" min={20} max={180} value={wind} onChange={(e) => setWind(Number(e.target.value))} className="w-full accent-sky-600" />
            </label>
            <div className="flex items-center gap-3">
              <WindDial angle={wind} fromStbd={fromStbd} label={t('rya.r3.wind')} />
              <div className="space-y-1.5">
                <p className="font-medium">{t(k(`pos.${pos}`))}</p>
                <div className="flex flex-wrap gap-1">
                  {[true, false].map((sb) => (
                    <button key={String(sb)} type="button" onClick={() => setFromStbd(sb)} className={`rounded px-2 py-0.5 text-xs ${fromStbd === sb ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-white/10'}`}>
                      {t(sb ? 'rya.r3.fromStbd' : 'rya.r3.fromPort')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
              <dt className="text-slate-500">{t('rya.r3.read.boom')}</dt>
              <dd className="font-mono">{Math.round(s.boomAngle)}°</dd>
              <dt className="text-slate-500">{t('rya.r3.read.lift')}</dt>
              <dd className="font-mono">{s.boomPitch.toFixed(1)}°</dd>
              <dt className="text-slate-500">{t('rya.r3.read.main')}</dt>
              <dd className="font-mono">{Math.round(s.hoist * 100)}%</dd>
              <dt className="text-slate-500">{t('rya.r3.read.jib')}</dt>
              <dd className="font-mono">{Math.round(s.jibOut * 100)}%</dd>
              <dt className="text-slate-500">{t('rya.r3.read.jibAngle')}</dt>
              <dd className="font-mono">{s.jibUp ? `${Math.round(s.jibAngle)}°` : '–'}</dd>
            </dl>
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs">
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={lineLabels} onChange={(e) => setLineLabels(e.target.checked)} /> {t('rya.r3.labelsLines')}
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={partLabels} onChange={(e) => setPartLabels(e.target.checked)} /> {t('rya.r3.labelsParts')}
              </label>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" className="btn-secondary !px-2 !py-1 text-xs" onClick={() => setValue({ ...SAILING })}>
                ⛵ {t('rya.r3.preset.sailing')}
              </button>
              <button type="button" className="btn-secondary !px-2 !py-1 text-xs" onClick={() => setValue({ ...STOWED })}>
                ⚓ {t('rya.r3.preset.stowed')}
              </button>
            </div>
          </Panel>
          <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">{t('rya.r3.howTo')}</p>
        </div>
      </div>
    </div>
  )
}

function WindDial({ angle, fromStbd, label }: { angle: number; fromStbd: boolean; label: string }) {
  const b = fromStbd ? angle : -angle
  const r = (b * Math.PI) / 180
  return (
    <svg viewBox="-60 -60 120 120" className="h-24 w-24 shrink-0" role="img" aria-label={label}>
      <circle r="56" fill="#e3f3fb" stroke="#94a3b8" />
      <TopBoat x={0} y={6} headingDeg={0} twa={Math.abs(angle) < 40 ? 0 : b} scale={1.4} />
      <DirArrow x={Math.sin(r) * 40} y={-Math.cos(r) * 40} toDeg={b + 180} len={26} color="#0284c7" width={2.5} />
    </svg>
  )
}

/** Free 3D explorer (used inside the lessons). */
export default function Rig3DExplorer({ compact = true }: { compact?: boolean }) {
  const [value, setValue] = useState<Controls>({ ...SAILING })
  return <RigExplorer value={value} setValue={setValue} compact={compact} />
}

/* ---------- Game: explorer + "Which line?" challenge ---------- */

const ROUND = 8

interface Run {
  tasks: Task[]
  i: number
  score: number
  missed: boolean
  base: Controls
  feedback: { ok: boolean; control: ControlId; dir: 1 | -1 } | null
  hint: boolean
}

export function Rig3DGame() {
  const { t } = useI18n()
  const [value, setValue] = useState<Controls>({ ...SAILING })
  const [snap, setSnap] = useState(0)
  const [run, setRun] = useState<Run | null>(null)
  const [result, setResult] = useState<{ score: number; stars: Stars; best: boolean } | null>(null)
  const [best, setBest] = useState<Stars>(() => getStars(RIG3D_STARS_ID))

  const begin = (task: Task) => {
    const start = taskStart(task)
    setValue(start)
    setSnap((n) => n + 1)
    return start
  }

  const startRun = () => {
    const tasks = shuffled(TASKS).slice(0, ROUND)
    const base = begin(tasks[0])
    setResult(null)
    setRun({ tasks, i: 0, score: 0, missed: false, base, feedback: null, hint: false })
  }

  useEffect(() => {
    if (!run || run.feedback?.ok) return
    const r = judgeMove(run.tasks[run.i], run.base, value)
    if (!r) return
    setRun((prev) =>
      prev && !prev.feedback?.ok
        ? r.ok
          ? { ...prev, score: prev.score + (prev.missed ? 0 : 1), feedback: r }
          : { ...prev, missed: true, base: { ...value }, feedback: r }
        : prev,
    )
  }, [value, run])

  const next = () => {
    if (!run) return
    const i = run.i + 1
    if (i >= run.tasks.length) {
      const stars = starsFromScore(run.score, run.tasks.length)
      const isBest = recordStars(RIG3D_STARS_ID, stars)
      setBest(getStars(RIG3D_STARS_ID))
      setResult({ score: run.score, stars, best: isBest })
      setRun(null)
      return
    }
    const base = begin(run.tasks[i])
    setRun({ ...run, i, missed: false, base, feedback: null, hint: false })
  }

  const task = run?.tasks[run.i]
  const top = (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">🎯 {t('rya.r3.ch.title')}</h2>
        <span className="flex items-center gap-2 text-sm text-slate-500">
          {t('rya.r3.ch.best')} <StarsView n={best} />
        </span>
      </div>
      {!run && (
        <div className="mt-2 space-y-2 text-sm">
          {result ? (
            <p className="text-base font-medium">
              {t('rya.r3.ch.done', { score: result.score, total: ROUND })} <StarsView n={result.stars} /> {result.best && <span className="text-emerald-600">· {t('rya.r3.ch.newBest')}</span>}
            </p>
          ) : (
            <p className="text-slate-600 dark:text-slate-300">{t('rya.r3.ch.intro')}</p>
          )}
          <button type="button" className="btn-primary" onClick={startRun}>
            ▶ {t(result ? 'rya.r3.ch.again' : 'rya.r3.ch.start')}
          </button>
        </div>
      )}
      {run && task && (
        <div className="mt-2 space-y-2 text-sm">
          <p className="text-xs text-slate-500">
            {t('rya.r3.ch.progress', { n: run.i + 1, total: run.tasks.length })} · {t('rya.r3.ch.score', { score: run.score })}
          </p>
          <p className="text-base font-semibold text-navy-900 dark:text-sky-100">{t(k(`rya.r3.t.${task.id}`))}</p>
          {run.feedback ? (
            <FeedbackLine t={t} ok={run.feedback.ok} control={run.feedback.control} dir={run.feedback.dir} />
          ) : (
            <p className="text-slate-500 dark:text-slate-400">{t('rya.r3.ch.how')}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {run.feedback?.ok ? (
              <button type="button" className="btn-primary" onClick={next}>
                {t('rya.r3.ch.next')} →
              </button>
            ) : (
              <button type="button" className="btn-secondary" onClick={() => setRun({ ...run, hint: true })}>
                💡 {t('rya.r3.ch.hint')}
              </button>
            )}
          </div>
          {run.hint && !run.feedback?.ok && (
            <p className="rounded bg-amber-50 px-2 py-1 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
              {t('rya.r3.ch.hintText', { parts: CONTROL_PARTS[task.control].map((p) => t(k(`rya.r3.p.${p}`))).join(', ') })}
            </p>
          )}
        </div>
      )}
    </Panel>
  )

  return <RigExplorer value={value} setValue={setValue} snap={snap} top={top} />
}

function FeedbackLine({ t, ok, control, dir }: { t: Translate; ok: boolean; control: ControlId; dir: 1 | -1 }) {
  const line = t(k(`rya.r3.c.${control}.name`))
  const action = t(dir > 0 ? 'rya.r3.pulled' : 'rya.r3.eased')
  const effect = t(k(`rya.r3.c.${control}.${dir > 0 ? 'pull' : 'ease'}`))
  return (
    <p className={`rounded px-2 py-1 font-medium ${ok ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200'}`}>
      {ok ? '✓' : '✗'} {t(ok ? 'rya.r3.ch.ok' : 'rya.r3.ch.wrong', { line, action, effect })}
    </p>
  )
}
