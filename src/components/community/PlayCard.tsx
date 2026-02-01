'use client'

import Link from 'next/link'
import type { CommunityPlay } from '@/types/community'
import { Badge } from '@/components/ui/Badge'

interface Props {
  play: CommunityPlay
  compact?: boolean
}

export function PlayCard({ play, compact = false }: Props) {
  if (compact) {
    return (
      <Link
        href={`/gallery/${play.id}`}
        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-grass/50 hover:shadow-md transition-all"
      >
        {/* Diagram thumbnail placeholder */}
        <div className="w-16 h-12 rounded bg-grass/20 border border-grass/30 flex-shrink-0 flex items-center justify-center">
          <svg className="w-6 h-6 text-grass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{play.title}</h3>
          <p className="text-xs text-gray-500 truncate">by {play.authorName}</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
          <span className="inline-flex items-center gap-0.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            {play.upvotes}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {play.favorites}
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/gallery/${play.id}`}
      className="block rounded-lg border border-gray-200 hover:border-grass/50 hover:shadow-md transition-all overflow-hidden"
    >
      {/* Diagram thumbnail placeholder */}
      <div className="w-full h-40 bg-grass/20 border-b border-grass/30 flex items-center justify-center">
        <svg className="w-12 h-12 text-grass/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{play.title}</h3>
        <p className="text-sm text-gray-500 mb-3">by {play.authorName}</p>

        <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
          <span className="inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            {play.upvotes}
          </span>
          <span className="inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {play.favorites}
          </span>
        </div>

        {play.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {play.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} color="grass">
                {tag}
              </Badge>
            ))}
            {play.tags.length > 4 && (
              <Badge color="gray">+{play.tags.length - 4}</Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
