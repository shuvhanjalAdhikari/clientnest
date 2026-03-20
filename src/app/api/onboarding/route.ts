import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const adminClient = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { workspaceName, fullName, clientName, clientEmail } = await request.json()

    const slug = workspaceName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const { data: workspace, error: wsError } = await adminClient
      .from('workspaces')
      .insert({ name: workspaceName, slug: `${slug}-${Date.now()}` })
      .select()
      .single()

    if (wsError) throw wsError

    const { error: userError } = await adminClient
      .from('users')
      .insert({
        id: user.id,
        workspace_id: workspace.id,
        full_name: fullName || user.user_metadata?.full_name || '',
        role: 'owner',
      })

    if (userError) throw userError

    if (clientName) {
      await adminClient
        .from('clients')
        .insert({
          workspace_id: workspace.id,
          name: clientName,
          email: clientEmail || null,
          status: 'active',
        })
    }

    return NextResponse.json({ success: true })

  } catch (err: unknown) {
    console.error('Onboarding error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Something went wrong' },
      { status: 500 }
    )
  }
}