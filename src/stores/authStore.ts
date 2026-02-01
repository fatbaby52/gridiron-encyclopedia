import { create } from 'zustand'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  initialize: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithProvider: (provider: 'google' | 'facebook') => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ initialized: true, loading: false })
      return
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()
    set({ user: session?.user ?? null, initialized: true })

    supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      set({ user: session?.user ?? null })
    })
  },

  signInWithEmail: async (email, password) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return { error: 'Authentication is not configured' }

    set({ loading: true })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    set({ loading: false })
    return { error: error?.message ?? null }
  },

  signUpWithEmail: async (email, password) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return { error: 'Authentication is not configured' }

    set({ loading: true })
    const { error } = await supabase.auth.signUp({ email, password })
    set({ loading: false })
    return { error: error?.message ?? null }
  },

  signInWithProvider: async (provider) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return { error: 'Authentication is not configured' }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error: error?.message ?? null }
  },

  signOut: async () => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    await supabase.auth.signOut()
    set({ user: null })
  },
}))
