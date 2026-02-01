'use client'

import { useState, useCallback } from 'react'

interface Props {
  onSubmit: (content: string) => void
  placeholder?: string
  parentId?: string | null
}

export function CommentEditor({
  onSubmit,
  placeholder = 'Write a comment...',
  parentId = null,
}: Props) {
  const storageKey = `ge-comment-draft-${parentId || 'root'}`

  const [content, setContent] = useState(() => {
    try {
      return localStorage.getItem(storageKey) || ''
    } catch {
      return ''
    }
  })
  const [submitting, setSubmitting] = useState(false)

  // Auto-save draft to localStorage
  const saveDraft = useCallback(
    (value: string) => {
      try {
        if (value.trim()) {
          localStorage.setItem(storageKey, value)
        } else {
          localStorage.removeItem(storageKey)
        }
      } catch {
        // localStorage may not be available
      }
    },
    [storageKey],
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setContent(value)
    saveDraft(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || submitting) return

    setSubmitting(true)
    onSubmit(content.trim())
    setContent('')
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // localStorage may not be available
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={handleChange}
        placeholder={placeholder}
        rows={4}
        maxLength={10000}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grass/50 focus:border-grass resize-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {content.length}/10000
        </span>
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="px-4 py-2 bg-grass text-white text-sm font-medium rounded-lg hover:bg-grass-dark transition-colors disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  )
}
