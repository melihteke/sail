import { ryaCcNl } from './cc.nl'
import { ryaCoreNl } from './core.nl'
import { ryaDsNl } from './ds.nl'
import type { RyaMessages } from './en'

export const ryaNl: RyaMessages = { ...ryaCoreNl, ...ryaCcNl, ...ryaDsNl }
