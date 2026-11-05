import { useMemo, useState } from 'react'
import type { MessageKey } from '../../i18n/en'
import type { Translate } from '../../i18n'
import { altAz, sunAt } from './almanac'
import { Card, Sum, Why, dm, latStr, lonStr } from './ui'

const METHODS = ['noon', 'intercept', 'runFix', 'polaris', 'stars', 'moonPlanets', 'lunar'] as const

/** "45 30.5" or "45.5" → 45.508… (sign comes from the hemisphere select). */
export function parseAngle(s: string): number | null {
  const parts = s.trim().replace(',', '.').split(/[\s°′']+/).filter(Boolean)
  if (!parts.length || parts.length > 2) return null
  const d = Number(parts[0])
  const m = parts[1] ? Number(parts[1]) : 0
  if (!Number.isFinite(d) || !Number.isFinite(m) || m < 0 || m >= 60) return null
  return Math.abs(d) + m / 60
}

const toText = (deg: number) => {
  const a = Math.abs(deg)
  const d = Math.floor(a)
  return `${d} ${((a - d) * 60).toFixed(1)}`
}

/** Example morning sun sight in the Bay of Biscay, used to prefill the calculator. */
function example() {
  const when = new Date(Date.UTC(2026, 5, 12, 8, 40, 0))
  const sun = sunAt(when)
  const truth = altAz(45.62, -6.8, sun.gha, sun.dec)
  return { apLat: 45.5, apLon: -6.9, gha: sun.gha, dec: sun.dec, ho: truth.alt }
}

function InterceptCalc({ t }: { t: Translate }) {
  const ex = useMemo(example, [])
  const [apLat, setApLat] = useState(toText(ex.apLat))
  const [latH, setLatH] = useState('N')
  const [apLon, setApLon] = useState(toText(ex.apLon))
  const [lonH, setLonH] = useState('W')
  const [gha, setGha] = useState(toText(ex.gha))
  const [dec, setDec] = useState(toText(ex.dec))
  const [decH, setDecH] = useState(ex.dec >= 0 ? 'N' : 'S')
  const [ho, setHo] = useState(toText(ex.ho))

  const v = {
    lat: parseAngle(apLat),
    lon: parseAngle(apLon),
    gha: parseAngle(gha),
    dec: parseAngle(dec),
    ho: parseAngle(ho),
  }
  const ok = Object.values(v).every((x) => x !== null)
  const lat = (v.lat ?? 0) * (latH === 'S' ? -1 : 1)
  const lon = (v.lon ?? 0) * (lonH === 'W' ? -1 : 1)
  const d = (v.dec ?? 0) * (decH === 'S' ? -1 : 1)
  const r = altAz(lat, lon, v.gha ?? 0, d)
  const intercept = ((v.ho ?? 0) - r.alt) * 60
  const field = 'w-28 rounded border border-slate-300 bg-white px-2 py-1 font-mono text-sm dark:border-white/20 dark:bg-navy-900'
  const hemi = (val: string, set: (s: string) => void, opts: [string, string]) => (
    <select className="rounded border border-slate-300 bg-white px-1 py-1 text-sm dark:border-white/20 dark:bg-navy-900" value={val} onChange={(e) => set(e.target.value)}>
      {opts.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  )

  return (
    <Card>
      <h3 className="font-semibold">{t('cn.ic.title')}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('cn.ic.intro')}</p>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 text-sm">
          <span>{t('cn.ic.apLat')}</span>
          <span className="flex gap-1">
            <input className={field} value={apLat} onChange={(e) => setApLat(e.target.value)} />
            {hemi(latH, setLatH, ['N', 'S'])}
          </span>
          <span>{t('cn.ic.apLon')}</span>
          <span className="flex gap-1">
            <input className={field} value={apLon} onChange={(e) => setApLon(e.target.value)} />
            {hemi(lonH, setLonH, ['E', 'W'])}
          </span>
          <span>GHA</span>
          <input className={field} value={gha} onChange={(e) => setGha(e.target.value)} />
          <span>Dec</span>
          <span className="flex gap-1">
            <input className={field} value={dec} onChange={(e) => setDec(e.target.value)} />
            {hemi(decH, setDecH, ['N', 'S'])}
          </span>
          <span>Ho</span>
          <input className={field} value={ho} onChange={(e) => setHo(e.target.value)} />
          <span className="col-span-2 text-xs text-slate-500 dark:text-slate-400">{t('cn.ic.format')}</span>
        </div>
        {ok ? (
          <div className="space-y-3">
            <Sum
              rows={[
                { label: 'LHA = GHA + Lon', value: dm(r.lha), note: t('cn.ic.lha') },
                { label: 'Hc', value: dm(r.alt), note: t('cn.ic.hc') },
                { label: 'Zn', value: `${r.zn.toFixed(0).padStart(3, '0')}°`, note: t('cn.ic.zn') },
                { label: 'Ho − Hc', value: `${Math.abs(intercept).toFixed(1)} nm ${intercept >= 0 ? t('cn.ic.toward') : t('cn.ic.away')}`, total: true },
              ]}
            />
            <InterceptDrawing zn={r.zn} intercept={intercept} t={t} />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AP {latStr(lat)} {lonStr(lon)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-rose-600">{t('cn.ic.invalid')}</p>
        )}
      </div>
      <p className="mt-3 rounded-lg bg-slate-100 p-2 font-mono text-xs dark:bg-white/5">{t('cn.ic.formula')}</p>
    </Card>
  )
}

function InterceptDrawing({ zn, intercept, t }: { zn: number; intercept: number; t: Translate }) {
  const C = 110
  const a = (zn * Math.PI) / 180
  const dir = { x: Math.sin(a), y: -Math.cos(a) }
  const len = Math.max(18, Math.min(80, Math.abs(intercept) * 6)) * Math.sign(intercept || 1)
  const p = { x: C + dir.x * len, y: C + dir.y * len }
  const perp = { x: -dir.y, y: dir.x }
  return (
    <svg viewBox="0 0 220 220" className="mx-auto w-56 rounded-xl bg-sky-50 dark:bg-navy-950" role="img" aria-label={t('cn.ic.drawing')}>
      <text x="110" y="14" fontSize="10" textAnchor="middle" fill="currentColor">N</text>
      <line x1={C - dir.x * 100} y1={C - dir.y * 100} x2={C + dir.x * 100} y2={C + dir.y * 100} stroke="#f59e0b" strokeDasharray="4 3" />
      <text x={C + dir.x * 92} y={C + dir.y * 92} fontSize="10" fill="#b45309">☀ Zn</text>
      <line x1={C} y1={C} x2={p.x} y2={p.y} stroke="#1d4ed8" strokeWidth="2.5" />
      <line x1={p.x - perp.x * 90} y1={p.y - perp.y * 90} x2={p.x + perp.x * 90} y2={p.y + perp.y * 90} stroke="#16a34a" strokeWidth="2.5" />
      <text x={p.x + perp.x * 60 + 4} y={p.y + perp.y * 60} fontSize="10" fill="#16a34a">LOP</text>
      <circle cx={C} cy={C} r="5" fill="#0b3a5c" />
      <text x={C + 6} y={C + 14} fontSize="10" fill="currentColor">AP</text>
    </svg>
  )
}

export function OtherMethods({ t, goTo }: { t: Translate; goTo: (tab: string) => void }) {
  return (
    <div className="space-y-6">
      <Why title={t('cn.m.introTitle')}>
        <p>{t('cn.m.intro')}</p>
      </Why>
      <div className="grid gap-4 md:grid-cols-2">
        {METHODS.map((m) => (
          <Card key={m}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{t(`cn.m.${m}.title` as MessageKey)}</h3>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">{t(`cn.m.${m}.level` as MessageKey)}</span>
            </div>
            <p className="mt-1 text-xs font-medium text-sea-500">{t(`cn.m.${m}.when` as MessageKey)}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t(`cn.m.${m}.how` as MessageKey)}</p>
            {m === 'noon' && (
              <button type="button" className="btn-secondary mt-3" onClick={() => goTo('fix')}>
                🧭 {t('cn.start.goFix')}
              </button>
            )}
          </Card>
        ))}
      </div>
      <InterceptCalc t={t} />
    </div>
  )
}
