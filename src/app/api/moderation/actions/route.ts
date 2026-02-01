import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireRole, isAuthError } from '@/lib/authGuard'
import { moderationActionSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const auth = await requireRole('editor')
  if (isAuthError(auth)) return auth.response

  const body = await request.json()
  const parsed = moderationActionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('moderation_actions')
    .insert({
      moderator_id: auth.userId,
      target_user_id: parsed.data.targetUserId,
      action: parsed.data.action,
      reason: parsed.data.reason,
      report_id: parsed.data.reportId,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create moderation action' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
