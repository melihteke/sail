import { describe, expect, it } from 'vitest'
import { en } from '../../i18n/en'
import { nl } from '../../i18n/nl'
import { tr } from '../../i18n/tr'
import { anchorLevels, playNight } from './anchor/anchor'
import { buoyLevels } from './buoy/buoySim'
import { buildScenarios, cpa, newHistory, scoreEncounter, visibleLights } from './collision/encounter'
import { courses, COURSE_IDS } from './courses'
import { DECISIONS } from './decisions/SkipperCall'
import { harbourLevels } from './harbour/levels'
import { LESSON_IDS, lessonMeta, lessonSets, swingRadius, tideWindow, twelfthsHeight } from './lessons/lessons'
import { CLEAT_STEPS, CLEAT_WRONG, JOBS, KNOTS } from './knots/KnotLab'
import { linesLevels } from './lines/lines'
import { ASPECTS, LOOKOUT_LEVELS, TYPES } from './lookout/LookoutGame'
import { checkClearing, decisionCorrect, simulatePassage } from './passage/passage'
import { checkStep, emptyExperience, readyIndex, roadmap } from './roadmap'
import { attempt, rigTasks } from './rig/rig'
import { judgeMove, MOVE_THRESHOLD, rigState, SAILING, STOWED, TASKS, taskStart } from './rig3d/rigModel'
import { letFlyVerdict, turnAngle } from './tack/tack'
import { CALL_CASES, CALL_TYPES, DISTRACTORS, MAYDAY_GROUPS, NATURES } from './vhf/VhfGame'

