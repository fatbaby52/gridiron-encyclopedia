import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import type { UserRole } from '@/types/community'

interface AuthResult {
  userId: string
  role: UserRole
}

interface AuthError {
  response: NextResponse
}

type AuthCheck = AuthResult | AuthError

function isAuthError(result: AuthCheck): result is AuthError {
  return 'response' in result
}

export { isAuthError }

export async function requireAuth(): Promise<AuthCheck> {
  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return {
      response: NextResponse.json(
        { error: 'Authentication service not configured' },
        { status: 503 },
      ),
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role: UserRole = (profile?.role as UserRole) || 'registered'

  return { userId: user.id, role }
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  registered: 0,
  contributor: 1,
  editor: 2,
  admin: 3,
}

export async function requireRole(minimumRole: UserRole): Promise<AuthCheck> {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  if (ROLE_HIERARCHY[auth.role] < ROLE_HIERARCHY[minimumRole]) {
    return {
      response: NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      ),
    }
  }

  return auth
}
