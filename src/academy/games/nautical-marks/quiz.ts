export interface Question<T> {
  answer: T
  options: T[]
}

/** Mulberry32: tiny seeded PRNG so quizzes are reproducible in tests. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle<T>(items: T[], rnd: () => number): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Builds `count` questions with `optionCount` distinct options each; never the same answer twice in a row. */
export function makeQuiz<T>(pool: T[], count: number, optionCount: number, rnd: () => number): Question<T>[] {
  const questions: Question<T>[] = []
  let previous: T | undefined
  for (let i = 0; i < count; i++) {
    const candidates = pool.filter((p) => p !== previous)
    const answer = candidates[Math.floor(rnd() * candidates.length)]
    const distractors = shuffle(
      pool.filter((p) => p !== answer),
      rnd,
    ).slice(0, optionCount - 1)
    questions.push({ answer, options: shuffle([answer, ...distractors], rnd) })
    previous = answer
  }
  return questions
}
