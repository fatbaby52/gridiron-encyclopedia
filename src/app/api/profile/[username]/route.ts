import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, role, reputation, joined_at, favorite_team, coaching_level')
    .eq('username', username)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: data.id,
    username: data.username,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    role: data.role,
    reputation: data.reputation,
    joinedAt: data.joined_at,
    favoriteTeam: data.favorite_team,
    coachingLevel: data.coaching_level,
  })
}
