/** A simple horn using WebAudio: '.' short blast, '-' prolonged blast. Returns a stop function. */
export function playHorn(pattern: string, opts: { short?: number; long?: number; gap?: number } = {}): () => void {
  const short = opts.short ?? 1
  const long = opts.long ?? 4
  const gap = opts.gap ?? 0.9
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const ctx = new Ctx()
  const out = ctx.createGain()
  out.gain.value = 0.15
  out.connect(ctx.destination)
  let t = ctx.currentTime + 0.05
  for (const ch of pattern) {
    const dur = ch === '-' ? long : short
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(1, t + 0.05)
    g.gain.setValueAtTime(1, t + dur - 0.08)
    g.gain.linearRampToValueAtTime(0, t + dur)
    g.connect(out)
    for (const f of [155, 233]) {
      const o = ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = f
      o.connect(g)
      o.start(t)
      o.stop(t + dur)
    }
    t += dur + gap
  }
  const end = setTimeout(() => ctx.close(), (t - ctx.currentTime + 0.5) * 1000)
  return () => {
    clearTimeout(end)
    void ctx.close()
  }
}

/** Visual notation: • for short, ▬ for prolonged. */
export function hornSymbols(pattern: string): string {
  return [...pattern].map((c) => (c === '-' ? '▬' : '•')).join(' ')
}
