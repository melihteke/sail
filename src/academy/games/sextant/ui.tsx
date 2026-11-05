import type { ReactNode } from 'react'
import { formatDegMin } from './sextantModel'

export const fmtTime = (d: Date) => d.toISOString().slice(11, 19)
export const dm = (deg: number) => formatDegMin(deg, '', '')
export const latStr = (deg: number) => formatDegMin(deg, 'N', 'S')
export const lonStr = (deg: number) => formatDegMin(deg, 'E', 'W')
export const signed = (m: number) => `${m >= 0 ? '+' : '−'}${Math.abs(m).toFixed(1)}′`

export function Why({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-slate-700 dark:border-sky-400/20 dark:bg-sky-950/30 dark:text-slate-200">
      <p className="font-semibold text-navy-900 dark:text-sky-200">💡 {title}</p>
      <div className="mt-1 space-y-2">{children}</div>
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-navy-900/60 ${className}`}>{children}</div>
}

export function Done({ children }: { children: ReactNode }) {
  return <p className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">✓ {children}</p>
}

/** Calc table: label / value rows, optional bold total rows. */
export function Sum({ rows }: { rows: { label: ReactNode; value: ReactNode; total?: boolean; note?: ReactNode }[] }) {
  return (
    <table className="w-full font-mono text-sm">
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={r.total ? 'border-t border-slate-300 font-bold dark:border-white/20' : ''}>
            <td className="py-0.5 pr-3">{r.label}</td>
            <td className="py-0.5 text-right">{r.value}</td>
            <td className="hidden py-0.5 pl-3 font-sans text-xs text-slate-500 sm:table-cell dark:text-slate-400">{r.note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

