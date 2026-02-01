'use client'

import { useState } from 'react'

interface Props {
  playId: string
  upvotes: number
  favorites: number
  onVote: (type: 'upvote' | 'favorite') => void
}

export function PlayVoteButtons({ playId, upvotes, favorites, onVote }: Props) {
  const [optimisticUpvoted, setOptimisticUpvoted] = useState(false)
  const [optimisticFavorited, setOptimisticFavorited] = useState(false)

  const handleUpvote = () => {
    setOptimisticUpvoted((prev) => !prev)
    onVote('upvote')
  }

  const handleFavorite = () => {
    setOptimisticFavorited((prev) => !prev)
    onVote('favorite')
  }

  const displayUpvotes = upvotes + (optimisticUpvoted ? 1 : 0)
  const displayFavorites = favorites + (optimisticFavorited ? 1 : 0)

  return (
    <div className="inline-flex items-center gap-2">
      {/* Upvote button */}
      <button
        onClick={handleUpvote}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
          optimisticUpvoted
            ? 'bg-grass/10 border-grass text-grass-dark hover:bg-grass/20'
            : 'bg-white border-gray-200 text-gray-500 hover:border-grass hover:text-grass-dark'
        }`}
        aria-label={optimisticUpvoted ? 'Remove upvote' : 'Upvote'}
        data-play-id={playId}
      >
        <svg
          className="w-4 h-4"
          fill={optimisticUpvoted ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
        <span className="font-medium">{displayUpvotes}</span>
      </button>

      {/* Favorite button */}
      <button
        onClick={handleFavorite}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
          optimisticFavorited
            ? 'bg-gold/10 border-gold text-gold hover:bg-gold/20'
            : 'bg-white border-gray-200 text-gray-500 hover:border-gold hover:text-gold'
        }`}
        aria-label={optimisticFavorited ? 'Remove from favorites' : 'Add to favorites'}
        data-play-id={playId}
      >
        <svg
          className="w-4 h-4"
          fill={optimisticFavorited ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className="font-medium">{displayFavorites}</span>
      </button>
    </div>
  )
}
