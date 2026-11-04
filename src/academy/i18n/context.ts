import type { Lang } from '@/lib/lang'
import { createContext, useContext } from 'react'
import type { MessageKey } from './en'

export type { Lang } from '@/lib/lang'
export { LANGS } from '@/lib/lang'

export type Translate = (key: MessageKey, params?: Record<string, string | number>) => string

export interface I18nValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translate
}

export const I18nContext = createContext<I18nValue | null>(null)

export function format(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m))
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}

