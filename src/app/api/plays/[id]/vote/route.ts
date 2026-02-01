import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireAuth, isAuthError } from '@/lib/authGuard'
import { voteSchema } from '@/lib/validation'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth.response

  const { id } = await params

  const body = await request.json()
  const parsed = voteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  // Verify the play exists
  const { data: play } = await supabase
    .from('community_plays')
    .select('id')
    .eq('id', id)
    .single()

  if (!play) {
    return NextResponse.json({ error: 'Play not found' }, { status: 404 })
  }

  const voteType = parsed.data.type
  const col = voteType === 'upvote' ? 'upvotes' : 'favorites'

  // Check for existing vote
  const { data: existing } = await supabase
    .from('play_votes')
    .select('id')
    .eq('play_id', id)
    .eq('user_id', auth.userId)
    .eq('type', voteType)
    .single()

  if (existing) {
    // Remove vote (toggle off)
    const { error: deleteError } = await supabase
      .from('play_votes')
      .delete()
      .eq('id', existing.id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 })
    }

    await supabase.rpc('decrement_play_count', { play_id: id, col_name: col })

    return NextResponse.json({ voted: false, type: voteType })
  }

  // Add vote (toggle on)
  const { error: insertError } = await supabase
    .from('play_votes')
    .insert({ play_id: id, user_id: auth.userId, type: voteType })

  if (insertError) {
    return NextResponse.json({ error: 'Failed to add vote' }, { status: 500 })
  }

  await supabase.rpc('increment_play_count', { play_id: id, col_name: col })

  return NextResponse.json({ voted: true, type: voteType })
}
