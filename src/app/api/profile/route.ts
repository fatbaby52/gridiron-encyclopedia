import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireAuth, isAuthError } from '@/lib/authGuard'
import { updateProfileSchema } from '@/lib/validation'

export async function GET() {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth.response

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.userId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth.response

  const body = await request.json()
  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const updates: Record<string, unknown> = { last_active_at: new Date().toISOString() }
  const d = parsed.data
  if (d.displayName !== undefined) updates.display_name = d.displayName
  if (d.bio !== undefined) updates.bio = d.bio
  if (d.avatarUrl !== undefined) updates.avatar_url = d.avatarUrl
  if (d.favoriteTeam !== undefined) updates.favorite_team = d.favoriteTeam
  if (d.coachingLevel !== undefined) updates.coaching_level = d.coachingLevel

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', auth.userId)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }

  return NextResponse.json(data)
}
