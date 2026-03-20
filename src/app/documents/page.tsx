export const dynamic = 'force-dynamic'

import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/supabase/auth'
import DocumentsClient from '@/components/documents/DocumentsClient'
export default async function DocumentsPage() {
  await requireAuth()

  return (
    <AppLayout title="Documents">
      <DocumentsClient />
    </AppLayout>
  )
}