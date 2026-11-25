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
    <div ref={box} className="scroll-mt-20">
      {auth.status === 'loading' && <p className="text-sm text-slate-500">{t('vhf.practice.loading')}</p>}
      {auth.status === 'unconfigured' && <p className="text-sm text-slate-500">{t('vhf.practice.unconfigured')}</p>}
      {(auth.status === 'signed-out' || (auth.status === 'signed-in' && !session)) && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-navy-900/60">
          <div className="text-3xl" aria-hidden>
            📻
          </div>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t('vhf.practice.signIn')}</p>
          <button
            type="button"
            className="btn-primary mt-4"
            onClick={() => {
              sessionStorage.setItem(RETURN_KEY, '/rya/learn/radio')
              sessionStorage.setItem(SCROLL_KEY, '1')
              void signInWithGoogle('/academy/')
            }}
          >
            {t('vhf.practice.signInButton')}
          </button>
        </div>
      )}
      {session && (
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
            <span>{t('vhf.practice.signedInAs', { email: session.user.email ?? '' })}</span>
            <button type="button" className="text-sea-500 hover:underline" onClick={() => setPopup(window.open(`${RADIO_ORIGIN}/`, 'vhf-radio'))}>
              {t('vhf.practice.newWindow')} ↗
            </button>
            <button type="button" className="text-sea-500 hover:underline" onClick={() => void getSupabase()?.auth.signOut()}>
              {t('vhf.practice.signOut')}
            </button>
          </div>
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">{t('vhf.practice.rules')}</p>
          <iframe
            ref={frame}
            src={`${RADIO_ORIGIN}/`}
            title={t('game.vhf.title')}
            allow="microphone; clipboard-write; geolocation"
            className="h-[1150px] w-full rounded-xl border border-slate-200 bg-slate-50 shadow-sm lg:h-[900px] dark:border-white/10 dark:bg-slate-900"
          />
        </div>
      )}
    </div>
  )
}
