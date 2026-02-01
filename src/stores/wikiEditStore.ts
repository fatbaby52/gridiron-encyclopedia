import { create } from 'zustand'

interface WikiEditState {
  articleSlug: string
  originalContent: string
  draftTitle: string
  draftContent: string
  editSummary: string
  isDirty: boolean
  submitting: boolean
  error: string | null

  initEdit: (slug: string, title: string, content: string) => void
  setDraftTitle: (title: string) => void
  setDraftContent: (content: string) => void
  setEditSummary: (summary: string) => void
  submitEdit: () => Promise<boolean>
  reset: () => void
}

const initialState = {
  articleSlug: '',
  originalContent: '',
  draftTitle: '',
  draftContent: '',
  editSummary: '',
  isDirty: false,
  submitting: false,
  error: null as string | null,
}

export const useWikiEditStore = create<WikiEditState>((set, get) => ({
  ...initialState,

  initEdit: (slug, title, content) => {
    set({
      articleSlug: slug,
      originalContent: content,
      draftTitle: title,
      draftContent: content,
      editSummary: '',
      isDirty: false,
      error: null,
    })
  },

  setDraftTitle: (title) => {
    set({ draftTitle: title, isDirty: true })
  },

  setDraftContent: (content) => {
    set({ draftContent: content, isDirty: true })
  },

  setEditSummary: (summary) => {
    set({ editSummary: summary })
  },

  submitEdit: async () => {
    const { articleSlug, draftTitle, draftContent, editSummary } = get()
    if (!articleSlug || !draftTitle.trim() || !draftContent.trim() || !editSummary.trim()) {
      set({ error: 'Please fill in all fields including edit summary' })
      return false
    }

    set({ submitting: true, error: null })
    try {
      const res = await fetch(`/api/articles/${encodeURIComponent(articleSlug)}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draftTitle.trim(),
          content: draftContent.trim(),
          summary: editSummary.trim(),
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Failed to submit edit' }))
        set({ error: body.error || 'Failed to submit edit', submitting: false })
        return false
      }

      set({ submitting: false, isDirty: false })
      return true
    } catch {
      set({ error: 'Network error. Please try again.', submitting: false })
      return false
    }
  },

  reset: () => set(initialState),
}))
