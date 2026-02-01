import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireAuth, isAuthError } from '@/lib/authGuard'
import { paginationSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth.response

  const { searchParams } = request.nextUrl
  const unreadOnly = searchParams.get('unreadOnly') === 'true'

  const pageParsed = paginationSchema.safeParse({
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined,
  })
  const page = pageParsed.success ? pageParsed.data.page : 1
  const pageSize = pageParsed.success ? pageParsed.data.pageSize : 20

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false })

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }

  const total = count ?? 0
  const notifications = (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    linkUrl: row.link_url,
    isRead: row.is_read,
    createdAt: row.created_at,
  }))

  return NextResponse.json({
    data: notifications,
    total,
    page,
    pageSize,
    hasMore: from + pageSize < total,
  })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth.response

  const body = await request.json()
  const ids: string[] = body.ids

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Invalid input: ids must be a non-empty array' }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .in('id', ids)
    .eq('user_id', auth.userId)

  if (error) {
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
