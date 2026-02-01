import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireAuth, requireRole, isAuthError } from '@/lib/authGuard'
import { createReportSchema, paginationSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  const auth = await requireRole('editor')
  if (isAuthError(auth)) return auth.response

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')

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
    .from('moderation_reports')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }

  const total = count ?? 0
  const reports = (data ?? []).map((row) => ({
    id: row.id,
    reporterId: row.reporter_id,
    targetType: row.target_type,
    targetId: row.target_id,
    reason: row.reason,
    details: row.details,
    status: row.status,
    resolvedBy: row.resolved_by,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
  }))

  return NextResponse.json({
    data: reports,
    total,
    page,
    pageSize,
    hasMore: from + pageSize < total,
  })
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth.response

  const body = await request.json()
  const parsed = createReportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('moderation_reports')
    .insert({
      reporter_id: auth.userId,
      target_type: parsed.data.targetType,
      target_id: parsed.data.targetId,
      reason: parsed.data.reason,
      details: parsed.data.details,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
