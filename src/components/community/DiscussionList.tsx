'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import type { Discussion, DiscussionCategory } from '@/types/community'

interface Props {
  discussions: Discussion[]
  loading: boolean
}

const categoryColors: Record<DiscussionCategory, 'grass' | 'gold' | 'leather' | 'gray'> = {
  general: 'gray',
  offense: 'grass',
  defense: 'leather',
  'special-teams': 'gold',
  strategy: 'grass',
  coaching: 'leather',
  'film-study': 'gold',
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export function DiscussionList({ discussions, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="h-20 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (discussions.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium mb-2">No discussions yet</p>
        <p className="text-sm">Be the first to start a conversation.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {discussions.map((discussion) => (
        <Link
          key={discussion.id}
          href={`/forum/discussion/${discussion.id}`}
          className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-grass/40 hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {discussion.isPinned && (
                  <span className="text-xs font-semibold text-gold uppercase tracking-wide">
                    Pinned
                  </span>
                )}
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {discussion.title}
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <Badge color={categoryColors[discussion.category]}>
                  {discussion.category}
                </Badge>
                <span>by {discussion.authorName}</span>
                <span>{discussion.commentCount} {discussion.commentCount === 1 ? 'comment' : 'comments'}</span>
              </div>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
              {formatTimeAgo(discussion.lastActivityAt)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
