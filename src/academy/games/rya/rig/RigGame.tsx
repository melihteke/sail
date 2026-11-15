import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { MessageKey } from '../../../i18n/en'
import { useI18n, type Translate } from '../../../i18n'
import { getStars, recordStars } from '../progress'
import { Feedback, Panel, StarsView } from '../ui'
import { applyAction, attempt, currentGroup, holdActions, rigStars, rigTasks, type ActionId, type Rig, type RigTask } from './rig'

const PREFIX = 'competent-crew:rig'

export function RigGame() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const task = rigTasks.find((x) => x.id === search.get('task')) ?? rigTasks[0]
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {rigTasks.map((x, i) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setSearch({ task: x.id }, { replace: true })}
            className={`rounded-lg border px-3 py-1.5 text-sm ${x.id === task.id ? 'border-navy-900 bg-navy-900 text-white dark:border-sea-500 dark:bg-sea-500' : 'border-slate-300 bg-white dark:border-white/20 dark:bg-white/5'}`}
          >
            {i + 1}. {t(`rya.rig.t.${x.id}` as MessageKey)} <StarsView n={getStars(`${PREFIX}:${x.id}`)} size="text-xs" />
          </button>
        ))}
      </div>
      <Task key={task.id} t={t} task={task} onNext={(id) => setSearch({ task: id }, { replace: true })} />
    </>
  )
}

function Task({ t, task, onNext }: { t: Translate; task: RigTask; onNext: (id: string) => void }) {
  const [rig, setRig] = useState<Rig>(task.start)
  const [done, setDone] = useState<ActionId[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [holding, setHolding] = useState<ActionId | null>(null)
  const [finished, setFinished] = useState(false)
  const raf = useRef(0)
  const gi = currentGroup(task, done)

  const complete = (a: ActionId) => {
    const res = attempt(task, done, a)
    if (!res.ok) return
    setRig((r) => applyAction(r, a, task))
    setDone((d) => [...d, a])
    setMsg({ ok: true, text: t(`rya.rig.x.${a}` as MessageKey) })
    if (res.finished) {
      setFinished(true)
      recordStars(`${PREFIX}:${task.id}`, rigStars(mistakes))
    }
  }

  const press = (a: ActionId) => {
    if (finished) return
    const res = attempt(task, done, a)
    if (!res.ok) {
      if (res.reason === 'done') return
      setMistakes((m) => m + 1)
      setMsg({ ok: false, text: `${t(res.reason === 'early' ? 'rya.rig.early' : 'rya.rig.wrong')} ${t(`rya.rig.x.${a}` as MessageKey)}` })
      return
    }
    const hold = holdActions[a]
    const animate = hold && !(a === 'hoistHalyard' && rig.cringleHooked)
    const lower = a === 'lowerHalyard'
    if (!animate && !lower) {
      complete(a)
      return
    }
    setHolding(a)
  }

  // Hold-to-winch: the sail moves while the button is held down.
  const rigRef = useRef(rig)
  rigRef.current = rig
  useEffect(() => {
    if (!holding) return
    const lower = holding === 'lowerHalyard'
    const hold = holdActions[holding]
    const key: 'main' | 'jib' = lower ? 'main' : hold!.value
    const target = lower ? task.lowerTo ?? 0 : hold!.target
    let last = performance.now()
    const loop = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      const cur = rigRef.current[key]
      const dir = Math.sign(target - cur)
      const next = cur + dir * dt * 0.35
      const reached = dir === 0 || (dir > 0 ? next >= target : next <= target)
      const updated = { ...rigRef.current, [key]: reached ? target : next }
      rigRef.current = updated
      setRig(updated)
      if (reached) {
        setHolding(null)
        complete(holding)
        return
      }
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holding])

  const release = () => setHolding(null)
  const restart = () => {
    setRig(task.start)
    setDone([])
    setMistakes(0)
    setMsg(null)
    setFinished(false)
  }
  const nextTask = rigTasks[rigTasks.findIndex((x) => x.id === task.id) + 1]

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <div>
        <Panel className="p-0">
          <RigSvg rig={rig} t={t} />
        </Panel>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">🎯 {t(`rya.rig.t.${task.id}.goal` as MessageKey)}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(gi / task.groups.length) * 100}%` }} />
          </div>
          <span className="text-xs text-slate-500">
            {gi}/{task.groups.length} · ❌ {mistakes}
          </span>
        </div>
        {msg && (
          <div className="mt-3">
            <Feedback ok={msg.ok}>{msg.text}</Feedback>
          </div>
        )}
        {mistakes >= 2 && !finished && (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
            💡 {t('rya.rig.hint')} {task.groups[gi]?.map((a) => t(`rya.rig.a.${a}` as MessageKey)).join(' / ')}
          </p>
        )}
        {finished && (
          <Panel className="mt-3 text-center">
            <StarsView n={rigStars(mistakes)} size="text-3xl" />
            <p className="mt-1 font-semibold">{t('rya.rig.done')}</p>
            <div className="mt-3 flex justify-center gap-2">
              <button type="button" className="btn-secondary" onClick={restart}>
                ↺ {t('rya.retry')}
              </button>
              {nextTask && (
                <button type="button" className="btn-primary" onClick={() => onNext(nextTask.id)}>
                  {t('rya.nextLevel')} →
                </button>
              )}
            </div>
          </Panel>
        )}
      </div>
      <Panel className="self-start">
        <h3 className="text-sm font-semibold">{t('rya.rig.actions')}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('rya.rig.actionsHint')}</p>
        <div className="mt-2 grid gap-1.5">
          {task.buttons.map((a) => {
            const isDone = done.includes(a)
            const isHold = (holdActions[a] && !(a === 'hoistHalyard' && rig.cringleHooked)) || a === 'lowerHalyard'
            return (
              <button
                key={a}
                type="button"
                disabled={isDone || finished}
                onPointerDown={() => press(a)}
                onPointerUp={release}
                onPointerLeave={release}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && press(a)}
                className={`btn-secondary select-none text-left ${holding === a ? '!border-sea-500 !bg-sea-100 dark:!bg-sea-500/20' : ''} ${isDone ? '!opacity-50 line-through' : ''}`}
              >
                {t(`rya.rig.a.${a}` as MessageKey)}
                {isHold && <span className="ml-1 text-xs text-slate-400">({t('rya.rig.hold')})</span>}
              </button>
            )
          })}
        </div>
        <button type="button" className="btn-secondary mt-3 w-full" onClick={restart}>
          ↺ {t('rya.restart')}
        </button>
      </Panel>
    </div>
  )
}

