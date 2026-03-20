'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Workspace {
  id: string
  name: string
  logo_url?: string
}

interface UserData {
  id: string
  full_name: string
  avatar_url?: string
  role: string
  workspace: Workspace | null
}

interface UserContextType {
  user: UserData | null
  loading: boolean
  refresh: () => void
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refresh: () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    const supabase = createClient()
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) { setLoading(false); return }

    const { data: userData } = await supabase
      .from('users')
      .select('*, workspace:workspaces(id, name, logo_url)')
      .eq('id', authData.user.id)
      .single()

    if (userData) {
      const ws = Array.isArray(userData.workspace)
        ? userData.workspace[0]
        : userData.workspace

      setUser({
        id: userData.id,
        full_name: userData.full_name ?? '',
        avatar_url: userData.avatar_url ?? '',
        role: userData.role ?? 'member',
        workspace: ws ?? null,
      })
    }

    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <UserContext.Provider value={{ user, loading, refresh: load }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}