/** Every message key built at runtime from game data. */
function dynamicKeys(): string[] {
  const k: string[] = []
  for (const c of COURSE_IDS) {
    const course = courses[c]
    k.push(`rya.course.${c}.title`, `rya.course.${c}.desc`, `rya.course.${c}.intro`)
    for (const g of course.games) k.push(`rya.g.${g.id}.title`, `rya.g.${g.id}.desc`, `rya.g.${g.id}.intro`)
    for (const b of course.briefing) k.push(`rya.b.${b.id}.title`, `rya.b.${b.id}.text`)
    for (const q of course.quiz) k.push(`rya.q.${q.id}`, `rya.q.${q.id}.why`, ...[0, 1, 2, 3].map((i) => `rya.q.${q.id}.a${i}`))
    for (let i = 1; i <= course.checklist; i++) k.push(`rya.c.${c}.${i}`)
    for (const m of course.modules) k.push(m.key)
  }
  for (const s of roadmap) k.push(...['name', 'short', 'what', 'note', 'after'].map((p) => `rya.step.${s.id}.${p}`))
  for (const r of ['days', 'skipperDays', 'miles', 'nightHours', 'passages']) k.push(`rya.calc.more.${r}`)
  for (const l of harbourLevels) {
    k.push(`rya.hb.l.${l.id}`, `rya.hb.l.${l.id}.goal`, `rya.hb.l.${l.id}.tip`)
    for (const line of l.lines ?? []) k.push(`rya.line.${line.id}`)
  }
  for (const task of rigTasks) {
    k.push(`rya.rig.t.${task.id}`, `rya.rig.t.${task.id}.goal`)
    for (const a of [...task.buttons, ...task.groups.flat()]) k.push(`rya.rig.a.${a}`, `rya.rig.x.${a}`)
  }
  for (const j of JOBS) k.push(`rya.kn.job.${j.id}`)
  for (const kn of KNOTS) k.push(`rya.kn.k.${kn}`, `rya.kn.why.${kn}`)
  for (const c of ['roundTurn', 'figure8', 'lock', ...CLEAT_WRONG]) k.push(`rya.kn.cl.bad.${c}`)
  for (const c of CLEAT_STEPS) k.push(`rya.kn.cl.ok.${c}`)
  for (const c of ['roundTurn', 'figure8', 'lock', ...CLEAT_WRONG]) k.push(`rya.kn.cl.c.${c}`)
  for (const l of linesLevels) k.push(`rya.ln.l.${l.id}`, `rya.ln.l.${l.id}.goal`, ...l.fenders.map((f) => `rya.ln.f.${f}`))
  for (const r of ['bowLine', 'sternLine', 'bowSpring', 'sternSpring', 'breast']) k.push(`rya.ln.role.${r}`)
  for (const id of Object.keys(LOOKOUT_LEVELS)) k.push(`rya.lo.l.${id}`)
  for (const ty of TYPES) k.push(`rya.lo.type.${ty}`, `rya.lo.why.${ty}`)
  for (const a of ASPECTS) k.push(`rya.lo.aspect.${a}`)
  for (const n of NATURES) k.push(`rya.vhf.nature.${n}`)
  for (const b of [...MAYDAY_GROUPS.flat(), ...DISTRACTORS]) k.push(`rya.vhf.b.${b}`)
  for (const b of DISTRACTORS) k.push(`rya.vhf.my.bad.${b}`)
  for (const c of CALL_CASES) k.push(`rya.vhf.case.${c.id}`, `rya.vhf.case.${c.id}.why`)
  for (const ty of CALL_TYPES) k.push(`rya.vhf.type.${ty}`)
  for (const s of buildScenarios()) k.push(`rya.cc.s.${s.id}`, `rya.cc.s.${s.id}.brief`, `rya.cc.s.${s.id}.why`)
  for (const n of ['safe', 'unsafe', 'held', 'altered', 'bearings', 'noBearings', 'portTurn', 'early', 'late', 'substantial', 'small', 'starboard', 'port', 'starboardInFog', 'portInFog', 'signalOk', 'signalWrong'])
    k.push(`rya.cc.n.${n}`)
  for (const l of anchorLevels) k.push(`rya.an.l.${l.id}`, `rya.an.l.${l.id}.goal`)
  for (const l of buoyLevels) k.push(`rya.bu.l.${l.id}`, `rya.bu.l.${l.id}.brief`, `rya.bu.l.${l.id}.why`)
  for (const p of ['main', 'jib', 'both']) k.push(`rya.bu.plan.${p}`)
  for (const r of ['crosses', 'tooWide', 'inside']) k.push(`rya.ps.pl.err.${r}`)
  for (const d of ['hold', 'port', 'starboard']) k.push(`rya.ps.pl.d.${d}`)
  for (const d of DECISIONS) {
    k.push(`rya.dc.${d.id}`, `rya.dc.${d.id}.intro`, `rya.dc.${d.id}.lesson`)
    d.steps.forEach((_, i) => k.push(`rya.dc.${d.id}.${i + 1}.q`, ...['a', 'b', 'c'].flatMap((c) => [`rya.dc.${d.id}.${i + 1}.${c}`, `rya.dc.${d.id}.${i + 1}.${c}.why`])))
  }
  return k
}

describe('RYA translations', () => {
  it('exist in every language for all keys built from game data', () => {
    for (const dict of [en, nl, tr]) for (const key of dynamicKeys()) expect(dict[key as keyof typeof en], key).toBeTruthy()
  })

  it('keep the same {placeholders} as English', () => {
    for (const dict of [nl, tr])
      for (const key of Object.keys(en).filter((x) => x.startsWith('rya.'))) {
        const want = (en[key as keyof typeof en].match(/\{\w+\}/g) ?? []).sort().join()
        const got = (dict[key as keyof typeof en].match(/\{\w+\}/g) ?? []).sort().join()
        expect(got, key).toBe(want)
      }
  })
})

describe('RYA roadmap', () => {
  it('puts a beginner at the start and needs sea time for Day Skipper', () => {
    expect(readyIndex(emptyExperience)).toBe(1)
    const ds = roadmap.find((s) => s.id === 'daySkipper')!
    expect(checkStep(ds, { ...emptyExperience, days: 5, miles: 100, nightHours: 4 }).every((c) => c.met)).toBe(true)
    expect(readyIndex({ ...emptyExperience, days: 5, miles: 100, nightHours: 4 })).toBe(2)
  })
})

