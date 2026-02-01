'use client'

import { useChatStore } from '@/stores/chatStore'
import { useUIStore } from '@/stores/uiStore'

export function ChatHeader() {
  const { queryCount, clearMessages } = useChatStore()
  const { toggleChat } = useUIStore()

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-grass-dark text-white">
      <div>
        <h2 className="font-semibold text-sm">Football AI Assistant</h2>
        <p className="text-xs text-grass-light">{queryCount}/10 queries today</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={clearMessages}
          className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={toggleChat}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Close chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
