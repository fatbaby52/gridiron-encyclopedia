import { create } from 'zustand'
import type { ChatMessage } from '@/types'

interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  articleContext: string | null
  queryCount: number
  addMessage: (message: ChatMessage) => void
  setLoading: (loading: boolean) => void
  setArticleContext: (context: string | null) => void
  clearMessages: () => void
  incrementQueryCount: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  articleContext: null,
  queryCount: 0,
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setLoading: (isLoading) => set({ isLoading }),
  setArticleContext: (articleContext) => set({ articleContext }),
  clearMessages: () => set({ messages: [] }),
  incrementQueryCount: () => set((s) => ({ queryCount: s.queryCount + 1 })),
}))
