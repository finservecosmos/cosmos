import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../shared/api/supabaseClient'
import { dummyUser } from '../lib/dummyData'

const UserContext = createContext()

const isDev = !!import.meta.env.VITE_DEV_EMAIL

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      // Dev mode — use dummy user
      if (isDev && sessionStorage.getItem('dev_auth') === 'true') {
        setUser(dummyUser)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, email')
        .eq('id', session.user.id)
        .single()

      if (profile) {
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

    loadUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
