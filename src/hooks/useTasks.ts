import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task } from '@/types'

export function useTasks(projectId?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      let query = supabase
        .from('tasks')
        .select('*, project:projects(id, name)')
        .order('position', { ascending: true })

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query
      if (error) console.error(error)
      else setTasks(data ?? [])
      setLoading(false)
    }

    load()
  }, [projectId])

  async function addTask(task: {
    title: string
    description?: string
    status: string
    priority: string
    due_date?: string
    project_id: string
  }) {
    const supabase = createClient()

    const { data: userData } = await supabase
      .from('users')
      .select('workspace_id')
      .single()

    if (!userData) return

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...task,
        workspace_id: userData.workspace_id,
        position: tasks.length,
      })
      .select('*, project:projects(id, name)')
      .single()

    if (error) console.error(error)
    else setTasks((prev) => [...prev, data])
  }

  async function updateTask(id: string, updates: Partial<Task>) {
    const supabase = createClient()
    await supabase.from('tasks').update(updates).eq('id', id)
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    )
  }

  async function deleteTask(id: string) {
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return { tasks, loading, addTask, updateTask, deleteTask }
}