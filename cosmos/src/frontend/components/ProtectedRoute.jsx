import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function ProtectedRoute({ children, allowedRoles }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'authorized' | 'unauthorized' | 'forbidden'

  useEffect(() => {
    const checkAuth = async () => {
      // ── Dev bypass (remove before production) ─────────────
      if (sessionStorage.getItem('dev_auth') === 'true') {
        setStatus('authorized')
        return
      }
      // ──────────────────────────────────────────────────────

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setStatus('unauthorized')
        return
      }

      // Fetch user role from profiles table
      // If table doesn't exist yet, allow access with default role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      // If profiles table not set up yet, allow access (remove this once table exists)
      if (error) {
        console.warn('profiles table not found or error — allowing access:', error.message)
        setStatus('authorized')
        return
      }

      if (!profile) {
        setStatus('authorized') // allow if no profile row yet
        return
      }

      if (allowedRoles && !allowedRoles.includes(profile.role)) {
        setStatus('forbidden')
        return
      }

      setStatus('authorized')
    }

    checkAuth()
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
