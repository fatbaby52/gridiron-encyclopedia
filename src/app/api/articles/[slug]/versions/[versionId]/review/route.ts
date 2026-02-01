import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireRole, isAuthError } from '@/lib/authGuard'
import { reviewEditSchema } from '@/lib/validation'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; versionId: string }> },
) {
  const auth = await requireRole('editor')
  if (isAuthError(auth)) return auth.response

  const { versionId } = await params
  const body = await request.json()
  const parsed = reviewEditSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('article_versions')
    .update({
      status: parsed.data.status,
      reviewed_by: auth.userId,
      review_note: parsed.data.reviewNote ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', versionId)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to review edit' }, { status: 500 })
  }

  return NextResponse.json({
    id: data.id,
    status: data.status,
    reviewedBy: data.reviewed_by,
    reviewNote: data.review_note,
    reviewedAt: data.reviewed_at,
  })
}
