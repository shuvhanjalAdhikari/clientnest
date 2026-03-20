export const dynamic = 'force-dynamic'

import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/supabase/auth'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  await requireAuth()

  return (
    <AppLayout title="Dashboard">
      <DashboardClient />
    </AppLayout>
  )
}