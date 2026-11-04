import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { sailboat } from '../../boats/sailboat'
import { pointOfSail, trueWindAngle, type Environment } from '../../core/environment'
import { type LatLon } from '../../core/geo'
import { laylineBearings } from '../../core/laylines'
import { minTwa } from '../../core/polar'
import { evaluateRoute, sampleRoute, type EvaluatedRoute } from '../../core/route'
import { formatDuration, norm180 } from '../../core/units'
import { add, bearingOf, fromBearing, sub, type Vec2 } from '../../core/vec'
import type { MessageKey } from '../../i18n/en'
import { useI18n, type Translate } from '../../i18n'
import { FlowField } from '../../map/FlowField'
import { WindCompass } from '../../map/WindCompass'
import { checkLegsForLand, type LandCheck } from '../../map/landCheck'
import { analyzeRoute, type RouteAnalysis } from './analysis'
import { recordScore, type Mode } from './progress'
import { RouteMap, type BoatMarker, type Layline } from './RouteMap'
import { findScenario, sameEnvironment, scenarios, type Scenario } from './scenarios'
import { legsOnLand, localize, marksMissed, scenarioOptimal } from './solve'

type Phase = 'plan' | 'sail' | 'result'

const SAIL_ANIMATION_S = 12
const boat = sailboat

export function RoutePlannerGame() {
  const { scenarioId } = useParams()
  const [search] = useSearchParams()
  const mode: Mode = search.get('mode') === 'challenge' ? 'challenge' : 'learning'
  const scenario = findScenario(scenarioId)
  if (!scenario) return <Navigate to="/route-planner" replace />
  return <Game key={`${scenario.id}:${mode}`} scenario={scenario} mode={mode} />
}

const deg = (d: number) => `${Math.round(((d % 360) + 360) % 360)
  .toString()
  .padStart(3, '0')}°`

function legLabelFor(route: EvaluatedRoute, i: number, t: Translate): string {
  const leg = route.legs[i]
  if (!leg.ok) return `${t('rp.leg')} ${i + 1}: ${t(`rp.legFail.${leg.reason}`)}`
  return `${t('rp.leg')} ${i + 1}: ${t('rp.heading')} ${deg(leg.headingDeg)} · ${t('rp.twa')} ${Math.abs(
    Math.round(leg.twa),
  )}° ${t(`tack.${leg.tack}`)} · ${leg.sogKn.toFixed(1)} ${t('common.kn')}`
}

type FreeLandState = LandCheck | { status: 'checking' }

