export const dynamic = 'force-dynamic'

import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/supabase/auth'
import SettingsClient from '@/components/settings/SettingsClients'
export default async function SettingsPage() {
  await requireAuth()

  return (
    <AppLayout title="Settings">
      <SettingsClient />
    </AppLayout>
  )
}