import { ryaCcTr } from './cc.tr'
import { ryaCoreTr } from './core.tr'
import { ryaDsTr } from './ds.tr'
import type { RyaMessages } from './en'

export const ryaTr: RyaMessages = { ...ryaCoreTr, ...ryaCcTr, ...ryaDsTr }
