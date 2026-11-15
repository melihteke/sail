import { loadJson, saveJson } from '../../lib/storage'

const KEY = 'rya-progress'

export type Stars = 0 | 1 | 2 | 3

/** Best stars per game/level id. */
export function getProgress(): Record<string, Stars> {
  return loadJson<Record<string, Stars>>(KEY, {})
}

export function getStars(id: string): Stars {
  return getProgress()[id] ?? 0
}

/** Stores the stars if they beat the previous best. Returns true when it is a new best. */
export function recordStars(id: string, stars: Stars): boolean {
  const all = getProgress()
  if ((all[id] ?? 0) >= stars) return false
  all[id] = stars
  saveJson(KEY, all)
  return true
}

/** Stars of a game with several levels: the average of its levels, rounded down. */
export function gameStars(prefix: string, levelIds: string[]): Stars {
  if (!levelIds.length) return getStars(prefix)
  const all = getProgress()
  const total = levelIds.reduce((sum, id) => sum + (all[`${prefix}:${id}`] ?? 0), 0)
  return Math.floor(total / levelIds.length) as Stars
}

export function starsFromScore(score: number, max: number): Stars {
  if (max <= 0) return 0
  const f = score / max
  if (f >= 0.9) return 3
  if (f >= 0.7) return 2
  if (f >= 0.4) return 1
  return 0
}