/** In free planning there are no land outlines, so check legs against the OSM tiles instead. */
function useFreeLandCheck(enabled: boolean, waypoints: LatLon[], start: LatLon, finish: LatLon): FreeLandState {
  const key = JSON.stringify([start, ...waypoints, finish])
  const [state, setState] = useState<{ key: string; result: LandCheck } | null>(null)
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const timer = setTimeout(() => {
      void checkLegsForLand(JSON.parse(key) as LatLon[]).then((result) => {
        if (!cancelled) setState({ key, result })
      })
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [enabled, key])
  if (!enabled) return { status: 'ok', landLegs: [] }
  return state?.key === key ? state.result : { status: 'checking' }
}

export function Game({ scenario, mode, onEditSetup }: { scenario: Scenario; mode: Mode; onEditSetup?: () => void }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const learning = mode === 'learning'
  const local = useMemo(() => localize(scenario), [scenario])
  const proj = local.proj
  const toLatLon = useCallback((p: { x: number; y: number }) => proj.toLatLon(p), [proj])

  const [env, setEnv] = useState<Environment>(scenario.env)
  const [waypoints, setWaypoints] = useState<LatLon[]>([])
  const [phase, setPhase] = useState<Phase>('plan')
  const [simTime, setSimTime] = useState(0)
  const [showOptimal, setShowOptimal] = useState(true)
  const [result, setResult] = useState<{ analysis: RouteAnalysis; newBest: boolean } | null>(null)

  const startLocal = local.start
  const finishLocal = local.finish
  const route = useMemo(
    () => evaluateRoute([startLocal, ...waypoints.map((w) => proj.toLocal(w)), finishLocal], env, boat),
    [startLocal, finishLocal, waypoints, proj, env],
  )
  const optimal = useMemo(() => scenarioOptimal(local, env), [local, env])
  const missed = marksMissed(local, route.points)
  const markOk = missed.length === 0
  const freeLand = useFreeLandCheck(!!scenario.free, waypoints, scenario.start, scenario.finish)
  const landLegs = scenario.free ? (freeLand.status === 'ok' ? freeLand.landLegs : []) : legsOnLand(local, route.points)
  const customEnv = !sameEnvironment(env, scenario.env)
  const scenarioMarks = useMemo(() => scenario.marks ?? [], [scenario])

  const laylines = useMemo<Layline[]>(() => {
    if (!learning || phase === 'sail') return []
    const toTarget = (from: Vec2, target: Vec2, targetLatLon: LatLon): Layline[] => {
      const course = bearingOf(sub(target, from))
      const upwind = Math.abs(norm180(env.windFromDeg - course)) < 90
      const len = Math.max(1500, Math.hypot(target.x - from.x, target.y - from.y) * 0.9)
      return laylineBearings(env, boat, upwind).map((b) => ({
        from: targetLatLon,
        to: proj.toLatLon(add(target, fromBearing(b, len))),
      }))
    }
    const targets = [...local.marks.map((m, i) => ({ at: m.at, ll: scenarioMarks[i].at })), { at: finishLocal, ll: scenario.finish }]
    return targets.flatMap((tg, i) => toTarget(i === 0 ? startLocal : targets[i - 1].at, tg.at, tg.ll))
  }, [learning, phase, env, startLocal, finishLocal, scenario, proj, local, scenarioMarks])

  const duration = Math.max(route.totalTimeS, optimal?.totalTimeS ?? 0)

  const finishSail = useCallback(() => {
    if (!optimal) return
    const analysis = analyzeRoute(route, optimal, env, boat)
    const newBest = !customEnv && !scenario.free && recordScore(scenario.id, mode, analysis.score)
    setResult({ analysis, newBest })
    setSimTime(duration)
    setPhase('result')
  }, [optimal, route, env, customEnv, scenario.id, scenario.free, mode, duration])

  useEffect(() => {
    if (phase !== 'sail') return
    const speed = duration / SAIL_ANIMATION_S
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const st = ((now - t0) / 1000) * speed
      if (st >= duration) {
        finishSail()
        return
      }
      setSimTime(st)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, duration, finishSail])

  const editable = phase === 'plan'
  const firstLeg = route.legs[0]
  const markInstructions = scenarioMarks.map((m, i) =>
    t('rp.roundMark', {
      mark: `${scenarioMarks.length > 1 ? `${i + 1}. ` : ''}${t(`rp.mark.${m.kind}`)}`,
      side: t(`side.${m.side}`),
    }),
  )
  const canSail = route.feasible && markOk && landLegs.length === 0 && !!optimal && freeLand.status !== 'checking'

  const boats = useMemo<BoatMarker[]>(() => {
    const marker = (position: LatLon, headingDeg: number, variant: BoatMarker['variant']): BoatMarker => ({
      position,
      headingDeg,
      twa: trueWindAngle(headingDeg, env),
      variant,
    })
    if (phase === 'plan') {
      const heading = firstLeg?.ok ? firstLeg.headingDeg : bearingOf(sub(finishLocal, startLocal))
      return [marker(scenario.start, heading, 'player')]
    }
    const list: BoatMarker[] = []
    if (optimal && (phase === 'sail' || showOptimal)) {
      const s = sampleRoute(optimal, simTime)
      list.push(marker(proj.toLatLon(s.position), s.headingDeg, 'ghost'))
    }
    const s = sampleRoute(route, simTime)
    list.push(marker(proj.toLatLon(s.position), s.headingDeg, 'player'))
    return list
  }, [phase, simTime, optimal, route, proj, showOptimal, scenario.start, firstLeg, finishLocal, startLocal, env])

  const tacks = route.maneuvers.filter((m) => m.type === 'tack').length
  const gybes = route.maneuvers.filter((m) => m.type === 'gybe').length
  const nextScenario = scenarios[(scenarios.findIndex((s) => s.id === scenario.id) + 1) % scenarios.length]

  const resetToPlan = () => {
    setPhase('plan')
    setSimTime(0)
    setResult(null)
  }

  return (
    <div className="flex flex-col md:h-[calc(100vh-7.25rem)] md:flex-row">
      <div className="relative h-[55vh] md:h-auto md:flex-1">
        <RouteMap
          start={scenario.start}
          finish={scenario.finish}
          waypoints={waypoints}
          editable={editable}
          route={route}
          toLatLon={toLatLon}
          legLabel={(i) =>
            landLegs.includes(i)
              ? `${t('rp.leg')} ${i + 1}: ${t('rp.legFail.land')}`
              : learning || !route.legs[i].ok
                ? legLabelFor(route, i, t)
                : null
          }
          badLegs={landLegs}
          optimal={phase === 'result' && showOptimal ? optimal : null}
          laylines={laylines}
          boats={boats}
          marks={scenarioMarks.map((m, i) => ({
            at: m.at,
            kind: m.kind,
            side: m.side,
            label: markInstructions[i],
            ok: !missed.includes(i),
          }))}
          decorations={scenario.decorations?.map((d) => ({
            ...d,
            label: d.id === 'race' ? t('np.raceMark') : t(`mark.${d.id}.name` as MessageKey),
          }))}
          labels={{ start: t('rp.start'), finish: t('rp.finish') }}
          onAdd={(p) => setWaypoints((w) => [...w, p])}
          onMove={(i, p) => setWaypoints((w) => w.map((x, j) => (j === i ? p : x)))}
          onRemove={(i) => setWaypoints((w) => w.filter((_, j) => j !== i))}
        />
        <FlowField env={env} />
        <div className="pointer-events-none absolute right-3 top-3 z-[1000]">
          <WindCompass
            env={env}
            minTwa={minTwa(boat.polar)}
            windLabel={`${t('rp.wind')} ${t('rp.windFrom', { deg: env.windFromDeg })}`}
            currentLabel={`${t('rp.current')} ${t('rp.currentTo', { deg: env.currentSetDeg })}`}
            noGoLabel={t('rp.noGoShort')}
          />
        </div>
        <Legend t={t} learning={learning} showOptimal={phase === 'result' && showOptimal} />
      </div>

      <aside className="w-full overflow-y-auto border-l border-slate-200 bg-white p-4 md:w-[24rem] dark:border-white/10 dark:bg-navy-950">
        {onEditSetup ? (
          <button type="button" className="text-sm text-sea-500 hover:underline" onClick={onEditSetup}>
            ← {t('fp.backToSetup')}
          </button>
        ) : (
          <Link to="/route-planner" className="text-sm text-sea-500 hover:underline">
            ← {t('rp.scenarios')}
          </Link>
        )}
        <div className="mt-1 flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold">{t(`scenario.${scenario.id}.title` as MessageKey)}</h1>
          <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-white/10">
            {t(`rp.mode.${mode}`)}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(`scenario.${scenario.id}.desc` as MessageKey)}</p>

        {markInstructions.length > 0 && (
          <ul className="mt-2 space-y-1">
            {markInstructions.map((ins, i) => {
              const ok = !missed.includes(i)
              return (
                <li
                  key={i}
                  className={`rounded-lg border p-2 text-sm font-medium ${
                    ok
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100'
                      : 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100'
                  }`}
                >
                  {ok ? '✓ ' : '⚑ '}
                  {ins}
                </li>
              )
            })}
          </ul>
        )}
        {scenario.land?.length ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">🏝 {t('rp.landNote')}</p> : null}
        {scenario.free && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            🏝 {t(freeLand.status === 'checking' ? 'fp.landChecking' : freeLand.status === 'unknown' ? 'fp.landUnknown' : 'fp.landOn')}
          </p>
        )}

        <Conditions env={env} t={t} />

        {learning && (
          <p className="mt-2 rounded-lg bg-sea-100 p-2 text-xs text-navy-900 dark:bg-navy-900 dark:text-slate-200">
            {(() => {
              const target = local.marks[0]?.at ?? finishLocal
              const markDeg = bearingOf(sub(target, startLocal))
              const twa = Math.abs(norm180(env.windFromDeg - markDeg))
              return t(local.marks.length ? 'rp.markBearingMark' : 'rp.markBearing', {
                deg: Math.round(markDeg),
                twa: Math.round(twa),
                pos: t(`pos.${pointOfSail(twa, minTwa(boat.polar))}`).toLowerCase(),
              })
            })()}
          </p>
        )}

        {learning && (
          <EnvironmentEditor
            env={env}
            disabled={phase !== 'plan'}
            custom={customEnv}
            onChange={setEnv}
            onReset={() => setEnv(scenario.env)}
            t={t}
          />
        )}

        {phase === 'plan' && (
          <section className="mt-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">{t('rp.planHint')}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn-secondary" onClick={() => setWaypoints((w) => w.slice(0, -1))} disabled={!waypoints.length}>
                {t('rp.undo')}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setWaypoints([])} disabled={!waypoints.length}>
                {t('rp.clear')}
              </button>
              <button
                type="button"
                className="btn-primary ml-auto"
                disabled={!canSail}
                onClick={() => {
                  setSimTime(0)
                  setPhase('sail')
                }}
              >
                ⛵ {t('rp.sail')}
              </button>
            </div>
            {landLegs.length > 0 && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
                {t('rp.onLand', { legs: landLegs.map((i) => i + 1).join(', ') })}
              </div>
            )}
            {route.feasible && !markOk && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
                {t('rp.roundingWrong', { instruction: missed.map((i) => markInstructions[i]).join(' ') })}
              </div>
            )}
            {!route.feasible && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
                <p className="font-medium">{t('rp.fixLegs')}</p>
                <ul className="mt-1 list-disc pl-5">
                  {route.legs.map((l, i) => (!l.ok ? <li key={i}>{legLabelFor(route, i, t)}</li> : null))}
                </ul>
              </div>
            )}
          </section>
        )}

        {phase !== 'result' && (
          <RouteSummary route={route} tacks={tacks} gybes={gybes} learning={learning} t={t} />
        )}

        {phase === 'sail' && (
          <section className="mt-4 rounded-lg bg-sea-100 p-3 text-sm dark:bg-navy-900">
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('rp.sailing')}</span>
              <span className="font-mono">{formatDuration(Math.min(simTime, route.totalTimeS))}</span>
            </div>
            <button type="button" className="btn-secondary mt-2" onClick={finishSail}>
              {t('rp.skip')}
            </button>
          </section>
        )}

        {phase === 'result' && result && optimal && (
          <ResultPanel
            analysis={result.analysis}
            newBest={result.newBest}
            route={route}
            optimal={optimal}
            showOptimal={showOptimal}
            onToggleOptimal={() => setShowOptimal((s) => !s)}
            onEdit={resetToPlan}
            onNext={scenario.free ? undefined : () => navigate(`/route-planner/${nextScenario.id}?mode=${mode}`)}
            t={t}
          />
        )}
      </aside>
    </div>
  )
}

