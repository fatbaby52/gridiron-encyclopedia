'use client'

import { useEffect } from 'react'
import { useUserDataStore } from '@/stores/userDataStore'

interface BookmarkButtonProps {
  slug: string
  title: string
  category: string
}

export function BookmarkButton({ slug, title, category }: BookmarkButtonProps) {
  const { initialized, initialize, isFavorite, addFavorite, removeFavorite } = useUserDataStore()

  useEffect(() => {
    if (!initialized) initialize()
  }, [initialized, initialize])

  if (!initialized) return null

  const favorited = isFavorite(slug)

  const handleClick = () => {
    if (favorited) {
      removeFavorite(slug)
    } else {
      addFavorite({ slug, title, category })
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
        favorited
          ? 'bg-gold/10 border-gold text-gold hover:bg-gold/20'
          : 'bg-white border-gray-200 text-gray-500 hover:border-gold hover:text-gold'
      }`}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className="w-4 h-4"
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      {favorited ? 'Saved' : 'Save'}
    </button>
  )
}
