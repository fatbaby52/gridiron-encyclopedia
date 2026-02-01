'use client'

import { useEffect } from 'react'
import { useUserDataStore } from '@/stores/userDataStore'

interface ReadingHistoryTrackerProps {
  slug: string
  title: string
  category: string
}

export function ReadingHistoryTracker({ slug, title, category }: ReadingHistoryTrackerProps) {
  const { initialized, initialize, addToHistory } = useUserDataStore()

  useEffect(() => {
    if (!initialized) {
      initialize()
      return
    }
    addToHistory({ slug, title, category })
  }, [initialized, initialize, slug, title, category, addToHistory])

  return null
}