describe('Rig & Hoist sequences', () => {
  it('rejects hoisting before the sheet and kicker are eased', () => {
    const hoist = rigTasks.find((x) => x.id === 'hoist-main')!
    expect(attempt(hoist, ['removeCover', 'removeTies', 'helmUp'], 'hoistHalyard')).toEqual({ ok: false, reason: 'early' })
    expect(attempt(hoist, ['removeCover', 'removeTies', 'helmUp', 'easeSheet', 'easeKicker'], 'hoistHalyard').ok).toBe(true)
  })
})

describe('3D rig model', () => {
  it('eased mainsheet lets the boom out to the wind and the main luffs; sheeting in fills it', () => {
    const eased = rigState({ ...SAILING, mainsheet: 0 }, 60)
    expect(eased.boomAngle).toBeCloseTo(60)
    expect(eased.warnings).toContain('mainLuff')
    const trimmed = rigState({ ...SAILING, mainsheet: 0.6 }, 60)
    expect(trimmed.boomAngle).toBeLessThan(45)
    expect(trimmed.warnings).not.toContain('mainLuff')
  })

  it('a loose kicker lets the boom lift', () => {
    const base = { ...SAILING, mainsheet: 0.3 }
    expect(rigState({ ...base, kicker: 0 }, 90).boomPitch).toBeGreaterThan(rigState({ ...base, kicker: 1 }, 90).boomPitch + 3)
  })

  it('with the main down the boom drops unless the topping lift holds it', () => {
    expect(rigState({ ...STOWED, topping: 0 }, 50).warnings).toContain('boomDown')
    expect(rigState(STOWED, 50).warnings).not.toContain('boomDown')
  })

  it('furling line rolls the jib away; the windward sheet backs it', () => {
    expect(rigState({ ...SAILING, furling: 1 }, 50).jibUp).toBe(false)
    const backed = rigState({ ...SAILING, jibLee: 0, jibWind: 1 }, 50)
    expect(backed.jibAngle).toBeLessThan(0)
    expect(backed.warnings).toContain('backed')
  })

  it('every challenge task can be done from its start position', () => {
    for (const task of TASKS) {
      const v = taskStart(task)[task.control] + task.dir * MOVE_THRESHOLD
      expect(v >= 0 && v <= 1, task.id).toBe(true)
    }
  })

  it('judges the line that moved most', () => {
    const task = TASKS.find((x) => x.id === 'furlJib')!
    const base = taskStart(task)
    expect(judgeMove(task, base, { ...base, furling: base.furling + 0.05 })).toBeNull()
    expect(judgeMove(task, base, { ...base, furling: base.furling + 0.3 })?.ok).toBe(true)
    expect(judgeMove(task, base, { ...base, jibLee: base.jibLee - 0.3 })).toEqual({ control: 'jibLee', dir: -1, ok: false })
  })
})

describe('Tack timing', () => {
  it('releases the jib only around head to wind', () => {
    expect(letFlyVerdict(30)).toBe('early')
    expect(letFlyVerdict(2)).toBe('good')
    expect(letFlyVerdict(-30)).toBe('late')
    expect(turnAngle(150, -150, 0.5, 180)).toBe(180)
  })
})

describe('Collision encounters', () => {
  it('collision-course targets would hit us if nobody acts', () => {
    for (const s of buildScenarios().filter((x) => ['crossing', 'sailing', 'night', 'fog'].includes(x.id))) {
      expect(cpa(s.own, s.targets[0]).cpa, s.id).toBeLessThan(0.05)
    }
  })

  it('shows a red sidelight only on the port side of a vessel', () => {
    expect(visibleLights('powerSmall', -45).map((l) => l.colour)).toEqual(['white', 'red'])
    expect(visibleLights('powerSmall', 180).map((l) => l.colour)).toEqual(['white'])
  })

  it('rewards an early, bold alteration to starboard by the give-way vessel', () => {
    const s = buildScenarios().find((x) => x.id === 'crossing')!
    const good = scoreEncounter(s, { ...newHistory(), firstActionRange: 3, firstActionSide: 1, maxDeviation: 40, bearingsBeforeAction: 2, minRange: 1 })
    const bad = scoreEncounter(s, { ...newHistory(), firstActionRange: 1, firstActionSide: -1, maxDeviation: 10, minRange: 0.6 })
    expect(good.points).toBe(good.max)
    expect(bad.points).toBe(2)
  })
})

