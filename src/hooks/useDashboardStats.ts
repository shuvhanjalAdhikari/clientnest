import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
  totalClients: number
  activeProjects: number
  openTasks: number
  overdueTasks: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeProjects: 0,
    openTasks: 0,
    overdueTasks: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const [
        { count: totalClients },
        { count: activeProjects },
        { count: openTasks },
        { count: overdueTasks },
      ] = await Promise.all([
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .in('status', ['todo', 'in_progress']),
        supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .lt('due_date', new Date().toISOString())
          .neq('status', 'done'),
      ])

      setStats({
        totalClients: totalClients ?? 0,
        activeProjects: activeProjects ?? 0,
        openTasks: openTasks ?? 0,
        overdueTasks: overdueTasks ?? 0,
      })

      setLoading(false)
    }

    load()
  }, [])

  return { stats, loading }
}