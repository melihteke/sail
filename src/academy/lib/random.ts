export function shuffled<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** The answer plus up to n-1 other values, shuffled. */
export function withDistractors<T>(answer: T, pool: T[], n = 4): T[] {
  return shuffled([answer, ...shuffled(pool.filter((p) => p !== answer)).slice(0, n - 1)])
}
