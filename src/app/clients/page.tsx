export const dynamic = 'force-dynamic'

import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/supabase/auth'
import ClientsClient from '@/components/clients/ClientsClient'
export default async function ClientsPage() {
  await requireAuth()

  return (
    <AppLayout title="Clients">
      <ClientsClient />
    </AppLayout>
  )
}