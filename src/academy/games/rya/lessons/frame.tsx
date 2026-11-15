import type { ReactNode } from 'react'

export function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="my-4 rounded-xl border-2 border-sea-500/40 bg-sea-100/40 p-4 dark:bg-sea-500/10">
      <div className="text-sm font-semibold text-navy-900 dark:text-sky-100">🧮 {title}</div>
      <div className="mt-3">{children}</div>
    </div>
  )
}

export function Num({ label, value, onChange, step = 0.1, min = 0, max = 100 }: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number }) {
  return (
    <label className="text-xs">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
        className="mt-0.5 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-white/20 dark:bg-white/5"
      />
    </label>
  )
}
