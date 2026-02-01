import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireAuth, isAuthError } from '@/lib/authGuard'
import { createDiscussionSchema, paginationSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || undefined
  const articleSlug = searchParams.get('articleSlug') || undefined

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

  let query = supabase
    .from('discussions')
    .select('*', { count: 'exact' })

  if (category) {
    query = query.eq('category', category)
  }

  if (articleSlug) {
    query = query.eq('article_slug', articleSlug)
  }

  query = query
    .order('is_pinned', { ascending: false })
    .order('last_activity_at', { ascending: false })

  const { data, count, error } = await query.range(from, to)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 })
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
  const parsed = createDiscussionSchema.safeParse(body)
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

  // Get author name from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', auth.userId)
    .single()

  const authorName = profile?.display_name || profile?.username || 'Unknown'

  const { data, error } = await supabase
    .from('discussions')
    .insert({
      author_id: auth.userId,
      author_name: authorName,
      title: parsed.data.title,
      content: parsed.data.content,
      category: parsed.data.category,
      article_slug: parsed.data.articleSlug,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create discussion' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
