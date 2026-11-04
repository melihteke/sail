import { loadJson, saveJson } from '../../lib/storage'

export type Mode = 'learning' | 'challenge'

const BEST_KEY = 'sg-rp-best'
const MODE_KEY = 'sg-rp-mode'

type BestScores = Record<string, number>

export function getBest(scenarioId: string, mode: Mode): number | undefined {
  return loadJson<BestScores>(BEST_KEY, {})[`${scenarioId}:${mode}`]
}

/** Stores the score if it beats the previous best. Returns true for a new personal best. */
export function recordScore(scenarioId: string, mode: Mode, score: number): boolean {
  const all = loadJson<BestScores>(BEST_KEY, {})
  const key = `${scenarioId}:${mode}`
  if (all[key] !== undefined && all[key] >= score) return false
  all[key] = score
  saveJson(BEST_KEY, all)
  return true
}

export function getPreferredMode(): Mode {
  return loadJson<Mode>(MODE_KEY, 'learning') === 'challenge' ? 'challenge' : 'learning'
}

export function setPreferredMode(mode: Mode): void {
  saveJson(MODE_KEY, mode)
}
