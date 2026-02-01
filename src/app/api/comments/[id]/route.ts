import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireAuth, isAuthError } from '@/lib/authGuard'
import { updateCommentSchema } from '@/lib/validation'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth.response

  const { id } = await params

  const body = await request.json()
  const parsed = updateCommentSchema.safeParse(body)
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

  // Verify ownership
  const { data: existing } = await supabase
    .from('comments')
    .select('author_id')
    .eq('id', id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  if (existing.author_id !== auth.userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('comments')
    .update({
      content: parsed.data.content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('author_id', auth.userId)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
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

  // Verify ownership or editor/admin role
  const { data: existing } = await supabase
    .from('comments')
    .select('author_id, discussion_id')
    .eq('id', id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  if (
    existing.author_id !== auth.userId &&
    auth.role !== 'editor' &&
    auth.role !== 'admin'
  ) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }

  // Decrement discussion comment_count
  await supabase.rpc('decrement_discussion_comment_count', {
    discussion_id: existing.discussion_id,
  })

  return NextResponse.json({ success: true })
}
