import { useEffect, useState } from 'react'

/** Seconds since mount (or since `resetKey` changed), updated about `fps` times per second while `active`. */
export function useClock(active = true, fps = 30, resetKey: unknown = 0): number {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (!active) return
    const t0 = performance.now()
    let raf = 0
    let last = 0
    const tick = (now: number) => {
      if (now - last >= 1000 / fps) {
        last = now
        setT((now - t0) / 1000)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, fps, resetKey])
  return t
}