function Conditions({ env, t }: { env: Environment; t: Translate }) {
  return (
    <section className="mt-4 grid grid-cols-2 gap-2 text-sm">
      <div className="rounded-lg bg-slate-100 p-2 dark:bg-white/5">
        <div className="text-xs text-slate-500 dark:text-slate-400">{t('rp.wind')}</div>
        <div className="font-semibold">
          {t('rp.windFrom', { deg: env.windFromDeg })} · {env.windSpeedKn} {t('common.kn')}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          → {t('rp.windTo', { deg: (env.windFromDeg + 180) % 360 })}
        </div>
      </div>
      <div className="rounded-lg bg-slate-100 p-2 dark:bg-white/5">
        <div className="text-xs text-slate-500 dark:text-slate-400">{t('rp.current')}</div>
        <div className="font-semibold">
          {env.currentSpeedKn > 0
            ? `${t('rp.currentTo', { deg: env.currentSetDeg })} · ${env.currentSpeedKn} ${t('common.kn')}`
            : '–'}
        </div>
      </div>
      <p className="col-span-2 text-xs text-slate-500 dark:text-slate-400">{t('rp.conventions')}</p>
    </section>
  )
}

interface EditorProps {
  env: Environment
  disabled: boolean
  custom: boolean
  onChange: (e: Environment) => void
  onReset: () => void
  t: Translate
}

