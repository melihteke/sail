import { useMemo, useState } from 'react'
import type { MessageKey } from '../../i18n/en'
import { useI18n, type Translate } from '../../i18n'
import { dCorrection, dailyPage, fitMaximum, sunAltAt, sunIncrement } from './almanac'
import { scenarioDay, scenarios, type CelestialScenario } from './celestialScenarios'
import FixMap from './FixMap'
import { dipMin, refractionMin, sextantFor, toDegMin } from './sextantModel'
import { Card, Done, Sum, Why, dm, fmtTime, latStr, lonStr, signed } from './ui'
import { ArmControls, Telescope, useRock } from './telescope'

const STEPS = ['story', 'ie', 'when', 'measure', 'correct', 'almanac', 'lat', 'lon', 'plot'] as const
type Step = (typeof STEPS)[number]

const MIN = 60000
const round1 = (x: number) => Math.round(x * 10) / 10
const roundTenthDeg = (deg: number) => Math.round(deg * 600) / 600
/** Hs → Ho with every correction rounded to 0.1′, as you would do on paper. */
export function reduceOnPaper(hs: number, ieMin: number, eye: number, sdMin: number) {
  const ic = round1(-ieMin)
  const dip = round1(dipMin(eye))
  const ha = hs + (ic - dip) / 60
  const refr = round1(refractionMin(ha))
  const sd = round1(sdMin)
  const main = round1(sd - refr)
  const ho = ha + main / 60
  return { ic, dip, ha, refr, sd, main, ho }
}

