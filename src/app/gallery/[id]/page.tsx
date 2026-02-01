'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PlayVoteButtons } from '@/components/community/PlayVoteButtons'
import { ForkButton } from '@/components/community/ForkButton'
import type { CommunityPlay } from '@/types/community'

export default function PlayDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [play, setPlay] = useState<CommunityPlay | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlay() {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/plays/${id}`)
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Play not found' : 'Failed to load play')
        }
        const data: CommunityPlay = await res.json()
        setPlay(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPlay()
    }
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded-lg mt-6" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (error || !play) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {error ?? 'Play Not Found'}
        </h1>
        <p className="text-gray-500 mb-6">
          The play you are looking for does not exist or is not publicly available.
        </p>
        <Link
          href="/gallery"
          className="inline-block px-4 py-2 bg-grass text-white text-sm font-medium rounded-lg hover:bg-grass-dark transition-colors"
        >
          Back to Gallery
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/gallery"
        className="inline-flex items-center text-sm text-gray-500 hover:text-grass-dark mb-4 transition-colors"
      >
        &larr; Gallery
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{play.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          by {play.authorName}
        </p>
      </div>

      {/* Play Diagram Placeholder */}
      <div className="mb-6 border-2 border-dashed border-grass rounded-lg bg-grass/5 flex items-center justify-center h-64">
        <span className="text-grass-dark font-medium">Play Diagram</span>
      </div>

      {/* Description */}
      {play.description && (
        <p className="text-gray-700 text-sm leading-relaxed mb-6">
          {play.description}
        </p>
      )}

      {/* Tags */}
      {play.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {play.tags.map((tag) => (
            <span key={tag} className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-gold/20 text-gold">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats & Actions */}
      <div className="flex items-center gap-4 border-t border-gray-200 pt-4">
        <PlayVoteButtons
          playId={play.id}
          upvotes={play.upvotes}
          favorites={play.favorites}
          onVote={async (type) => {
            await fetch(`/api/plays/${play.id}/vote`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type }),
            })
          }}
        />
        <ForkButton
          playId={play.id}
          onFork={async () => {
            const res = await fetch(`/api/plays/${play.id}/fork`, { method: 'POST' })
            if (res.ok) {
              const forked = await res.json()
              window.location.href = `/gallery/${forked.id}`
            }
          }}
        />
      </div>

      {/* Forked-from notice */}
      {play.forkedFromId && (
        <p className="mt-4 text-xs text-gray-400">
          Forked from{' '}
          <Link href={`/gallery/${play.forkedFromId}`} className="underline hover:text-grass-dark">
            another play
          </Link>
        </p>
      )}
    </div>
  )
}
