/** Sail handling sequences from the Competent Crew course, as small state machines. */
export interface Rig {
  cover: boolean
  ties: boolean
  /** 0 = down, 1 = fully hoisted. */
  main: number
  /** Main hoisted to the first reef. */
  reefed: boolean
  cringleHooked: boolean
  pennantTight: boolean
  reefTied: boolean
  /** 0 = furled, 1 = fully out. */
  jib: number
  toppingUp: boolean
  sheetEased: boolean
  kickerEased: boolean
  jammerClosed: boolean
  headToWind: boolean
  harness: boolean
  flaked: boolean
  tidy: boolean
}

export type ActionId =
  | 'removeCover'
  | 'removeTies'
  | 'helmUp'
  | 'bearAway'
  | 'easeSheet'
  | 'trimSheet'
  | 'easeKicker'
  | 'tightenKicker'
  | 'liftTopping'
  | 'easeTopping'
  | 'hoistHalyard'
  | 'closeJammer'
  | 'lowerHalyard'
  | 'hookCringle'
  | 'winchPennant'
  | 'tieReef'
  | 'easeFurling'
  | 'pullLeeward'
  | 'pullWindward'
  | 'pullFurling'
  | 'letSheetFly'
  | 'controlSheet'
  | 'flakeMain'
  | 'tieSail'
  | 'coverOn'
  | 'tidyLines'
  | 'clipOn'

export interface HoldAction {
  /** Which value the action moves and where to. */
  value: 'main' | 'jib'
  target: number
}

export const holdActions: Partial<Record<ActionId, HoldAction>> = {
  hoistHalyard: { value: 'main', target: 1 },
  pullLeeward: { value: 'jib', target: 1 },
  pullFurling: { value: 'jib', target: 0 },
}

export interface RigTask {
  id: 'hoist-main' | 'unfurl-jib' | 'reef' | 'drop-main' | 'furl-jib'
  start: Rig
  /** Each group must be completed (in any order inside the group) before the next. */
  groups: ActionId[][]
  /** Buttons shown: the task actions plus a few distractors. */
  buttons: ActionId[]
  /** Lowering target for lowerHalyard in this task. */
  lowerTo?: number
}

const harbour: Rig = {
  cover: true,
  ties: true,
  main: 0,
  reefed: false,
  cringleHooked: false,
  pennantTight: false,
  reefTied: false,
  jib: 0,
  toppingUp: true,
  sheetEased: false,
  kickerEased: false,
  jammerClosed: false,
  headToWind: false,
  harness: false,
  flaked: true,
  tidy: true,
}

const sailing: Rig = { ...harbour, cover: false, ties: false, main: 1, jib: 1, toppingUp: false, jammerClosed: true, flaked: false }

export const rigTasks: RigTask[] = [
  {
    id: 'hoist-main',
    start: { ...harbour },
    groups: [['removeCover'], ['removeTies', 'helmUp'], ['easeSheet', 'easeKicker'], ['hoistHalyard'], ['closeJammer'], ['trimSheet', 'easeTopping'], ['tightenKicker', 'tidyLines'], ['bearAway']],
    buttons: ['removeCover', 'removeTies', 'helmUp', 'bearAway', 'easeSheet', 'trimSheet', 'easeKicker', 'tightenKicker', 'easeTopping', 'liftTopping', 'hoistHalyard', 'closeJammer', 'winchPennant', 'tidyLines'],
  },
  {
    id: 'unfurl-jib',
    start: { ...sailing, jib: 0 },
    groups: [['easeFurling'], ['pullLeeward'], ['tidyLines']],
    buttons: ['easeFurling', 'pullLeeward', 'pullWindward', 'pullFurling', 'letSheetFly', 'helmUp', 'tidyLines'],
  },
  {
    id: 'reef',
    start: { ...sailing },
    groups: [['clipOn'], ['helmUp'], ['easeKicker', 'easeSheet'], ['liftTopping'], ['lowerHalyard'], ['hookCringle'], ['hoistHalyard'], ['winchPennant'], ['easeTopping', 'trimSheet', 'tightenKicker'], ['tieReef', 'tidyLines'], ['bearAway']],
    buttons: ['clipOn', 'helmUp', 'bearAway', 'easeSheet', 'trimSheet', 'easeKicker', 'tightenKicker', 'liftTopping', 'easeTopping', 'lowerHalyard', 'hookCringle', 'hoistHalyard', 'winchPennant', 'tieReef', 'tidyLines'],
    lowerTo: 0.72,
  },
  {
    id: 'drop-main',
    start: { ...sailing, jib: 0 },
    groups: [['helmUp'], ['liftTopping', 'easeKicker'], ['lowerHalyard'], ['flakeMain'], ['tieSail', 'trimSheet'], ['tidyLines', 'coverOn']],
    buttons: ['helmUp', 'bearAway', 'liftTopping', 'easeKicker', 'easeSheet', 'trimSheet', 'lowerHalyard', 'hoistHalyard', 'flakeMain', 'tieSail', 'coverOn', 'tidyLines'],
    lowerTo: 0,
  },
  {
    id: 'furl-jib',
    start: { ...sailing },
    groups: [['controlSheet'], ['pullFurling'], ['tidyLines']],
    buttons: ['controlSheet', 'letSheetFly', 'pullFurling', 'pullLeeward', 'easeFurling', 'tidyLines'],
  },
]

