import type { Scenario } from '../scenario'
import { ISTANBUL } from './istanbul'
import { RAVENSEY } from './ravensey'
import { SALTMERE } from './saltmere'
import { ZEEBRIES } from './windfarm'

export { SALTMERE }

/** Extra practice scenarios, in the order they are offered after the main lesson. */
export const EXTRA_SCENARIOS: Scenario[] = [ZEEBRIES, RAVENSEY, ISTANBUL]
export const ALL_SCENARIOS: Scenario[] = [SALTMERE, ...EXTRA_SCENARIOS]

export const scenarioById = (id: string | undefined) => EXTRA_SCENARIOS.find((s) => s.id === id)