function RigSvg({ rig, t }: { rig: Rig; t: Translate }) {
  const mastX = 200
  const mastTop = 30
  const gooseY = 182
  const boomEnd = { x: 92, y: rig.toppingUp ? 166 : 186 }
  const boomOut = rig.sheetEased ? 0.6 : 1
  const boomX = mastX - (mastX - boomEnd.x) * boomOut
  const flap = rig.main > 0.03 && (rig.headToWind || rig.sheetEased)
  const footY = rig.reefed ? gooseY - 40 : gooseY
  const headY = footY - (footY - mastTop) * Math.min(1, rig.main / (rig.reefed ? 0.72 : 1))
  const sailVisible = rig.main > 0.02
  const tack = { x: 336, y: 222 }
  const fsHead = { x: 206, y: 40 }
  const clewOut = { x: 236, y: 214 }
  const clew = { x: tack.x + (clewOut.x - tack.x) * rig.jib, y: tack.y + (clewOut.y - tack.y) * rig.jib }
  const jibHead = { x: tack.x + (fsHead.x - tack.x) * Math.max(rig.jib, 0.0001), y: tack.y + (fsHead.y - tack.y) * Math.max(rig.jib, 0.0001) }
  return (
    <svg viewBox="0 0 420 290" className="block w-full rounded-xl bg-gradient-to-b from-sky-100 to-sky-200 dark:from-navy-900 dark:to-navy-950">
      <rect x="0" y="236" width="420" height="54" fill="#1e9bd7" opacity="0.5" />
      {/* hull */}
      <path d="M58 214 L350 214 Q346 236 318 246 L90 246 Q66 238 58 214 Z" fill="#f8fafc" stroke="#0b3a5c" strokeWidth="2" />
      <path d="M62 222 L346 222" stroke="#1e9bd7" strokeWidth="3" />
      <path d="M150 214 L160 204 L250 204 L258 214" fill="#e2e8f0" stroke="#0b3a5c" />
      {/* forestay and backstay */}
      <line x1={mastX} y1={mastTop} x2={tack.x} y2={tack.y - 6} stroke="#475569" strokeWidth="1.2" />
      <line x1={mastX} y1={mastTop} x2={64} y2={214} stroke="#475569" strokeWidth="1.2" />
      {/* jib */}
      {rig.jib > 0.02 ? (
        <path d={`M${tack.x} ${tack.y - 4} L${jibHead.x} ${jibHead.y} Q${(jibHead.x + clew.x) / 2 - 14} ${(jibHead.y + clew.y) / 2} ${clew.x} ${clew.y} Z`} fill="#fff" stroke="#334155" strokeWidth="1.2" opacity="0.95" />
      ) : null}
      <line x1={tack.x} y1={tack.y - 6} x2={fsHead.x + 10} y2={fsHead.y + 14} stroke="#cbd5e1" strokeWidth={(1 - rig.jib) * 6 + 1} strokeLinecap="round" />
      {/* mast */}
      <rect x={mastX - 3} y={mastTop} width="6" height={214 - mastTop} fill="#94a3b8" />
      {/* topping lift */}
      <line x1={mastX} y1={mastTop} x2={boomX} y2={boomEnd.y} stroke={rig.toppingUp ? '#16a34a' : '#cbd5e1'} strokeWidth="1" strokeDasharray={rig.toppingUp ? undefined : '3 3'} />
      {/* mainsail */}
      {sailVisible && (
        <g className={flap ? 'sg-flutter' : undefined}>
          <path d={`M${mastX - 2} ${headY} L${mastX - 2} ${footY} L${boomX + 4} ${footY + (boomEnd.y - gooseY)} Q${(mastX + boomX) / 2 - 14} ${(headY + footY) / 2} ${mastX - 2} ${headY} Z`} fill="#fff" stroke="#334155" strokeWidth="1.2" />
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={mastX - 2} y1={headY + (footY - headY) * f} x2={mastX - 2 - (mastX - boomX) * f * 0.85} y2={headY + (footY - headY) * f + 2} stroke="#cbd5e1" />
          ))}
        </g>
      )}
      {/* boom */}
      <line x1={mastX} y1={gooseY} x2={boomX} y2={boomEnd.y} stroke="#334155" strokeWidth="5" strokeLinecap="round" />
      {/* kicker */}
      <line x1={mastX - 2} y1={208} x2={mastX - 32} y2={gooseY + 2} stroke={rig.kickerEased ? '#f59e0b' : '#334155'} strokeWidth="2" strokeDasharray={rig.kickerEased ? '4 3' : undefined} />
      {/* mainsheet */}
      <line x1={boomX + 18} y1={boomEnd.y + 2} x2={110} y2={212} stroke={rig.sheetEased ? '#f59e0b' : '#334155'} strokeWidth="1.5" strokeDasharray={rig.sheetEased ? '4 3' : undefined} />
      {/* bundled sail, ties and cover */}
      {(rig.main < 0.98 || rig.reefed) && (
        <path d={`M${mastX - 4} ${gooseY - 2} L${boomX + 6} ${boomEnd.y - 4} L${boomX + 6} ${boomEnd.y + 2} L${mastX - 4} ${gooseY + 3} Z`} fill={rig.cover ? '#1d4ed8' : '#f1f5f9'} stroke="#334155" strokeWidth="1" />
      )}
      {(rig.ties || rig.reefTied) &&
        [0.25, 0.5, 0.75].map((f) => {
          const x = mastX - (mastX - boomX) * f
          const y = gooseY + (boomEnd.y - gooseY) * f
          return <line key={f} x1={x} y1={y - 7} x2={x} y2={y + 6} stroke="#0f172a" strokeWidth="2" />
        })}
      {rig.reefed && (
        <circle cx={mastX - 4} cy={footY} r="4" fill={rig.cringleHooked ? '#16a34a' : '#f59e0b'} stroke="#334155" />
      )}
      {rig.reefed && <line x1={boomX + 4} y1={boomEnd.y} x2={boomX + 8} y2={footY + (boomEnd.y - gooseY)} stroke={rig.pennantTight ? '#dc2626' : '#fca5a5'} strokeWidth="2" />}
      {/* crew at the mast */}
      {rig.harness && (
        <g transform={`translate(${mastX + 14} 186)`}>
          <circle r="5" fill="#f59e0b" />
          <rect x="-4" y="5" width="8" height="12" fill="#dc2626" />
          <line x1="0" y1="10" x2="-14" y2="20" stroke="#facc15" strokeWidth="1.5" />
        </g>
      )}
      {!rig.tidy && <text x="120" y="232" fontSize="14">🪢</text>}
      <MiniCompass headToWind={rig.headToWind} t={t} />
    </svg>
  )
}

function MiniCompass({ headToWind, t }: { headToWind: boolean; t: Translate }) {
  const heading = headToWind ? -18 : -60
  return (
    <g transform="translate(372 60)">
      <circle r="34" fill="#fff" fillOpacity="0.85" stroke="#94a3b8" />
      <path d="M0 -44 L-5 -36 L5 -36 Z" fill="#0b3a5c" />
      <text y="-48" textAnchor="middle" fontSize="9" fill="#0b3a5c">
        {t('rya.wind')}
      </text>
      <g transform={`rotate(${heading})`}>
        <path d="M0 -20 C7 -10 7 6 5 16 L-5 16 C-7 6 -7 -10 0 -20 Z" fill="#0b3a5c" />
      </g>
      <text y="48" textAnchor="middle" fontSize="9" fill="#334155">
        {headToWind ? t('rya.rig.closeToWind') : t('rya.rig.sailing')}
      </text>
    </g>
  )
}
