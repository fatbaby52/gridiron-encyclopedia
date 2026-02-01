import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireAuth, isAuthError } from '@/lib/authGuard'
import { createPlaybookSchema } from '@/lib/validation'

export async function GET() {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth.response

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('playbooks')
    .select('*')
    .eq('user_id', auth.userId)
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch playbooks' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth.response

  const body = await request.json()
  const parsed = createPlaybookSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('playbooks')
    .insert({
      user_id: auth.userId,
      name: parsed.data.name,
      description: parsed.data.description,
      is_public: parsed.data.isPublic,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create playbook' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
