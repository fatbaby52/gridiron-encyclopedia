'use client'

import type { Comment } from '@/types/community'

interface Props {
  comment: Comment
  onReply: (parentId: string) => void
  onVote: (commentId: string) => void
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

export function CommentItem({ comment, onReply, onVote }: Props) {
  const indent = Math.min(comment.depth, 3) * 24

  return (
    <div style={{ marginLeft: `${indent}px` }} className="py-3">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-grass text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {comment.authorName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-900">
            {comment.authorName}
          </span>
          <span className="text-xs text-gray-400">
            {formatTimeAgo(comment.createdAt)}
          </span>
        </div>

        <div className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
          {comment.content}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onVote(comment.id)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-grass transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                clipRule="evenodd"
              />
            </svg>
            <span>{comment.upvotes}</span>
          </button>

          {comment.depth < 3 && (
            <button
              onClick={() => onReply(comment.id)}
              className="text-xs text-gray-500 hover:text-grass transition-colors"
            >
              Reply
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
