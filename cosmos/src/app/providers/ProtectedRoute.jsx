import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../shared/api/supabaseClient'

function ProtectedRoute({ children, allowedRoles }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'authorized' | 'unauthorized' | 'forbidden'

  useEffect(() => {
    let active = true

    const checkAuth = async () => {
      // ── Dev bypass (only active in development environment) ──
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || import.meta.env.DEV
      if (isDev && (sessionStorage.getItem('dev_auth') === 'true' || localStorage.getItem('user_role') || sessionStorage.getItem('user_role'))) {
        if (active) setStatus('authorized')
        return
      }
      // ─────────────────────────────────────────────────────────

      try {
        const fetchSessionWithTimeout = Promise.race([
          supabase.auth.getSession(),
          new Promise(resolve => setTimeout(() => resolve({ data: { session: null } }), 1500))
        ])

        const { data: { session } } = await fetchSessionWithTimeout

        if (!session) {
          if (isDev) {
            if (active) setStatus('authorized')
            return
          }
          if (active) setStatus('unauthorized')
          return
        }

        // Fetch user role from profiles table with timeout
        const fetchProfileWithTimeout = Promise.race([
          supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle(),
          new Promise(resolve => setTimeout(() => resolve({ data: null, error: new Error('Timeout') }), 1500))
        ])

        const { data: profile, error } = await fetchProfileWithTimeout

        if (error || !profile) {
          if (active) setStatus('authorized')
          return
        }

        if (allowedRoles && !allowedRoles.includes(profile.role)) {
          if (active) setStatus('forbidden')
          return
        }

        if (active) setStatus('authorized')
      } catch (err) {
        console.warn('Auth check error/timeout:', err)
        if (active) setStatus('authorized')
      }
    }

    checkAuth()

    // Subscribe to auth state changes for real-time session expiry/update handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return

      // ── Dev bypass check ──
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || import.meta.env.DEV
      if (isDev && sessionStorage.getItem('dev_auth') === 'true') {
        setStatus('authorized')
        return
      }
      // ──────────────────────

      if (event === 'SIGNED_OUT') {
        setStatus('unauthorized')
      } else if (event === 'TOKEN_REFRESH_INITIALIZED' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        checkAuth()
      }
    })

    return () => {
      active = false
      subscription?.unsubscribe()
    }
  }, [allowedRoles])

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: '#888', fontFamily: 'system-ui' }}>Loading...</p>
      </div>
    )
  }

  if (status === 'unauthorized') return <Navigate to="/login" replace />
  if (status === 'forbidden') return <Navigate to="/unauthorized" replace />

  return children
}

export default ProtectedRoute
