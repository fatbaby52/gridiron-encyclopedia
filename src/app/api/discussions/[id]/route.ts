import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireAuth, isAuthError } from '@/lib/authGuard'
import { updateDiscussionSchema } from '@/lib/validation'

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
    .from('discussions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Discussion not found' }, { status: 404 })
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
  const parsed = updateDiscussionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  // Verify ownership or editor role
  const { data: existing } = await supabase
    .from('discussions')
    .select('author_id')
    .eq('id', id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Discussion not found' }, { status: 404 })
  }

  if (existing.author_id !== auth.userId && auth.role !== 'editor' && auth.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const updates: Record<string, unknown> = {}
  if (parsed.data.title !== undefined) updates.title = parsed.data.title
  if (parsed.data.content !== undefined) updates.content = parsed.data.content
  if (parsed.data.isPinned !== undefined) updates.is_pinned = parsed.data.isPinned
  if (parsed.data.isLocked !== undefined) updates.is_locked = parsed.data.isLocked

  const { data, error } = await supabase
    .from('discussions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to update discussion' }, { status: 500 })
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

  // Verify ownership or admin role
  const { data: existing } = await supabase
    .from('discussions')
    .select('author_id')
    .eq('id', id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Discussion not found' }, { status: 404 })
  }

  if (existing.author_id !== auth.userId && auth.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { error } = await supabase
    .from('discussions')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete discussion' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
