export type Lang = "en" | "nl" | "tr";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "nl", label: "Nederlands" },
  { code: "tr", label: "Türkçe" },
];

const STORAGE_KEY = "lang";
export const LANG_EVENT = "site-lang";

export function isLang(v: unknown): v is Lang {
  return v === "en" || v === "nl" || v === "tr";
}

/** English unless the visitor picked another language with the flag switcher. */
export function getLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    // ignore
  }
  return "en";
}

export function setLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
  document.documentElement.lang = lang;
  window.dispatchEvent(new CustomEvent<Lang>(LANG_EVENT, { detail: lang }));
}

export function onLangChange(cb: (lang: Lang) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<Lang>).detail);
  window.addEventListener(LANG_EVENT, handler);
  return () => window.removeEventListener(LANG_EVENT, handler);
}