export function NoonFix() {
  const { t } = useI18n()
  const [scId, setScId] = useState<CelestialScenario['id']>('biscay')
  const sc = scenarios.find((s) => s.id === scId)!
  const [step, setStep] = useState<Step>('story')
  const [ieRead, setIeRead] = useState(0)
  const [records, setRecords] = useState<{ t: number; hs: number }[]>([])
  const [revealed, setRevealed] = useState(0)

  const page = useMemo(() => dailyPage(scenarioDay(sc)), [sc])
  const merPassMin = Math.round(page.merPass.getTime() / MIN) * MIN
  const lonTimeMin = round1(Math.abs(sc.drLon) * 4)
  const predicted = merPassMin + (sc.drLon < 0 ? 1 : -1) * lonTimeMin * MIN
  const trueHs = (time: number) => sextantFor(sunAltAt(new Date(time), sc.lat, sc.lon).alt, sc.ieMin, sc.eye, page.sdMin)

  const fit = useMemo(() => fitMaximum(records.map((r) => ({ t: (r.t - predicted) / MIN, h: r.hs }))), [records, predicted])
  const enough = !!fit && records.length >= 5 && records.some((r) => (r.t - predicted) / MIN < fit.t - 3) && records.some((r) => (r.t - predicted) / MIN > fit.t + 3)
  const noon = enough ? Math.round((predicted + fit!.t * MIN) / 1000) * 1000 : predicted
  const hsNoon = enough ? roundTenthDeg(fit!.h) : 0
  const red = reduceOnPaper(hsNoon, sc.ieMin, sc.eye, page.sdMin)

  const nd = new Date(noon)
  const hh = nd.getUTCHours()
  const mm = nd.getUTCMinutes()
  const ss = nd.getUTCSeconds()
  const row = page.rows[hh]
  const ghaHour = roundTenthDeg(row.gha)
  const incr = roundTenthDeg(sunIncrement(mm, ss))
  const gha = ghaHour + incr
  const decHour = roundTenthDeg(row.dec)
  const dAbs = round1(Math.abs(page.d))
  const decGrowing = page.d >= 0
  const dCorr = round1(dCorrection(dAbs, mm)) * (decGrowing ? 1 : -1)
  const dec = decHour + dCorr / 60
  const zd = 90 - red.ho
  const lat = zd + dec
  const lon = gha <= 180 ? -gha : 360 - gha

  const reset = (id: CelestialScenario['id']) => {
    setScId(id)
    setStep('story')
    setIeRead(0)
    setRecords([])
    setRevealed(0)
  }

  const idx = STEPS.indexOf(step)
  const ieOk = Math.abs(ieRead - sc.ieMin) < 0.15
  const canNext: Record<Step, boolean> = { story: true, ie: ieOk, when: true, measure: enough, correct: revealed >= 6, almanac: true, lat: true, lon: true, plot: false }

  return (
    <div className="space-y-5">
      <ol className="flex flex-wrap gap-1.5" aria-label={t('cn.fix.progress')}>
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              disabled={i > idx && !STEPS.slice(0, i).every((p) => canNext[p])}
              onClick={() => setStep(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${s === step ? 'bg-navy-900 text-white dark:bg-sea-500' : i < idx ? 'bg-sea-100 text-navy-900 dark:bg-white/10 dark:text-slate-100' : 'bg-slate-100 text-slate-500 disabled:opacity-50 dark:bg-white/5'}`}
            >
              {i + 1}. {t(`cn.fix.step.${s}` as MessageKey)}
            </button>
          </li>
        ))}
      </ol>

      <h2 className="text-xl font-semibold text-navy-900 dark:text-white">
        {idx + 1}. {t(`cn.fix.step.${step}` as MessageKey)}
      </h2>

      {step === 'story' && <Story t={t} sc={sc} onScenario={reset} />}
      {step === 'ie' && <IndexError t={t} sc={sc} ieRead={ieRead} setIeRead={setIeRead} ok={ieOk} />}
      {step === 'when' && <When t={t} sc={sc} merPass={merPassMin} lonTimeMin={lonTimeMin} predicted={predicted} eot={page.eotMin} />}
      {step === 'measure' && (
        <Measure
          t={t}
          sc={sc}
          predicted={predicted}
          trueHs={trueHs}
          records={records}
          setRecords={setRecords}
          fit={fit}
          enough={enough}
          noon={noon}
          hsNoon={hsNoon}
        />
      )}
      {step === 'correct' && <Correct t={t} sc={sc} hs={hsNoon} red={red} revealed={revealed} setRevealed={setRevealed} />}
      {step === 'almanac' && (
        <AlmanacLookup t={t} page={page} noon={nd} ghaHour={ghaHour} incr={incr} gha={gha} decHour={decHour} dAbs={dAbs} decGrowing={decGrowing} dCorr={dCorr} dec={dec} />
      )}
      {step === 'lat' && <Latitude t={t} ho={red.ho} dec={dec} zd={zd} lat={lat} />}
      {step === 'lon' && <Longitude t={t} gha={gha} lon={lon} noon={nd} merPass={new Date(merPassMin)} />}
      {step === 'plot' && <FixMap t={t} fix={{ lat, lon }} dr={{ lat: sc.drLat, lon: sc.drLon }} truth={{ lat: sc.lat, lon: sc.lon }} />}

      <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/10">
        <button type="button" className="btn-secondary" disabled={idx === 0} onClick={() => setStep(STEPS[idx - 1])}>
          ← {t('common.back')}
        </button>
        {step === 'plot' ? (
          <button type="button" className="btn-secondary" onClick={() => reset(scenarios[(scenarios.indexOf(sc) + 1) % scenarios.length].id)}>
            ↻ {t('cn.fix.another')}
          </button>
        ) : (
          <button type="button" className="btn-primary" disabled={!canNext[step]} onClick={() => setStep(STEPS[idx + 1])}>
            {t('nm.next')} →
          </button>
        )}
      </div>
    </div>
  )
}

/* ---------- 1. Story ---------- */

function Story({ t, sc, onScenario }: { t: Translate; sc: CelestialScenario; onScenario: (id: CelestialScenario['id']) => void }) {
  const day = scenarioDay(sc)
  return (
    <div className="space-y-4">
      <label className="block text-sm">
        <span className="font-medium">{t('cn.fix.voyage')}</span>
        <select value={sc.id} onChange={(e) => onScenario(e.target.value as CelestialScenario['id'])} className="mt-1 block w-full rounded border border-slate-300 bg-white px-2 py-1.5 dark:border-white/20 dark:bg-navy-900">
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {t(`cn.sc.${s.id}` as MessageKey)}
            </option>
          ))}
        </select>
      </label>
      <Card>
        <p className="text-sm">{t('cn.fix.story', { area: t(`cn.sc.${sc.id}` as MessageKey), date: day.toISOString().slice(0, 10) })}</p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-slate-500">{t('cn.fix.dr')}</dt>
          <dd className="font-mono">
            {latStr(sc.drLat)} {lonStr(sc.drLon)}
          </dd>
          <dt className="text-slate-500">{t('sx.eye')}</dt>
          <dd className="font-mono">{sc.eye} m</dd>
        </dl>
      </Card>
      <Why title={t('cn.fix.planTitle')}>
        <ol className="list-decimal space-y-1 pl-5">
          {(['ie', 'when', 'measure', 'correct', 'almanac', 'lat', 'lon', 'plot'] as const).map((s) => (
            <li key={s}>
              <strong>{t(`cn.fix.step.${s}` as MessageKey)}</strong>: {t(`cn.fix.plan.${s}` as MessageKey)}
            </li>
          ))}
        </ol>
      </Why>
      <p className="text-xs text-slate-500 dark:text-slate-400">{t('cn.fix.hoveTo')}</p>
    </div>
  )
}

/* ---------- 2. Index error ---------- */

function IndexError({ t, sc, ieRead, setIeRead, ok }: { t: Translate; sc: CelestialScenario; ieRead: number; setIeRead: (v: number) => void; ok: boolean }) {
  return (
    <div className="space-y-4">
      <Why title={t('cn.why')}>
        <p>{t('cn.ie.why')}</p>
      </Why>
      <div className="grid gap-6 md:grid-cols-[18rem_1fr]">
        <Telescope mode="horizon" errMin={sc.ieMin - ieRead} rock={0} t={t} />
        <div className="space-y-3 text-sm">
          <ol className="list-decimal space-y-1 pl-5">
            <li>{t('cn.ie.do1')}</li>
            <li>{t('cn.ie.do2')}</li>
            <li>{t('cn.ie.do3')}</li>
          </ol>
          <label className="block">
            <span className="flex justify-between">
              <span>{t('sx.drum')}</span>
              <span className="font-mono">{signed(ieRead)}</span>
            </span>
            <input type="range" min={-5} max={5} step={0.1} value={ieRead} onChange={(e) => setIeRead(Number(e.target.value))} className="w-full accent-sea-500" />
          </label>
          {ok ? (
            <Done>{t(sc.ieMin >= 0 ? 'cn.ie.onArc' : 'cn.ie.offArc', { ie: Math.abs(sc.ieMin).toFixed(1), ic: signed(-sc.ieMin) })}</Done>
          ) : (
            <p className="text-slate-500">{t('cn.ie.notYet')}</p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('cn.ie.rule')}</p>
        </div>
      </div>
    </div>
  )
}

/* ---------- 3. When is noon? ---------- */

function When({ t, sc, merPass, lonTimeMin, predicted, eot }: { t: Translate; sc: CelestialScenario; merPass: number; lonTimeMin: number; predicted: number; eot: number }) {
  const hhmm = (ms: number) => new Date(ms).toISOString().slice(11, 16)
  return (
    <div className="space-y-4">
      <Why title={t('cn.why')}>
        <p>{t('cn.when.why1')}</p>
        <p>{t('cn.when.why2')}</p>
      </Why>
      <Card>
        <Sum
          rows={[
            { label: t('cn.when.merPass'), value: `${hhmm(merPass)} UTC`, note: t('cn.when.merPassNote', { eot: `${eot <= 0 ? '+' : '−'}${Math.abs(eot).toFixed(1)}` }) },
            { label: `${t('cn.fix.drLon')} ${lonStr(sc.drLon)}`, value: `${sc.drLon < 0 ? '+' : '−'} ${lonTimeMin.toFixed(1)} min`, note: t(sc.drLon < 0 ? 'cn.when.west' : 'cn.when.east') },
            { label: t('cn.when.lan'), value: `≈ ${hhmm(predicted)} UTC`, total: true },
          ]}
        />
      </Card>
      <p className="text-sm">{t('cn.when.start', { from: hhmm(predicted - 20 * MIN) })}</p>
    </div>
  )
}

/* ---------- 4. Measure ---------- */

function Measure({
  t,
  sc,
  predicted,
  trueHs,
  records,
  setRecords,
  fit,
  enough,
  noon,
  hsNoon,
}: {
  t: Translate
  sc: CelestialScenario
  predicted: number
  trueHs: (time: number) => number
  records: { t: number; hs: number }[]
  setRecords: (r: { t: number; hs: number }[]) => void
  fit: { t: number; h: number } | null
  enough: boolean
  noon: number
  hsNoon: number
}) {
  const [offset, setOffset] = useState(-20)
  const time = predicted + offset * MIN
  const target = trueHs(time)
  const start = toDegMin(trueHs(predicted))
  const [deg, setDeg] = useState(start.d)
  const [min, setMin] = useState(0)
  const [rocking, setRocking] = useState(false)
  const rock = useRock(rocking)
  const reading = deg + min / 60
  const err = (target - reading) * 60
  const touching = Math.abs(err) <= 0.6
  const record = () => setRecords([...records.filter((r) => r.t !== time), { t: time, hs: roundTenthDeg(reading) }].sort((a, b) => a.t - b.t))
  // A real observer is never perfect: add a few tenths of a minute of reading noise.
  const NOISE = [0.2, 0.4, 0.5, 0.3, -0.1, -0.3, -0.4, -0.2]
  const autoFill = () =>
    setRecords([-24, -16, -9, -3, 3, 9, 16, 24].map((o, i) => ({ t: predicted + o * MIN, hs: roundTenthDeg(trueHs(predicted + o * MIN) + NOISE[i] / 60) })))
  void sc

  return (
    <div className="space-y-4">
      <Why title={t('cn.why')}>
        <p>{t('cn.measure.why1')}</p>
        <p>{t('cn.measure.why2')}</p>
      </Why>
      <div className="grid gap-6 md:grid-cols-[18rem_1fr]">
        <div className="space-y-3">
          <Telescope errMin={err} rock={rock} t={t} />
          <p className="text-center font-mono text-2xl">🕛 {fmtTime(new Date(time))} UTC</p>
        </div>
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="flex justify-between">
              <span>{t('cn.measure.clock')}</span>
              <span className="font-mono">
                {offset >= 0 ? '+' : ''}
                {offset} min
              </span>
            </span>
            <input type="range" min={-30} max={30} step={1} value={offset} onChange={(e) => setOffset(Number(e.target.value))} className="w-full accent-amber-500" />
          </label>
          <ArmControls deg={deg} min={min} setDeg={setDeg} setMin={setMin} t={t} />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onMouseDown={() => setRocking(true)} onMouseUp={() => setRocking(false)} onMouseLeave={() => setRocking(false)} onTouchStart={() => setRocking(true)} onTouchEnd={() => setRocking(false)}>
              ↔ {t('sx.rock')}
            </button>
            <button type="button" className="btn-primary" disabled={!touching} onClick={record}>
              ✍️ {t('cn.measure.record')}
            </button>
            <button type="button" className="btn-secondary" onClick={autoFill}>
              ⚡ {t('cn.measure.auto')}
            </button>
            {records.length > 0 && (
              <button type="button" className="btn-secondary" onClick={() => setRecords([])}>
                {t('rp.clear')}
              </button>
            )}
          </div>
          {!touching && <p className="text-slate-500">{t('cn.measure.notTouching')}</p>}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
        <Card>
          <NoonChart records={records} predicted={predicted} fit={fit} />
        </Card>
        <Card>
          <p className="text-sm font-medium">{t('cn.measure.notebook')}</p>
          {records.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">{t('cn.measure.empty')}</p>
          ) : (
            <table className="mt-2 w-full font-mono text-xs">
              <tbody>
                {records.map((r) => (
                  <tr key={r.t}>
                    <td>{fmtTime(new Date(r.t))}</td>
                    <td className="text-right">{dm(r.hs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
      {enough ? (
        <Done>{t('cn.measure.result', { hs: dm(hsNoon), time: fmtTime(new Date(noon)) })}</Done>
      ) : (
        <p className="text-sm text-slate-500">{t('cn.measure.needMore')}</p>
      )}
    </div>
  )
}

function NoonChart({ records, predicted, fit }: { records: { t: number; hs: number }[]; predicted: number; fit: { t: number; h: number } | null }) {
  const W = 520
  const H = 200
  const P = 34
  const xs = (o: number) => P + ((o + 30) / 60) * (W - 2 * P)
  const hs = records.map((r) => r.hs)
  const top = hs.length ? Math.max(...hs) + 2 / 60 : 1
  const bottom = hs.length ? Math.min(...hs) - 2 / 60 : 0
  const ys = (h: number) => H - P + ((bottom - h) / Math.max(1e-6, top - bottom)) * (H - 2 * P)
  const pts = records.map((r) => ({ o: (r.t - predicted) / MIN, h: r.hs }))
  let curve = ''
  if (fit && pts.length >= 3) {
    // Redraw the parabola through the fitted vertex using the data's curvature.
    const a = pts.reduce((s, p) => s + (p.h - fit.h) / Math.max(1, (p.o - fit.t) ** 2), 0) / pts.length
    curve = Array.from({ length: 61 }, (_, i) => {
      const o = -30 + i
      return `${i ? 'L' : 'M'}${xs(o).toFixed(1)} ${ys(fit.h + a * (o - fit.t) ** 2).toFixed(1)}`
    }).join(' ')
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Hs / time">
      <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="currentColor" opacity="0.3" />
      <line x1={P} y1={P / 2} x2={P} y2={H - P} stroke="currentColor" opacity="0.3" />
      {[-30, -20, -10, 0, 10, 20, 30].map((o) => (
        <text key={o} x={xs(o)} y={H - P + 14} fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.6">
          {o > 0 ? `+${o}` : o}m
        </text>
      ))}
      <text x={P - 4} y={P / 2 + 4} fontSize="10" textAnchor="end" fill="currentColor" opacity="0.6">
        Hs
      </text>
      {curve && <path d={curve} fill="none" stroke="#1e9bd7" strokeWidth="1.5" strokeDasharray="4 3" />}
      {pts.map((p) => (
        <circle key={p.o} cx={xs(p.o)} cy={ys(p.h)} r="4" fill="#f59e0b" stroke="#fff" />
      ))}
      {fit && (
        <g>
          <line x1={xs(fit.t)} y1={P / 2} x2={xs(fit.t)} y2={H - P} stroke="#16a34a" strokeDasharray="3 3" />
          <text x={xs(fit.t) + 4} y={P / 2 + 8} fontSize="10" fill="#16a34a">
            max
          </text>
        </g>
      )}
    </svg>
  )
}

/* ---------- 5. Corrections ---------- */

function Correct({ t, sc, hs, red, revealed, setRevealed }: { t: Translate; sc: CelestialScenario; hs: number; red: ReturnType<typeof reduceOnPaper>; revealed: number; setRevealed: (n: number) => void }) {
  const rows = [
    { label: 'Hs', value: dm(hs), note: t('cn.corr.hs') },
    { label: `IC (${t('sx.ic')})`, value: signed(red.ic), note: t('cn.corr.ic') },
    { label: `${t('sx.dip')} (${sc.eye} m)`, value: signed(-red.dip), note: t('cn.corr.dip') },
    { label: 'Ha', value: dm(red.ha), total: true, note: t('cn.corr.ha') },
    { label: t('cn.corr.mainLabel'), value: signed(red.main), note: t('cn.corr.main', { sd: red.sd.toFixed(1), refr: red.refr.toFixed(1) }) },
    { label: 'Ho', value: dm(red.ho), total: true, note: t('cn.corr.ho') },
  ]
  return (
    <div className="space-y-4">
      <Why title={t('cn.why')}>
        <p>{t('cn.corr.why')}</p>
      </Why>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <Sum rows={rows.slice(0, revealed)} />
          {revealed < rows.length ? (
            <button type="button" className="btn-primary mt-3" onClick={() => setRevealed(revealed + 1)}>
              {revealed === 0 ? t('cn.corr.start') : t('cn.corr.next')} →
            </button>
          ) : (
            <Done>{t('cn.corr.done', { ho: dm(red.ho) })}</Done>
          )}
          {revealed > 0 && revealed <= rows.length && <p className="mt-3 text-sm text-slate-600 sm:hidden dark:text-slate-300">{rows[revealed - 1].note}</p>}
        </Card>
        <div className="space-y-3">
          <CorrectionTables t={t} eye={sc.eye} ha={red.ha} sd={red.sd} />
        </div>
      </div>
    </div>
  )
}

export function CorrectionTables({ t, eye, ha, sd }: { t: Translate; eye?: number; ha?: number; sd: number }) {
  const heights = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
  const alts = [10, 15, 20, 30, 40, 50, 60, 70, 80]
  const near = (list: number[], v?: number) => (v === undefined ? -1 : list.reduce((bi, x, i) => (Math.abs(x - v) < Math.abs(list[bi] - v) ? i : bi), 0))
  const hi = near(heights, eye)
  const ai = near(alts, ha)
  return (
    <>
      <Card>
        <p className="text-sm font-medium">{t('cn.tables.dip')}</p>
        <table className="mt-2 w-full text-center font-mono text-xs">
          <thead>
            <tr className="text-slate-500">
              <th className="text-left font-normal">{t('sx.eye')}</th>
              <th className="font-normal">{t('sx.dip')}</th>
            </tr>
          </thead>
          <tbody>
            {heights.map((h, i) => (
              <tr key={h} className={i === hi ? 'bg-amber-100 font-bold dark:bg-amber-400/20' : ''}>
                <td className="text-left">{h} m</td>
                <td>−{dipMin(h).toFixed(1)}′</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card>
        <p className="text-sm font-medium">{t('cn.tables.sun', { sd: sd.toFixed(1) })}</p>
        <table className="mt-2 w-full text-center font-mono text-xs">
          <thead>
            <tr className="text-slate-500">
              <th className="text-left font-normal">Ha</th>
              <th className="font-normal">{t('sx.refr')}</th>
              <th className="font-normal">{t('cn.tables.lowerLimb')}</th>
            </tr>
          </thead>
          <tbody>
            {alts.map((a, i) => (
              <tr key={a} className={i === ai ? 'bg-amber-100 font-bold dark:bg-amber-400/20' : ''}>
                <td className="text-left">{a}°</td>
                <td>−{refractionMin(a).toFixed(1)}′</td>
                <td>{signed(sd - refractionMin(a))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('cn.tables.note')}</p>
      </Card>
    </>
  )
}

/* ---------- 6. Almanac ---------- */

function AlmanacLookup(p: {
  t: Translate
  page: ReturnType<typeof dailyPage>
  noon: Date
  ghaHour: number
  incr: number
  gha: number
  decHour: number
  dAbs: number
  decGrowing: boolean
  dCorr: number
  dec: number
}) {
  const { t, page, noon } = p
  const [shown, setShown] = useState(false)
  const hh = noon.getUTCHours()
  const mm = noon.getUTCMinutes()
  const ss = noon.getUTCSeconds()
  return (
    <div className="space-y-4">
      <Why title={t('cn.why')}>
        <p>{t('cn.alm.why1')}</p>
        <p>{t('cn.alm.why2', { time: fmtTime(noon) })}</p>
      </Why>
      <div className="grid gap-4 lg:grid-cols-2">
        <DailyPageTable t={t} page={page} highlight={hh} from={Math.max(0, hh - 3)} to={Math.min(23, hh + 3)} />
        <IncrementsTable t={t} minute={mm} second={ss} dAbs={p.dAbs} />
      </div>
      {!shown ? (
        <button type="button" className="btn-primary" onClick={() => setShown(true)}>
          {t('cn.alm.show')}
        </button>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <Sum
              rows={[
                { label: `GHA ${String(hh).padStart(2, '0')}h`, value: dm(p.ghaHour), note: t('cn.alm.ghaHour') },
                { label: `+ ${t('cn.alm.incr')} ${mm}m ${ss}s`, value: dm(p.incr), note: t('cn.alm.incrNote') },
                { label: 'GHA', value: dm(p.gha), total: true },
              ]}
            />
          </Card>
          <Card>
            <Sum
              rows={[
                { label: `Dec ${String(hh).padStart(2, '0')}h`, value: latStr(p.decHour), note: t('cn.alm.decHour') },
                { label: `d ${p.dAbs.toFixed(1)} → ${mm}m`, value: signed(p.dCorr), note: t(p.decGrowing ? 'cn.alm.dPlus' : 'cn.alm.dMinus') },
                { label: 'Dec', value: latStr(p.dec), total: true },
              ]}
            />
          </Card>
        </div>
      )}
    </div>
  )
}

export function DailyPageTable({ t, page, highlight, from = 0, to = 23 }: { t: Translate; page: ReturnType<typeof dailyPage>; highlight?: number; from?: number; to?: number }) {
  return (
    <Card className="overflow-x-auto">
      <p className="text-sm font-medium">{t('cn.alm.dailyTitle')}</p>
      <table className="mt-2 w-full text-center font-mono text-xs">
        <thead>
          <tr className="text-slate-500">
            <th className="text-left font-normal">UT</th>
            <th className="font-normal">GHA</th>
            <th className="font-normal">Dec</th>
          </tr>
        </thead>
        <tbody>
          {page.rows.slice(from, to + 1).map((r) => (
            <tr key={r.hour} className={r.hour === highlight ? 'bg-amber-100 font-bold dark:bg-amber-400/20' : ''}>
              <td className="text-left">{String(r.hour).padStart(2, '0')}</td>
              <td>{dm(roundTenthDeg(r.gha))}</td>
              <td>{latStr(roundTenthDeg(r.dec))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 font-mono text-xs text-slate-600 dark:text-slate-300">
        SD {page.sdMin.toFixed(1)}′ · d {Math.abs(page.d).toFixed(1)}′ · Mer. Pass. {page.merPass.toISOString().slice(11, 16)}
      </p>
    </Card>
  )
}

export function IncrementsTable({ t, minute, second, dAbs }: { t: Translate; minute: number; second: number; dAbs: number }) {
  const secs = Array.from({ length: 7 }, (_, i) => second - 3 + i).filter((s) => s >= 0 && s < 60)
  return (
    <Card className="overflow-x-auto">
      <p className="text-sm font-medium">{t('cn.alm.incrTitle', { m: minute })}</p>
      <table className="mt-2 w-full text-center font-mono text-xs">
        <thead>
          <tr className="text-slate-500">
            <th className="text-left font-normal">{minute}m s</th>
            <th className="font-normal">{t('cn.alm.sunPlanets')}</th>
          </tr>
        </thead>
        <tbody>
          {secs.map((s) => (
            <tr key={s} className={s === second ? 'bg-amber-100 font-bold dark:bg-amber-400/20' : ''}>
              <td className="text-left">{String(s).padStart(2, '0')}</td>
              <td>{dm(sunIncrement(minute, s))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs font-medium">{t('cn.alm.vdTitle')}</p>
      <p className="font-mono text-xs">
        d {dAbs.toFixed(1)}′ → {dCorrection(dAbs, minute).toFixed(1)}′
      </p>
    </Card>
  )
}

/* ---------- 7. Latitude ---------- */

function Latitude({ t, ho, dec, zd, lat }: { t: Translate; ho: number; dec: number; zd: number; lat: number }) {
  return (
    <div className="space-y-4">
      <Why title={t('cn.why')}>
        <p>{t('cn.lat.why1')}</p>
        <p>{t('cn.lat.why2')}</p>
      </Why>
      <div className="grid items-start gap-4 md:grid-cols-2">
        <MeridianDiagram t={t} ho={ho} lat={lat} />
        <Card>
          <Sum
            rows={[
              { label: '90°', value: '90° 00.0′' },
              { label: '− Ho', value: dm(ho) },
              { label: 'ZD', value: dm(zd), total: true, note: t('cn.lat.zd') },
              { label: '+ Dec', value: latStr(dec), note: t('cn.lat.dec') },
              { label: t('cn.lat.lat'), value: latStr(lat), total: true },
            ]}
          />
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{t('cn.lat.rule')}</p>
        </Card>
      </div>
    </div>
  )
}

function MeridianDiagram({ t, ho, lat }: { t: Translate; ho: number; lat: number }) {
  const cx = 160
  const cy = 170
  const r = 130
  const pt = (altDeg: number, south = true) => {
    const a = (altDeg * Math.PI) / 180
    return { x: cx + (south ? 1 : -1) * Math.cos(a) * r, y: cy - Math.sin(a) * r }
  }
  const sun = pt(ho)
  const eq = pt(90 - lat)
  const pole = pt(lat, false)
  return (
    <svg viewBox="0 0 320 200" className="w-full rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-navy-900/60" role="img" aria-label={t('cn.lat.diagram')}>
      <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="#e0f2fe" stroke="#94a3b8" />
      <line x1={cx - r - 10} y1={cy} x2={cx + r + 10} y2={cy} stroke="#0b3a5c" strokeWidth="2" />
      <text x={cx - r} y={cy + 16} fontSize="11" fill="currentColor">N</text>
      <text x={cx + r - 8} y={cy + 16} fontSize="11" fill="currentColor">S</text>
      <line x1={cx} y1={cy} x2={cx} y2={cy - r} stroke="#64748b" strokeDasharray="3 3" />
      <text x={cx + 4} y={cy - r + 12} fontSize="10" fill="currentColor">{t('cn.lat.zenith')}</text>
      <line x1={cx} y1={cy} x2={eq.x} y2={eq.y} stroke="#7c3aed" strokeDasharray="4 3" />
      <text x={eq.x + 4} y={eq.y} fontSize="10" fill="#7c3aed">{t('cn.lat.equator')}</text>
      <line x1={cx} y1={cy} x2={pole.x} y2={pole.y} stroke="#64748b" strokeDasharray="2 3" />
      <text x={pole.x - 4} y={pole.y - 4} fontSize="10" textAnchor="end" fill="currentColor">{t('cn.lat.pole')}</text>
      <line x1={cx} y1={cy} x2={sun.x} y2={sun.y} stroke="#f59e0b" strokeWidth="2" />
      <circle cx={sun.x} cy={sun.y} r="9" fill="#fb923c" />
      <text x={cx + 30} y={cy - 6} fontSize="11" fill="#b45309">Ho {ho.toFixed(1)}°</text>
      <circle cx={cx} cy={cy} r="4" fill="#0b3a5c" />
    </svg>
  )
}

/* ---------- 8. Longitude ---------- */

function Longitude({ t, gha, lon, noon, merPass }: { t: Translate; gha: number; lon: number; noon: Date; merPass: Date }) {
  const diffMin = (noon.getTime() - merPass.getTime()) / MIN
  return (
    <div className="space-y-4">
      <Why title={t('cn.why')}>
        <p>{t('cn.lon.why1')}</p>
        <p>{t('cn.lon.why2')}</p>
      </Why>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <Sum
            rows={[
              { label: t('cn.lon.ghaAtNoon', { time: fmtTime(noon) }), value: dm(gha) },
              { label: t('cn.lon.lon'), value: lonStr(lon), total: true, note: t(gha <= 180 ? 'cn.lon.ruleW' : 'cn.lon.ruleE') },
            ]}
          />
        </Card>
        <Card>
          <p className="text-sm font-medium">{t('cn.lon.checkTitle')}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('cn.lon.check', { min: Math.abs(diffMin).toFixed(1), deg: (Math.abs(diffMin) / 4).toFixed(2) })}</p>
        </Card>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{t('cn.lon.accuracy')}</p>
    </div>
  )
}