function EnvironmentEditor({ env, disabled, custom, onChange, onReset, t }: EditorProps) {
  const slider = (key: keyof Environment, label: string, min: number, max: number, step: number, unit: string) => (
    <label className="block text-xs">
      <span className="flex justify-between text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-mono text-slate-800 dark:text-slate-100">
          {env[key]}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={env[key]}
        disabled={disabled}
        onChange={(e) => onChange({ ...env, [key]: Number(e.target.value) })}
        className="w-full accent-sea-500"
      />
    </label>
  )
  return (
    <details className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-white/10">
      <summary className="cursor-pointer text-sm font-medium">
        {t('rp.wind')} &amp; {t('rp.current')}
      </summary>
      <div className="mt-2 space-y-2">
        {slider('windFromDeg', t('rp.windDirection'), 0, 355, 5, '°')}
        {slider('windSpeedKn', t('rp.windSpeed'), 2, 25, 1, ` ${t('common.kn')}`)}
        {slider('currentSetDeg', t('rp.currentDirection'), 0, 355, 5, '°')}
        {slider('currentSpeedKn', t('rp.currentSpeed'), 0, 3, 0.1, ` ${t('common.kn')}`)}
        {custom && <p className="text-xs text-amber-700 dark:text-amber-300">{t('rp.customConditions')}</p>}
        <button type="button" className="btn-secondary" onClick={onReset} disabled={disabled || !custom}>
          {t('rp.resetConditions')}
        </button>
      </div>
    </details>
  )
}

