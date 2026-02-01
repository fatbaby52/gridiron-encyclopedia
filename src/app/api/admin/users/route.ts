import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireRole, isAuthError } from '@/lib/authGuard'
import { paginationSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  const auth = await requireRole('admin')
  if (isAuthError(auth)) return auth.response

  const { searchParams } = request.nextUrl

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

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('joined_at', { ascending: false })
    .range(from, to)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  const total = count ?? 0
  const users = (data ?? []).map((row) => ({
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    reputation: row.reputation,
  }))

  return NextResponse.json({
    data: users,
    total,
    page,
    pageSize,
    hasMore: from + pageSize < total,
  })
}
