import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireRole, isAuthError } from '@/lib/authGuard'
import { resolveReportSchema } from '@/lib/validation'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole('editor')
  if (isAuthError(auth)) return auth.response

  const { id } = await params

  const body = await request.json()
  const parsed = resolveReportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('moderation_reports')
    .update({
      status: parsed.data.status,
      resolved_by: auth.userId,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
  }

  return NextResponse.json(data)
}
