import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Workspace } from '@/types'

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data: userData } = await supabase
        .from('users')
        .select('*, workspace:workspaces(*)')
        .eq('id', authUser.id)
        .single()

      if (userData) {
        setUser(userData)
        setWorkspace(userData.workspace)
      }

      setLoading(false)
    }

    load()
  }, [])

  return { workspace, user, loading }
}