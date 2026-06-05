import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../../context/ToastContext'

export default function useAutoLogout(timeoutMs = 1800000) { // 30 minutes default
  const navigate = useNavigate()
  const { addToast } = useToast()
  const timerRef = useRef(null)

  useEffect(() => {
    // If dev auth bypass is active, skip auto-logout
    if (sessionStorage.getItem('dev_auth') === 'true') {
      return
    }

    const isEnabled = localStorage.getItem('session_timeout_enabled') !== 'false'
    if (!isEnabled) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(logoutUser, timeoutMs)
    }

    const logoutUser = async () => {
      try {
        sessionStorage.removeItem('dev_auth')
        await supabase.auth.signOut()
        addToast('You have been logged out automatically due to inactivity.', 'info')
        navigate('/', { replace: true })
      } catch (err) {
        console.error('Auto logout error:', err)
        navigate('/', { replace: true })
      }
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(evt => document.addEventListener(evt, resetTimer))

    resetTimer()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach(evt => document.removeEventListener(evt, resetTimer))
    }
  }, [navigate, addToast, timeoutMs])
}