/** The effect of a completed action on the rig. */
export function applyAction(r: Rig, a: ActionId, task: RigTask): Rig {
  switch (a) {
    case 'removeCover':
      return { ...r, cover: false }
    case 'removeTies':
      return { ...r, ties: false, flaked: false }
    case 'helmUp':
      return { ...r, headToWind: true }
    case 'bearAway':
      return { ...r, headToWind: false }
    case 'easeSheet':
      return { ...r, sheetEased: true }
    case 'trimSheet':
      return { ...r, sheetEased: false }
    case 'easeKicker':
      return { ...r, kickerEased: true }
    case 'tightenKicker':
      return { ...r, kickerEased: false }
    case 'liftTopping':
      return { ...r, toppingUp: true }
    case 'easeTopping':
      return { ...r, toppingUp: false }
    case 'hoistHalyard':
      return { ...r, main: r.cringleHooked ? r.main : 1, jammerClosed: r.cringleHooked ? true : r.jammerClosed }
    case 'closeJammer':
      return { ...r, jammerClosed: true }
    case 'lowerHalyard':
      return { ...r, main: task.lowerTo ?? 0, jammerClosed: false }
    case 'hookCringle':
      return { ...r, cringleHooked: true, reefed: true }
    case 'winchPennant':
      return { ...r, pennantTight: true }
    case 'tieReef':
      return { ...r, reefTied: true }
    case 'easeFurling':
    case 'controlSheet':
    case 'clipOn':
      return a === 'clipOn' ? { ...r, harness: true } : r
    case 'pullLeeward':
      return { ...r, jib: 1 }
    case 'pullFurling':
      return { ...r, jib: 0 }
    case 'flakeMain':
      return { ...r, flaked: true }
    case 'tieSail':
      return { ...r, ties: true }
    case 'coverOn':
      return { ...r, cover: true }
    case 'tidyLines':
      return { ...r, tidy: true }
    default:
      return r
  }
}

export type Attempt = { ok: true; groupDone: boolean; finished: boolean } | { ok: false; reason: 'early' | 'wrong' | 'done' }

/** Checks an action against the task. `done` is the set of actions already completed. */
export function attempt(task: RigTask, done: ActionId[], a: ActionId): Attempt {
  const gi = currentGroup(task, done)
  if (gi >= task.groups.length) return { ok: false, reason: 'done' }
  if (done.includes(a)) return { ok: false, reason: 'done' }
  if (task.groups[gi].includes(a)) {
    const nextDone = [...done, a]
    const groupDone = task.groups[gi].every((x) => nextDone.includes(x))
    return { ok: true, groupDone, finished: groupDone && gi === task.groups.length - 1 }
  }
  return { ok: false, reason: task.groups.some((g) => g.includes(a)) ? 'early' : 'wrong' }
}

export function currentGroup(task: RigTask, done: ActionId[]): number {
  let gi = 0
  while (gi < task.groups.length && task.groups[gi].every((x) => done.includes(x))) gi++
  return gi
}

export function rigStars(mistakes: number): 1 | 2 | 3 {
  return mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
}
