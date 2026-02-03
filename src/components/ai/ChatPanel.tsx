'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/stores/uiStore'
import { useChatStore } from '@/stores/chatStore'
import { ChatHeader } from './ChatHeader'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { checkClientRateLimit, incrementClientCount } from '@/lib/rateLimit'

export function ChatPanel() {
  const { isChatOpen } = useUIStore()
  const { messages, isLoading, articleContext, addMessage, setLoading, incrementQueryCount } =
    useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (content: string) => {
    const { allowed } = checkClientRateLimit()
    if (!allowed) {
      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'You have reached your daily query limit. Please try again tomorrow.',
        timestamp: Date.now(),
      })
      return
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content,
      timestamp: Date.now(),
    }
    addMessage(userMessage)
    setLoading(true)
    incrementClientCount()
    incrementQueryCount()

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          articleContext: articleContext || undefined,
          history: messages.slice(-10),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let assistantContent = ''
      const assistantId = crypto.randomUUID()

      addMessage({
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      })

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.content) {
              assistantContent += data.content
              useChatStore.setState((s) => ({
                messages: s.messages.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m,
                ),
              }))
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch (error) {
      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          error instanceof Error
            ? error.message
            : 'Sorry, something went wrong. Please try again.',
        timestamp: Date.now(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isChatOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => useUIStore.getState().toggleChat()}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-slate-900 z-50 shadow-xl flex flex-col"
          >
            <ChatHeader />
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 dark:text-gray-500 mt-8">
                  <p className="text-lg font-semibold mb-2">Football AI Assistant</p>
                  <p className="text-sm">
                    Ask me anything about football strategy, rules, plays, or history.
                  </p>
                </div>
              )}
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && messages[messages.length - 1]?.content === '' && (
                <div className="flex justify-start mb-3">
                  <div className="bg-gray-100 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm text-gray-400 dark:text-gray-500">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <ChatInput onSend={handleSend} disabled={isLoading} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
