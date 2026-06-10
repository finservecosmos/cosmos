import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../shared/api/supabaseClient'

const dummyUser = {
  name: 'Admin User',
  email: 'admin@cosmos.com',
  role: 'admin',
  initials: 'AD'
}

const UserContext = createContext()

const isDev = !!import.meta.env.VITE_DEV_EMAIL

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loadUser = async (session) => {
      // Dev mode — use dummy user
      if (isDev && sessionStorage.getItem('dev_auth') === 'true') {
        setUser(dummyUser)
        return
      }

      if (!session) {
        setUser(null)
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, role, email')
        .eq('id', session.user.id)
        .single()

      if (profile && !error) {
        setUser({
          name: profile.full_name,
          email: profile.email || session.user.email,
          role: profile.role,
          initials: profile.full_name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U',
        })
      } else {
        // Fallback to auth user
        setUser({
          name: session.user.email,
          email: session.user.email,
          role: 'staff',
          initials: session.user.email?.[0]?.toUpperCase() || 'U',
        })
      }
    }

    // 1. Initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUser(session)
    })

    // 2. Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session)
    })

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
