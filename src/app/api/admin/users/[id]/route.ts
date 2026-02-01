import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireRole, isAuthError } from '@/lib/authGuard'
import { updateUserRoleSchema } from '@/lib/validation'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole('admin')
  if (isAuthError(auth)) return auth.response

  const { id } = await params

  const body = await request.json()
  const parsed = updateUserRoleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: parsed.data.role })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
  }

  return NextResponse.json({
    id: data.id,
    username: data.username,
    displayName: data.display_name,
    role: data.role,
    reputation: data.reputation,
  })
}
