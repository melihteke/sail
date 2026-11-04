import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getLang, onLangChange, setLang as setSiteLang } from '@/lib/lang'
import { I18nContext, format, type Lang, type Translate } from './context'
import { en, type Messages } from './en'
import { nl } from './nl'
import { tr } from './tr'

const dictionaries: Record<Lang, Messages> = { en, nl, tr }

/** Follows the site-wide language picked with the flag switcher in the header. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getLang)

  useEffect(() => onLangChange(setLangState), [])

  const setLang = useCallback((l: Lang) => setSiteLang(l), [])

  const t = useCallback<Translate>((key, params) => format(dictionaries[lang][key] ?? en[key], params), [lang])
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
