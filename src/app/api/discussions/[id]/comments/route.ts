import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireAuth, isAuthError } from '@/lib/authGuard'
import { createCommentSchema, paginationSchema } from '@/lib/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)

  const paginationParsed = paginationSchema.safeParse({
    page: searchParams.get('page'),
    pageSize: searchParams.get('pageSize'),
  })
  const page = paginationParsed.success ? paginationParsed.data.page : 1
  const pageSize = paginationParsed.success ? paginationParsed.data.pageSize : 50

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact' })
    .eq('discussion_id', id)
    .order('created_at', { ascending: true })
    .range(from, to)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    hasMore: (count ?? 0) > page * pageSize,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth.response

  const { id: discussionId } = await params

  const body = await request.json()
  const parsed = createCommentSchema.safeParse(body)
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

  // Verify discussion exists and is not locked
  const { data: discussion } = await supabase
    .from('discussions')
    .select('id, is_locked')
    .eq('id', discussionId)
    .single()

  if (!discussion) {
    return NextResponse.json({ error: 'Discussion not found' }, { status: 404 })
  }

  if (discussion.is_locked) {
    return NextResponse.json({ error: 'Discussion is locked' }, { status: 403 })
  }

  // Calculate depth from parent comment
  let depth = 0
  if (parsed.data.parentId) {
    const { data: parent } = await supabase
      .from('comments')
      .select('depth')
      .eq('id', parsed.data.parentId)
      .eq('discussion_id', discussionId)
      .single()

    if (!parent) {
      return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
    }

    depth = Math.min(parent.depth + 1, 3)
  }

  // Get author name from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', auth.userId)
    .single()

  const authorName = profile?.display_name || profile?.username || 'Unknown'

  const { data, error } = await supabase
    .from('comments')
    .insert({
      discussion_id: discussionId,
      author_id: auth.userId,
      author_name: authorName,
      content: parsed.data.content,
      parent_id: parsed.data.parentId,
      depth,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }

  // Increment discussion comment_count via rpc
  await supabase.rpc('increment_discussion_comment_count', {
    discussion_id: discussionId,
  })

  return NextResponse.json(data, { status: 201 })
}
