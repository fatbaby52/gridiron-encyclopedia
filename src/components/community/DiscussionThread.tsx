'use client'

import { Badge } from '@/components/ui/Badge'
import { CommentItem } from '@/components/community/CommentItem'
import type { Discussion, Comment } from '@/types/community'

interface Props {
  discussion: Discussion
  comments: Comment[]
  onReply: (parentId: string) => void
  onVote: (commentId: string) => void
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function DiscussionThread({ discussion, comments, onReply, onVote }: Props) {
  return (
    <div>
      {/* Discussion header & body */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Badge color="grass">{discussion.category}</Badge>
          {discussion.isPinned && (
            <Badge color="gold">Pinned</Badge>
          )}
          {discussion.isLocked && (
            <Badge color="leather">Locked</Badge>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {discussion.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-grass text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              {discussion.authorName.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-gray-700">
              {discussion.authorName}
            </span>
          </div>
          <span>{formatDate(discussion.createdAt)}</span>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
          {discussion.content}
        </div>

        {discussion.articleSlug && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <a
              href={`/${discussion.articleSlug}`}
              className="text-sm text-grass hover:text-grass-dark transition-colors"
            >
              Related article: {discussion.articleSlug}
            </a>
          </div>
        )}
      </div>

      {/* Comments section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h2>

        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">
            No comments yet. Be the first to share your thoughts.
          </p>
        ) : (
          <div className="space-y-1">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={onReply}
                onVote={onVote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
