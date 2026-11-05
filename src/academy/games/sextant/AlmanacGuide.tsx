import { useMemo, useState } from 'react'
import type { MessageKey } from '../../i18n/en'
import type { Translate } from '../../i18n'
import { dCorrection, dailyPage, sunIncrement } from './almanac'
import { CorrectionTables, DailyPageTable, IncrementsTable } from './NoonFix'
import { Card, Sum, Why, dm, latStr, signed } from './ui'

const SOURCES = [
  { k: 'printed', url: '' },
  { k: 'free', url: 'https://thenauticalalmanac.com/' },
  { k: 'freeIt', url: 'https://www.nauticalalmanac.it/en/navigation-astronomy/the-nautical-almanac' },
  { k: 'usno', url: 'https://aa.usno.navy.mil/data/celnav' },
  { k: 'tables', url: 'https://thenauticalalmanac.com/' },
  { k: 'learn', url: 'https://astronavigationdemystified.com/' },
] as const

const COLUMNS = ['ut', 'gha', 'dec', 'd', 'sd', 'mer'] as const
const tenth = (deg: number) => Math.round(deg * 600) / 600

export function AlmanacGuide({ t }: { t: Translate }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState('10:23:41')
  const day = useMemo(() => {
    const d = new Date(`${date}T00:00:00Z`)
    return Number.isNaN(d.getTime()) ? new Date(Date.UTC(2026, 0, 1)) : d
  }, [date])
  const page = useMemo(() => dailyPage(day), [day])
  const [hh, mm, ss] = (time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)?.slice(1) ?? ['10', '23', '41']).map((x) => Number(x ?? 0))
  const h = Math.min(23, hh)
  const row = page.rows[h]
  const ghaH = tenth(row.gha)
  const inc = tenth(sunIncrement(mm, ss))
  const dAbs = Math.round(Math.abs(page.d) * 10) / 10
  const dCorr = (Math.round(dCorrection(dAbs, mm) * 10) / 10) * (page.d >= 0 ? 1 : -1)
  const decH = tenth(row.dec)

  return (
    <div className="space-y-6">
      <Why title={t('cn.alm2.whatTitle')}>
        <p>{t('cn.alm2.what1')}</p>
        <p>{t('cn.alm2.what2')}</p>
        <p>{t('cn.alm2.what3')}</p>
      </Why>

      <section>
        <h2 className="text-lg font-semibold">{t('cn.alm2.whereTitle')}</h2>
        <ul className="mt-2 grid gap-3 md:grid-cols-2">
          {SOURCES.map((s) => (
            <li key={s.k} className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-navy-900/60">
              <p className="font-semibold">
                {s.url ? (
                  <a className="text-sea-500 hover:underline" href={s.url} target="_blank" rel="noreferrer">
                    {t(`cn.alm2.src.${s.k}` as MessageKey)} ↗
                  </a>
                ) : (
                  t(`cn.alm2.src.${s.k}` as MessageKey)
                )}
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{t(`cn.alm2.src.${s.k}.d` as MessageKey)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('cn.alm2.pageTitle')}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('cn.alm2.pageIntro')}</p>
        <label className="inline-flex items-center gap-2 text-sm">
          {t('cn.alm2.date')}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-white/20 dark:bg-navy-900" />
        </label>
        <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
          <DailyPageTable t={t} page={page} highlight={h} />
          <dl className="space-y-2 text-sm">
            {COLUMNS.map((c) => (
              <div key={c}>
                <dt className="font-semibold">{t(`cn.alm2.col.${c}` as MessageKey)}</dt>
                <dd className="text-slate-600 dark:text-slate-300">{t(`cn.alm2.col.${c}.d` as MessageKey)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('cn.alm2.lookupTitle')}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('cn.alm2.lookupIntro')}</p>
        <label className="inline-flex items-center gap-2 text-sm">
          {t('cn.alm2.time')}
          <input value={time} onChange={(e) => setTime(e.target.value)} className="w-28 rounded border border-slate-300 bg-white px-2 py-1 font-mono dark:border-white/20 dark:bg-navy-900" placeholder="hh:mm:ss" />
          UTC
        </label>
        <div className="grid gap-4 lg:grid-cols-3">
          <IncrementsTable t={t} minute={mm} second={ss} dAbs={dAbs} />
          <Card>
            <Sum
              rows={[
                { label: `GHA ${String(h).padStart(2, '0')}h`, value: dm(ghaH) },
                { label: `+ ${mm}m ${ss}s`, value: dm(inc) },
                { label: 'GHA', value: dm((ghaH + inc) % 360), total: true },
              ]}
            />
          </Card>
          <Card>
            <Sum
              rows={[
                { label: `Dec ${String(h).padStart(2, '0')}h`, value: latStr(decH) },
                { label: `d ${dAbs.toFixed(1)}`, value: signed(dCorr) },
                { label: 'Dec', value: latStr(decH + dCorr / 60), total: true },
              ]}
            />
          </Card>
        </div>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {(['1', '2', '3', '4'] as const).map((k) => (
            <li key={k}>{t(`cn.alm2.lookup${k}` as MessageKey)}</li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('cn.alm2.corrTitle')}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('cn.alm2.corrIntro')}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <CorrectionTables t={t} sd={page.sdMin} />
        </div>
      </section>

      <Card>
        <h2 className="font-semibold">{t('cn.alm2.otherTitle')}</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {(['stars', 'moon', 'planets'] as const).map((k) => (
            <li key={k}>• {t(`cn.alm2.other.${k}` as MessageKey)}</li>
          ))}
        </ul>
      </Card>
      <p className="text-xs text-slate-500 dark:text-slate-400">{t('cn.alm2.disclaimer')}</p>
    </div>
  )
}
