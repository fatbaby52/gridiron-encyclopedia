import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireAuth, isAuthError } from '@/lib/authGuard'
import { createPlaySchema, paginationSchema } from '@/lib/validation'

const MAX_PLAYS = 50

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const isPublic = searchParams.get('public') === 'true'
  const sort = searchParams.get('sort') || 'recent'
  const tag = searchParams.get('tag') || undefined

  const paginationParsed = paginationSchema.safeParse({
    page: searchParams.get('page'),
    pageSize: searchParams.get('pageSize'),
  })
  const page = paginationParsed.success ? paginationParsed.data.page : 1
  const pageSize = paginationParsed.success ? paginationParsed.data.pageSize : 20

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  if (isPublic) {
    let query = supabase
      .from('community_plays')
      .select('*', { count: 'exact' })
      .eq('is_public', true)

    if (tag) {
      query = query.contains('tags', [tag])
    }

    if (sort === 'popular') {
      query = query.order('upvotes', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, count, error } = await query.range(from, to)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch plays' }, { status: 500 })
    }

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
      hasMore: (count ?? 0) > page * pageSize,
    })
  }

  // Private: requires auth, returns user's own plays
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth.response

  let query = supabase
    .from('community_plays')
    .select('*', { count: 'exact' })
    .eq('user_id', auth.userId)

  if (tag) {
    query = query.contains('tags', [tag])
  }

  if (sort === 'popular') {
    query = query.order('upvotes', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, count, error } = await query.range(from, to)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch plays' }, { status: 500 })
  }

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    hasMore: (count ?? 0) > page * pageSize,
  })
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth.response

  const body = await request.json()
  const parsed = createPlaySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  // Enforce 50 play limit per user
  const { count } = await supabase
    .from('community_plays')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', auth.userId)

  if ((count ?? 0) >= MAX_PLAYS) {
    return NextResponse.json(
      { error: `Play limit reached. You can have a maximum of ${MAX_PLAYS} plays.` },
      { status: 403 },
    )
  }

  // Get author name from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', auth.userId)
    .single()

  const authorName = profile?.display_name || profile?.username || 'Unknown'

  const { data, error } = await supabase
    .from('community_plays')
    .insert({
      user_id: auth.userId,
      author_name: authorName,
      title: parsed.data.title,
      description: parsed.data.description,
      diagram_data: parsed.data.diagramData,
      playbook_id: parsed.data.playbookId,
      is_public: parsed.data.isPublic,
      tags: parsed.data.tags,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create play' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
