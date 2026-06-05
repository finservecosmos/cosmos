import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function ProtectedRoute({ children, allowedRoles }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'authorized' | 'unauthorized' | 'forbidden'

  useEffect(() => {
    let active = true

    const checkAuth = async () => {
      // ── Dev bypass (only active in development environment) ──
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || import.meta.env.DEV
      if (isDev && sessionStorage.getItem('dev_auth') === 'true') {
        if (active) setStatus('authorized')
        return
      }
      // ─────────────────────────────────────────────────────────

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        if (active) setStatus('unauthorized')
        return
      }

      // Fetch user role from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.warn('profiles table not found or error — allowing access:', error.message)
        if (active) setStatus('authorized')
        return
      }

      if (!profile) {
        if (active) setStatus('authorized')
        return
      }

      if (allowedRoles && !allowedRoles.includes(profile.role)) {
        if (active) setStatus('forbidden')
        return
      }

      if (active) setStatus('authorized')
    }

    checkAuth()

    // Subscribe to auth state changes for real-time session expiry/update handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return
      
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

  if (status === 'unauthorized') return <Navigate to="/" replace />
  if (status === 'forbidden') return <Navigate to="/unauthorized" replace />

  return children
}

export default ProtectedRoute
