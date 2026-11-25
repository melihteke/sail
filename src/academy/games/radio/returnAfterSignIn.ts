import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSupabase } from '@/lib/supabase'

export const RETURN_KEY = 'academy-return'

/** After Google sign-in Supabase lands on /academy/; send the user back to the module that started the sign-in. */
export function useReturnAfterSignIn() {
  const navigate = useNavigate()
  useEffect(() => {
    const target = sessionStorage.getItem(RETURN_KEY)
    if (!target) return
    sessionStorage.removeItem(RETURN_KEY)
    getSupabase()
    navigate(target, { replace: true })
  }, [navigate])
}
