import type { Lang } from '../../../i18n'
import { istanbulText } from './scenarios/istanbul.text'
import { saltmereText } from './scenarios/saltmere.text'
import { tssText } from './scenarios/tss.text'
import { windfarmText } from './scenarios/windfarm.text'
import type { AlmanacText, ScenarioText } from './text'
import { almanacEn } from './text.en'
import { almanacNl } from './text.nl'
import { almanacTr } from './text.tr'

export const almanacTexts: Record<Lang, AlmanacText> = { en: almanacEn, nl: almanacNl, tr: almanacTr }

/** Texts per scenario id and language. */
export const scenarioTexts: Record<string, Record<Lang, ScenarioText>> = {
  saltmere: saltmereText,
  windfarm: windfarmText,
  tss: tssText,
  istanbul: istanbulText,
}
