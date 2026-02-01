import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireAuth, isAuthError } from '@/lib/authGuard'

export async function POST(
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

  // Verify the comment exists
  const { data: comment } = await supabase
    .from('comments')
    .select('id')
    .eq('id', id)
    .single()

  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  // Check for existing vote
  const { data: existing } = await supabase
    .from('comment_votes')
    .select('id')
    .eq('comment_id', id)
    .eq('user_id', auth.userId)
    .single()

  if (existing) {
    // Remove vote (toggle off)
    const { error: deleteError } = await supabase
      .from('comment_votes')
      .delete()
      .eq('id', existing.id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 })
    }

    await supabase.rpc('decrement_comment_upvotes', { comment_id: id })

    return NextResponse.json({ voted: false })
  }

  // Add vote (toggle on)
  const { error: insertError } = await supabase
    .from('comment_votes')
    .insert({ comment_id: id, user_id: auth.userId })

  if (insertError) {
    return NextResponse.json({ error: 'Failed to add vote' }, { status: 500 })
  }

  await supabase.rpc('increment_comment_upvotes', { comment_id: id })

  return NextResponse.json({ voted: true })
}
