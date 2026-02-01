import { create } from 'zustand'
import type { Discussion, Comment } from '@/types/community'

interface DiscussionState {
  discussions: Discussion[]
  currentDiscussion: Discussion | null
  comments: Comment[]
  loading: boolean

  loadDiscussions: (category?: string, articleSlug?: string) => Promise<void>
  loadDiscussion: (id: string) => Promise<void>
  loadComments: (discussionId: string) => Promise<void>
  createDiscussion: (data: {
    title: string
    content: string
    category: string
    articleSlug: string | null
  }) => Promise<Discussion | null>
  createComment: (
    discussionId: string,
    content: string,
    parentId?: string | null,
  ) => Promise<Comment | null>
  voteOnComment: (commentId: string) => Promise<boolean>
}

export const useDiscussionStore = create<DiscussionState>((set) => ({
  discussions: [],
  currentDiscussion: null,
  comments: [],
  loading: false,

  loadDiscussions: async (category?, articleSlug?) => {
    set({ loading: true })
    try {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (articleSlug) params.set('articleSlug', articleSlug)

      const res = await fetch(`/api/discussions?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch discussions')

      const json = await res.json()
      set({ discussions: json.data ?? [] })
    } catch {
      set({ discussions: [] })
    } finally {
      set({ loading: false })
    }
  },

  loadDiscussion: async (id) => {
    set({ loading: true })
    try {
      const res = await fetch(`/api/discussions/${id}`)
      if (!res.ok) throw new Error('Failed to fetch discussion')

      const data = await res.json()
      set({ currentDiscussion: data })
    } catch {
      set({ currentDiscussion: null })
    } finally {
      set({ loading: false })
    }
  },

  loadComments: async (discussionId) => {
    try {
      const res = await fetch(`/api/discussions/${discussionId}/comments`)
      if (!res.ok) throw new Error('Failed to fetch comments')

      const json = await res.json()
      set({ comments: json.data ?? [] })
    } catch {
      set({ comments: [] })
    }
  },

  createDiscussion: async (data) => {
    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create discussion')

      const discussion = await res.json()
      set((s) => ({ discussions: [discussion, ...s.discussions] }))
      return discussion
    } catch {
      return null
    }
  },

  createComment: async (discussionId, content, parentId = null) => {
    try {
      const res = await fetch(`/api/discussions/${discussionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId }),
      })
      if (!res.ok) throw new Error('Failed to create comment')

      const comment = await res.json()
      set((s) => ({ comments: [...s.comments, comment] }))
      return comment
    } catch {
      return null
    }
  },

  voteOnComment: async (commentId) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to vote')

      const result = await res.json()

      set((s) => ({
        comments: s.comments.map((c) =>
          c.id === commentId
            ? { ...c, upvotes: c.upvotes + (result.voted ? 1 : -1) }
            : c,
        ),
      }))

      return result.voted
    } catch {
      return false
    }
  },
}))
