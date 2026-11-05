import type { MessageKey } from '../../i18n/en'
import type { Translate } from '../../i18n'
import { Card } from './ui'

const GROUPS = [
  { id: 'sextant', terms: ['hs', 'ie', 'ic', 'he', 'dip', 'ha', 'refr', 'sd', 'll', 'ho'] },
  { id: 'almanac', terms: ['utc', 'gp', 'gha', 'sha', 'lha', 'dec', 'd', 'mer', 'eot'] },
  { id: 'position', terms: ['lat', 'lon', 'zd', 'hc', 'zn', 'ap', 'int', 'lop', 'dr', 'ep', 'fix'] },
  { id: 'nav', terms: ['cog', 'sog', 'hdg', 'stw', 'nm', 'kn'] },
] as const

export function Glossary({ t }: { t: Translate }) {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-semibold">{t('cn.g.unitsTitle')}</h2>
        <ul className="mt-2 grid gap-1 text-sm md:grid-cols-2">
          {(['u1', 'u2', 'u3', 'u4', 'u5', 'u6'] as const).map((k) => (
            <li key={k}>• {t(`cn.g.${k}` as MessageKey)}</li>
          ))}
        </ul>
      </Card>
      {GROUPS.map((g) => (
        <section key={g.id}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t(`cn.g.group.${g.id}` as MessageKey)}</h2>
          <dl className="mt-2 grid gap-2 md:grid-cols-2">
            {g.terms.map((k) => (
              <div key={k} className="rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-navy-900/60">
                <dt className="font-semibold">{t(`cn.g.${k}` as MessageKey)}</dt>
                <dd className="mt-0.5 text-slate-600 dark:text-slate-300">{t(`cn.g.${k}.d` as MessageKey)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
