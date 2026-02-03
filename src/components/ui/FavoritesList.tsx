'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useUserDataStore } from '@/stores/userDataStore'

export function FavoritesList() {
  const { favorites, initialized, initialize, removeFavorite } = useUserDataStore()

  useEffect(() => {
    if (!initialized) initialize()
  }, [initialized, initialize])

  if (!initialized) {
    return <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 mb-2">No favorites yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Click the &quot;Save&quot; button on any article to add it here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {favorites.map((item) => (
        <div
          key={item.slug}
          className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
        >
          <Link href={`/${item.slug}`} className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-gray-100 hover:text-grass-dark transition-colors">
              {item.title}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.category}</div>
          </Link>
          <button
            onClick={() => removeFavorite(item.slug)}
            className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
            aria-label="Remove from favorites"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
