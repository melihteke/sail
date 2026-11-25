import { useEffect, useRef, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { signInWithGoogle, useAuth } from '@/lib/auth'
import { useI18n } from '../../i18n'
import { RETURN_KEY } from './returnAfterSignIn'

/** The practice radio runs on the home server behind a Cloudflare tunnel; it gets the Supabase session by postMessage. */
const RADIO_ORIGIN = 'https://radio.mteke.com'
const SCROLL_KEY = 'vhf-scroll'
const theme = () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light')

/** Google sign-in gate plus the embedded practice radio (radio.mteke.com) for the VHF radio lesson. */
export function RadioPractice() {
  const { t } = useI18n()
  const auth = useAuth()
  const box = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const [popup, setPopup] = useState<Window | null>(null)
  const session = auth.status === 'signed-in' ? auth.session : null

  useEffect(() => {
    if (sessionStorage.getItem(SCROLL_KEY) && auth.status !== 'loading') {
      sessionStorage.removeItem(SCROLL_KEY)
      box.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [auth.status])

  // The radio asks for the session ("vhf-ready"); answer only radio.mteke.com windows we embedded or opened.
  useEffect(() => {
    if (!session) return
    const payload = () => ({ type: 'sail-auth', accessToken: session.access_token, email: session.user.email, theme: theme() })
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== RADIO_ORIGIN || e.data?.type !== 'vhf-ready') return
      if (e.source !== frame.current?.contentWindow && e.source !== popup) return
      ;(e.source as Window).postMessage(payload(), RADIO_ORIGIN)
    }
    window.addEventListener('message', onMsg)
    frame.current?.contentWindow?.postMessage(payload(), RADIO_ORIGIN)
    const themeWatch = new MutationObserver(() => frame.current?.contentWindow?.postMessage({ type: 'sail-theme', theme: theme() }, RADIO_ORIGIN))
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => {
      window.removeEventListener('message', onMsg)
      themeWatch.disconnect()
    }
  }, [session, popup])

  return (
    <div ref={box} className="scroll-mt-20 overflow-hidden rounded-2xl border-2 border-sea-500 bg-white shadow-lg dark:bg-navy-900/60">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-navy-900 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            📻
          </span>
          <div>
            <div className="text-lg font-semibold leading-tight">{t('vhf.practice.title')}</div>
            <div className="text-xs text-sea-100/80">radio.mteke.com</div>
          </div>
        </div>
        {session ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-200">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
            {t('vhf.practice.online')}
          </span>
        ) : (
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm" aria-hidden>
            🔒
          </span>
        )}
      </div>

      {auth.status === 'loading' && <p className="p-5 text-sm text-slate-500">{t('vhf.practice.loading')}</p>}
      {auth.status === 'unconfigured' && <p className="p-5 text-sm text-slate-500">{t('vhf.practice.unconfigured')}</p>}

      {(auth.status === 'signed-out' || (auth.status === 'signed-in' && !session)) && (
        <div className="px-5 py-8 text-center">
          <p className="text-base font-semibold text-navy-900 dark:text-white">{t('vhf.practice.locked')}</p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">{t('vhf.practice.signIn')}</p>
          <button
            type="button"
            className="mt-5 inline-flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-800 shadow-sm transition hover:shadow-md"
            onClick={() => {
              sessionStorage.setItem(RETURN_KEY, '/rya/learn/radio')
              sessionStorage.setItem(SCROLL_KEY, '1')
              void signInWithGoogle('/academy/')
            }}
          >
            <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            {t('vhf.practice.signInButton')}
          </button>
        </div>
      )}

      {session && (
        <>
          <div className="space-y-3 px-5 py-4">
            <p className="text-sm text-slate-700 dark:text-slate-200">{t('vhf.practice.intro')}</p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn-primary" onClick={() => setPopup(window.open(`${RADIO_ORIGIN}/`, 'vhf-radio'))}>
                {t('vhf.practice.newWindow')} ↗
              </button>
              <button type="button" className="btn-secondary" onClick={() => void getSupabase()?.auth.signOut()}>
                {t('vhf.practice.signOut')}
              </button>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('vhf.practice.signedInAs', { email: session.user.email ?? '' })}</span>
            </div>
            <p className="rounded-lg border-l-4 border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">{t('vhf.practice.rules')}</p>
          </div>
          <iframe
            ref={frame}
            src={`${RADIO_ORIGIN}/`}
            title={t('game.vhf.title')}
            allow="microphone; clipboard-write; geolocation"
            className="block h-[1150px] w-full border-t-2 border-sea-500 bg-slate-50 lg:h-[920px] dark:bg-slate-900"
          />
        </>
      )}
    </div>
  )
}
