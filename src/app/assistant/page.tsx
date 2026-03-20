export const dynamic = 'force-dynamic'

import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/supabase/auth'
import AssistantClient from '@/components/ai/AssistantClient'
export default async function AssistantPage() {
  await requireAuth()

  return (
    <AppLayout title="AI Assistant">
      <AssistantClient />
    </AppLayout>
  )
}