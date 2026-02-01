'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'

export function AuthInitializer() {
  const authInitialize = useAuthStore((s) => s.initialize)
  const authInitialized = useAuthStore((s) => s.initialized)
  const user = useAuthStore((s) => s.user)
  const profileInitialize = useProfileStore((s) => s.initialize)
  const profileInitialized = useProfileStore((s) => s.initialized)
  const clearProfile = useProfileStore((s) => s.clear)

  useEffect(() => {
    if (!authInitialized) {
      authInitialize()
    }
  }, [authInitialize, authInitialized])

  useEffect(() => {
    if (authInitialized && user && !profileInitialized) {
      profileInitialize(user.id)
    }
    if (authInitialized && !user && profileInitialized) {
      clearProfile()
    }
  }, [authInitialized, user, profileInitialized, profileInitialize, clearProfile])

  return null
}