interface SummaryProps {
  route: EvaluatedRoute
  tacks: number
  gybes: number
  learning: boolean
  t: Translate
}

function RouteSummary({ route, tacks, gybes, learning, t }: SummaryProps) {
  return (
    <section className="mt-4">
      <dl className="grid grid-cols-4 gap-2 text-center text-sm">
        <Stat label={t('rp.estimate')} value={route.feasible ? formatDuration(route.totalTimeS) : '–'} />
        <Stat label={t('rp.distance')} value={route.distanceM >= 5000 ? `${(route.distanceM / 1852).toFixed(1)} nm` : `${(route.distanceM / 1000).toFixed(2)} km`} />
        <Stat label={t('rp.tacks')} value={String(tacks)} />
        <Stat label={t('rp.gybes')} value={String(gybes)} />
      </dl>
      {learning && (
        <table className="mt-3 w-full text-left text-xs">
          <thead className="text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-1">#</th>
              <th>{t('rp.heading')}</th>
              <th>{t('rp.twa')}</th>
              <th>{t('rp.pointOfSail')}</th>
              <th className="text-right">{t('rp.sog')}</th>
              <th className="text-right">{t('rp.time')}</th>
            </tr>
          </thead>
          <tbody>
            {route.legs.map((leg, i) => {
              const m = route.maneuvers.find((x) => x.pointIndex === i)
              return [
                m && (
                  <tr key={`m${i}`} className="text-slate-500 dark:text-slate-400">
                    <td />
                    <td colSpan={5} className="py-0.5 italic">
                      ↻ {t(`rp.maneuver.${m.type}`)} (+{m.penaltyS} s)
                    </td>
                  </tr>
                ),
                <tr key={i} className="border-t border-slate-100 dark:border-white/5">
                  <td className="py-1">{i + 1}</td>
                  {leg.ok ? (
                    <>
                      <td className="font-mono">{deg(leg.headingDeg)}</td>
                      <td className={leg.tack === 'port' ? 'text-port' : 'text-starboard'}>
                        {Math.abs(Math.round(leg.twa))}° {t(`tack.${leg.tack}`)}
                      </td>
                      <td>{t(`pos.${leg.pointOfSail}`)}</td>
                      <td className="text-right font-mono">{leg.sogKn.toFixed(1)}</td>
                      <td className="text-right font-mono">{formatDuration(leg.timeS)}</td>
                    </>
                  ) : (
                    <td colSpan={5} className="text-rose-600">
                      {t(`rp.legFail.${leg.reason}`)}
                    </td>
                  )}
                </tr>,
              ]
            })}
          </tbody>
        </table>
      )}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 p-2 dark:bg-white/5">
      <dt className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-mono font-semibold">{value}</dd>
    </div>
  )
}

