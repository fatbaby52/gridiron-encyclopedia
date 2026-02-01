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

  // Fetch the source play
  const { data: source } = await supabase
    .from('community_plays')
    .select('*')
    .eq('id', id)
    .single()

  if (!source) {
    return NextResponse.json({ error: 'Play not found' }, { status: 404 })
  }

  // Source must be public or owned by the user
  if (!source.is_public && source.user_id !== auth.userId) {
    return NextResponse.json({ error: 'Play not found' }, { status: 404 })
  }

  // Get author name from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', auth.userId)
    .single()

  const authorName = profile?.display_name || profile?.username || 'Unknown'

  // Create the forked play
  const { data: forked, error } = await supabase
    .from('community_plays')
    .insert({
      user_id: auth.userId,
      author_name: authorName,
      title: `${source.title} (Fork)`,
      description: source.description,
      diagram_data: source.diagram_data,
      playbook_id: null,
      is_public: false,
      tags: source.tags ?? [],
      forked_from_id: id,
    })
    .select()
    .single()

  if (error || !forked) {
    return NextResponse.json({ error: 'Failed to fork play' }, { status: 500 })
  }

  // Increment fork_count on the source play
  await supabase.rpc('increment_play_count', { play_id: id, col_name: 'fork_count' })

  return NextResponse.json(forked, { status: 201 })
}
