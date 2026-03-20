export const dynamic = 'force-dynamic'

import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/supabase/auth'
import ProjectsClient from '@/components/projects/ProjectsClient'
export default async function ProjectsPage() {
  await requireAuth()

  return (
    <AppLayout title="Projects">
      <ProjectsClient />
    </AppLayout>
  )
}