describe('Anchor Bay', () => {
  it('drags with too little scope and holds with enough', () => {
    const cove = anchorLevels[0]
    expect(playNight(cove, { x: 150, y: 170 }, 15).event.kind).toBe('drag')
    expect(playNight(cove, { x: 10, y: 210 }, 25).event.kind).toBe('ok')
  })
})

describe('Passage planning', () => {
  it('only reaches the bar with enough water when leaving in the right window', () => {
    expect(simulatePassage(5 * 60).barOk).toBe(false)
    expect(simulatePassage(9 * 60).barOk).toBe(true)
    expect(simulatePassage(12 * 60).barOk).toBe(false)
  })

  it('accepts a clearing bearing that just clears the ledge and judges readings against it', () => {
    expect(checkClearing(20).ok).toBe(true)
    expect(checkClearing(5).ok).toBe(false)
    expect(decisionCorrect(25, 20, 'hold')).toBe(true)
    expect(decisionCorrect(15, 20, 'port')).toBe(true)
    expect(decisionCorrect(15, 20, 'hold')).toBe(false)
  })
})

describe('RYA lessons', () => {
  const kinds = (set: (typeof lessonSets)['en']) =>
    LESSON_IDS.map((id) => set[id].sections.map((s) => s.blocks.map((b) => Object.keys(b)[0] + ('widget' in b ? b.widget : 'game' in b ? b.game : '')).join(',')).join('|'))

  it('have the same structure, widgets, game links and answers in every language', () => {
    const ref = kinds(lessonSets.en)
    for (const lang of ['nl', 'tr'] as const) {
      expect(kinds(lessonSets[lang]), lang).toEqual(ref)
      for (const id of LESSON_IDS) {
        const a = lessonSets.en[id]
        const b = lessonSets[lang][id]
        expect(b.check.map((q) => [q.answer, q.options.length]), `${lang} ${id}`).toEqual(a.check.map((q) => [q.answer, q.options.length]))
        a.sections.forEach((s, si) =>
          s.blocks.forEach((blk, bi) => {
            const other = b.sections[si].blocks[bi]
            if ('steps' in blk && 'steps' in other) expect(other.steps.length, `${lang} ${id} ${si}`).toBe(blk.steps.length)
            if ('table' in blk && 'table' in other) expect(other.table.rows.length, `${lang} ${id} ${si}`).toBe(blk.table.rows.length)
          }),
        )
      }
    }
  })

  it('only link to games that exist in the course', () => {
    for (const m of lessonMeta) {
      for (const g of m.games) expect(courses[g.course].games.some((x) => x.id === g.game), `${m.id} ${g.game}`).toBe(true)
      for (const s of lessonSets.en[m.id].sections) for (const b of s.blocks) if ('game' in b) expect(m.games.some((g) => g.game === b.game), `${m.id} ${b.game}`).toBe(true)
    }
  })

  it('give every game at least one lesson', () => {
    for (const c of COURSE_IDS) for (const g of courses[c].games) expect(lessonMeta.some((m) => m.games.some((x) => x.game === g.id)), g.id).toBe(true)
  })

  it('match the worked tide examples', () => {
    expect(twelfthsHeight(0.8, 5.0, 4)).toBeCloseTo(3.95, 2)
    expect(twelfthsHeight(1.0, 4.6, 3)).toBeCloseTo(2.8, 2)
    const win = tideWindow(0.8, 5.0, 3.8)!
    expect(win[0]).toBeGreaterThan(3.5)
    expect(win[0]).toBeLessThan(4)
    expect(win[1]).toBeCloseTo(12 - win[0], 5)
    expect(swingRadius(35, 8.2)).toBeCloseTo(39, 0)
  })
})
