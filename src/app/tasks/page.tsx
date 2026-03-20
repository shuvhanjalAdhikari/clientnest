export const dynamic = 'force-dynamic'

import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/supabase/auth'
import TasksClient from '@/components/tasks/TasksClient'
export default async function TasksPage() {
  await requireAuth()

  return (
    <AppLayout title="Tasks">
      <TasksClient />
    </AppLayout>
  )
}