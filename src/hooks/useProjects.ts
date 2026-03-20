import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/types'

export function useProjects(clientId?: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      let query = supabase
        .from('projects')
        .select('*, client:clients(id, name)')
        .order('created_at', { ascending: false })

      if (clientId) {
        query = query.eq('client_id', clientId)
      }

      const { data, error } = await query

      if (error) console.error(error)
      else setProjects(data ?? [])

      setLoading(false)
    }

    load()
  }, [clientId])

  async function deleteProject(id: string) {
    const supabase = createClient()
    await supabase.from('projects').delete().eq('id', id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  async function addProject(project: {
    name: string
    description?: string
    status: string
    deadline?: string
    client_id: string
  }) {
    const supabase = createClient()

    const { data: userData } = await supabase
      .from('users')
      .select('workspace_id')
      .single()

    if (!userData) return

    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) return

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...project,
        workspace_id: userData.workspace_id,
        created_by: authData.user.id,
      })
      .select('*, client:clients(id, name)')
      .single()

    if (error) console.error(error)
    else setProjects((prev) => [data, ...prev])
  }

  return { projects, loading, deleteProject, addProject }
}