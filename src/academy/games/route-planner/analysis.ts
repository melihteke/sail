import type { BoatProfile } from '../../boats/sailboat'
import { trueWindAngle, type Environment } from '../../core/environment'
import { bestBeat, bestRun } from '../../core/polar'
import { evaluateRoute, type EvaluatedRoute } from '../../core/route'
import { bearingOf, sub } from '../../core/vec'
import type { MessageKey } from '../../i18n/en'

export interface FeedbackItem {
  key: MessageKey
  params?: Record<string, string | number>
  tone: 'good' | 'info' | 'warn'
}

export interface RouteAnalysis {
  /** optimal time / player time, capped at 1. */
  efficiency: number
  score: number
  stars: 0 | 1 | 2 | 3
  deltaS: number
  feedback: FeedbackItem[]
}

export function scoreFor(efficiency: number): number {
  return Math.round(1000 * Math.min(1, efficiency) ** 2)
}

export function starsFor(efficiency: number): 0 | 1 | 2 | 3 {
  if (efficiency >= 0.98) return 3
  if (efficiency >= 0.9) return 2
  if (efficiency >= 0.75) return 1
  return 0
}

export function analyzeRoute(
  player: EvaluatedRoute,
  optimal: EvaluatedRoute,
  env: Environment,
  boat: BoatProfile,
): RouteAnalysis {
  const efficiency = Math.min(1, optimal.totalTimeS / player.totalTimeS)
  const deltaS = Math.max(0, player.totalTimeS - optimal.totalTimeS)
  const feedback: FeedbackItem[] = []
  const beat = bestBeat(boat.polar, env.windSpeedKn)
  const run = bestRun(boat.polar, env.windSpeedKn)
  const finish = player.points[player.points.length - 1]

  if (efficiency >= 0.995) feedback.push({ key: 'fb.perfect', tone: 'good' })
  else if (deltaS < 15) feedback.push({ key: 'fb.close', params: { seconds: Math.round(deltaS) }, tone: 'good' })

  const yours = player.maneuvers.length
  const best = optimal.maneuvers.length
  if (yours > best) {
    feedback.push({
      key: 'fb.extraManeuvers',
      params: { yours, optimal: best, tack: boat.tackPenaltyS, gybe: boat.gybePenaltyS },
      tone: 'warn',
    })
  } else if (yours < best && efficiency < 0.97) {
    feedback.push({ key: 'fb.fewerManeuvers', params: { optimal: best }, tone: 'info' })
  }

  let pinchingReported = false
  let wideReported = false
  let runReported = false
  player.legs.forEach((leg, i) => {
    if (!leg.ok) return
    const twa = Math.abs(leg.twa)
    const n = i + 1
    if (!pinchingReported && twa < beat.twa - 3) {
      pinchingReported = true
      feedback.push({ key: 'fb.pinching', params: { leg: n, twa: Math.round(twa), best: beat.twa }, tone: 'warn' })
    }
    const stillBeating = Math.abs(trueWindAngle(bearingOf(sub(finish, leg.from)), env)) < beat.twa
    if (!wideReported && stillBeating && twa < 90 && twa > beat.twa + 8) {
      wideReported = true
      feedback.push({ key: 'fb.tooWide', params: { leg: n, twa: Math.round(twa), best: beat.twa }, tone: 'warn' })
    }
    if (!runReported && twa > 170 && run.twa < 165) {
      runReported = true
      feedback.push({
        key: 'fb.deadRun',
        params: { leg: n, wind: env.windSpeedKn, best: run.twa },
        tone: 'info',
      })
    }
  })

  const extra = player.distanceM - optimal.distanceM
  if (efficiency < 0.995 && extra > 50 && extra > optimal.distanceM * 0.05) {
    feedback.push({ key: 'fb.extraDistance', params: { extra: Math.round(extra) }, tone: 'info' })
  }

  if (env.currentSpeedKn > 0) {
    const still = evaluateRoute(player.points, { ...env, currentSpeedKn: 0 }, boat)
    if (still.feasible) {
      const impact = player.totalTimeS - still.totalTimeS
      if (Math.abs(impact) >= 10) {
        feedback.push({
          key: impact < 0 ? 'fb.currentHelped' : 'fb.currentHurt',
          params: { seconds: Math.round(Math.abs(impact)) },
          tone: impact < 0 ? 'good' : 'warn',
        })
      }
    }
  }

  feedback.push({ key: 'fb.vmgTip', params: { wind: env.windSpeedKn, beat: beat.twa, run: run.twa }, tone: 'info' })

  return { efficiency, score: scoreFor(efficiency), stars: starsFor(efficiency), deltaS, feedback }
}
