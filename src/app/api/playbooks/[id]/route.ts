import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireAuth, isAuthError } from '@/lib/authGuard'
import { updatePlaybookSchema } from '@/lib/validation'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('playbooks')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Playbook not found' }, { status: 404 })
  }

  // Check access: must be owner or public
  if (!data.is_public) {
    const auth = await requireAuth()
    if (isAuthError(auth)) return auth.response
    if (data.user_id !== auth.userId) {
      return NextResponse.json({ error: 'Playbook not found' }, { status: 404 })
    }
  }

  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth.response

  const { id } = await params

  const body = await request.json()
  const parsed = updatePlaybookSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('playbooks')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Playbook not found' }, { status: 404 })
  }

  if (existing.user_id !== auth.userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (parsed.data.name !== undefined) updates.name = parsed.data.name
  if (parsed.data.description !== undefined) updates.description = parsed.data.description
  if (parsed.data.isPublic !== undefined) updates.is_public = parsed.data.isPublic

  const { data, error } = await supabase
    .from('playbooks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', auth.userId)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to update playbook' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth.response

  const { id } = await params

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('playbooks')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Playbook not found' }, { status: 404 })
  }

  if (existing.user_id !== auth.userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { error } = await supabase
    .from('playbooks')
    .delete()
    .eq('id', id)
    .eq('user_id', auth.userId)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete playbook' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
