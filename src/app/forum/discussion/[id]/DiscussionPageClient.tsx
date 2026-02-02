'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { useDiscussionStore } from '@/stores/discussionStore'
import { DiscussionThread } from '@/components/community/DiscussionThread'
import { CommentEditor } from '@/components/community/CommentEditor'

export function DiscussionPageClient() {
  const params = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const {
    currentDiscussion,
    comments,
    loading,
    loadDiscussion,
    loadComments,
    createComment,
    voteOnComment,
  } = useDiscussionStore()

  const [replyTo, setReplyTo] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      loadDiscussion(params.id)
      loadComments(params.id)
    }
  }, [params.id, loadDiscussion, loadComments])

  const handleReply = useCallback((parentId: string) => {
    setReplyTo(parentId)
  }, [])

  const handleVote = useCallback(
    (commentId: string) => {
      voteOnComment(commentId)
    },
    [voteOnComment],
  )

  const handleSubmitComment = useCallback(
    async (content: string) => {
      if (!params.id) return
      await createComment(params.id, content, replyTo)
      setReplyTo(null)
    },
    [params.id, replyTo, createComment],
  )

  const handleCancelReply = useCallback(() => {
    setReplyTo(null)
  }, [])

  if (loading && !currentDiscussion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-40 bg-gray-200 rounded-lg" />
          <div className="h-20 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!currentDiscussion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-lg font-medium text-gray-900 mb-2">
          Discussion not found
        </p>
        <Link
          href="/forum"
          className="text-sm text-grass hover:text-grass-dark transition-colors"
        >
          Back to Forum
        </Link>
      </div>
    )
  }

  const replyingToComment = replyTo
    ? comments.find((c) => c.id === replyTo)
    : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/forum" className="hover:text-grass transition-colors">
          Forum
        </Link>
        <span>/</span>
        <Link
          href={`/forum/${currentDiscussion.category}`}
          className="hover:text-grass transition-colors"
        >
          {currentDiscussion.category.charAt(0).toUpperCase() +
            currentDiscussion.category.slice(1).replace(/-/g, ' ')}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium line-clamp-1">
          {currentDiscussion.title}
        </span>
      </div>

      <DiscussionThread
        discussion={currentDiscussion}
        comments={comments}
        onReply={handleReply}
        onVote={handleVote}
      />

      {/* Comment editor */}
      {!currentDiscussion.isLocked && user ? (
        <div className="mt-6">
          {replyTo && replyingToComment && (
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
              <span>
                Replying to{' '}
                <span className="font-medium">
                  {replyingToComment.authorName}
                </span>
              </span>
              <button
                onClick={handleCancelReply}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
          <CommentEditor
            onSubmit={handleSubmitComment}
            placeholder={
              replyTo ? 'Write a reply...' : 'Add a comment...'
            }
            parentId={replyTo}
          />
        </div>
      ) : currentDiscussion.isLocked ? (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-sm text-gray-500">
            This discussion is locked. No new comments can be added.
          </p>
        </div>
      ) : (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-sm text-gray-500">
            <Link
              href="/auth/login"
              className="text-grass hover:text-grass-dark transition-colors font-medium"
            >
              Sign in
            </Link>{' '}
            to join the discussion.
          </p>
        </div>
      )}
    </div>
  )
}
