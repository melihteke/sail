import { ryaCcEn } from './cc.en'
import { ryaCoreEn } from './core.en'
import { ryaDsEn } from './ds.en'

export const ryaEn = { ...ryaCoreEn, ...ryaCcEn, ...ryaDsEn }
export type RyaMessages = Record<keyof typeof ryaEn, string>