interface ResultProps {
  analysis: RouteAnalysis
  newBest: boolean
  route: EvaluatedRoute
  optimal: EvaluatedRoute
  showOptimal: boolean
  onToggleOptimal: () => void
  onEdit: () => void
  onNext?: () => void
  t: Translate
}

const toneClass = {
  good: 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40',
  info: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40',
  warn: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40',
}

function ResultPanel({ analysis, newBest, route, optimal, showOptimal, onToggleOptimal, onEdit, onNext, t }: ResultProps) {
  return (
    <section className="mt-4">
      <h2 className="text-lg font-semibold">{t('res.title')}</h2>
      <div className="mt-2 flex items-center gap-3">
        <div className="text-4xl font-bold text-navy-900 dark:text-white">{analysis.score}</div>
        <div>
          <div className="text-xl tracking-widest text-amber-500" aria-label={`${analysis.stars}/3`}>
            {'★'.repeat(analysis.stars)}
            <span className="text-slate-300 dark:text-slate-600">{'★'.repeat(3 - analysis.stars)}</span>
          </div>
          {newBest && <div className="text-xs font-medium text-emerald-600">{t('res.newBest')}</div>}
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-center text-sm">
        <Stat label={t('res.yourTime')} value={formatDuration(route.totalTimeS)} />
        <Stat label={t('res.optimalTime')} value={formatDuration(optimal.totalTimeS)} />
      </dl>
      <h3 className="mt-4 text-sm font-semibold">{t('res.feedback')}</h3>
      <ul className="mt-2 space-y-2 text-sm">
        {analysis.feedback.map((f, i) => (
          <li key={i} className={`rounded-lg border p-2 ${toneClass[f.tone]}`}>
            {t(f.key, f.params)}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-primary" onClick={onEdit}>
          {t('res.editRoute')}
        </button>
        <button type="button" className="btn-secondary" onClick={onToggleOptimal}>
          {showOptimal ? t('res.hideOptimal') : t('res.showOptimal')}
        </button>
        {onNext && (
          <button type="button" className="btn-secondary" onClick={onNext}>
            {t('res.next')} →
          </button>
        )}
      </div>
    </section>
  )
}

function Legend({ t, learning, showOptimal }: { t: Translate; learning: boolean; showOptimal: boolean }) {
  const item = (color: string, label: string, dashed = false) => (
    <li className="flex items-center gap-1.5">
      <span
        className="inline-block h-0 w-5 border-t-[3px]"
        style={{ borderColor: color, borderStyle: dashed ? 'dashed' : 'solid' }}
      />
      {label}
    </li>
  )
  return (
    <ul className="pointer-events-none absolute bottom-6 left-2 z-[1000] space-y-0.5 rounded bg-white/90 px-2 py-1.5 text-[11px] text-slate-700 shadow">
      {item('#1f9a4d', t('rp.legend.starboard'))}
      {item('#d6312b', t('rp.legend.port'))}
      {item('#ef4444', t('rp.legend.invalid'), true)}
      {learning && item('#7c3aed', t('rp.legend.layline'), true)}
      {showOptimal && item('#f59e0b', t('rp.legend.optimal'), true)}
    </ul>
  )
}
