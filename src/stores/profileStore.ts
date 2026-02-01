import { create } from 'zustand'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase'
import type { UserProfile } from '@/types/community'

const LS_KEY = 'ge-profile'

interface ProfileState {
  profile: UserProfile | null
  loading: boolean
  initialized: boolean

  initialize: (userId: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  clear: () => void
}

function loadLocalProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as UserProfile) : null
  } catch {
    return null
  }
}

function saveLocalProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(profile))
  } catch {
    // ignore
  }
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,
  initialized: false,

  initialize: async (userId: string) => {
    if (get().initialized) return
    set({ loading: true })

    const sb = isSupabaseConfigured() ? getSupabaseBrowserClient() : null
    if (sb) {
      const { data } = await sb
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          username: data.username,
          displayName: data.display_name,
          avatarUrl: data.avatar_url,
          bio: data.bio,
          role: data.role,
          reputation: data.reputation,
          joinedAt: data.joined_at,
          lastActiveAt: data.last_active_at,
          favoriteTeam: data.favorite_team,
          coachingLevel: data.coaching_level,
        }
        set({ profile, loading: false, initialized: true })
        return
      }
    }

    // Fallback to localStorage
    const local = loadLocalProfile()
    if (local && local.id === userId) {
      set({ profile: local, loading: false, initialized: true })
    } else {
      // Create a minimal local profile
      const newProfile: UserProfile = {
        id: userId,
        username: `user-${userId.slice(0, 8)}`,
        displayName: '',
        avatarUrl: null,
        bio: '',
        role: 'registered',
        reputation: 0,
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        favoriteTeam: null,
        coachingLevel: null,
      }
      saveLocalProfile(newProfile)
      set({ profile: newProfile, loading: false, initialized: true })
    }
  },

  updateProfile: async (updates) => {
    const current = get().profile
    if (!current) return

    const sb = isSupabaseConfigured() ? getSupabaseBrowserClient() : null
    if (sb) {
      const dbUpdates: Record<string, unknown> = { last_active_at: new Date().toISOString() }
      if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio
      if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl
      if (updates.favoriteTeam !== undefined) dbUpdates.favorite_team = updates.favoriteTeam
      if (updates.coachingLevel !== undefined) dbUpdates.coaching_level = updates.coachingLevel

      const { data } = await sb
        .from('profiles')
        .update(dbUpdates)
        .eq('id', current.id)
        .select()
        .single()

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          username: data.username,
          displayName: data.display_name,
          avatarUrl: data.avatar_url,
          bio: data.bio,
          role: data.role,
          reputation: data.reputation,
          joinedAt: data.joined_at,
          lastActiveAt: data.last_active_at,
          favoriteTeam: data.favorite_team,
          coachingLevel: data.coaching_level,
        }
        set({ profile })
        return
      }
    }

    // localStorage fallback
    const updated = { ...current, ...updates, lastActiveAt: new Date().toISOString() }
    saveLocalProfile(updated)
    set({ profile: updated })
  },

  clear: () => {
    set({ profile: null, initialized: false })
  },
}))
