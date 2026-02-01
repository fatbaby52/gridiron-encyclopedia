'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useUserDataStore } from '@/stores/userDataStore'

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

export function ReadingHistoryList() {
  const { history, initialized, initialize, clearHistory } = useUserDataStore()

  useEffect(() => {
    if (!initialized) initialize()
  }, [initialized, initialize])

  if (!initialized) {
    return <div className="text-gray-400 text-sm">Loading...</div>
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 mb-2">No reading history</p>
        <p className="text-sm text-gray-400">
          Articles you visit will appear here.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={clearHistory}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          Clear history
        </button>
      </div>
      <div className="space-y-2">
        {history.map((item) => (
          <Link
            key={`${item.slug}-${item.visitedAt}`}
            href={`/${item.slug}`}
            className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="min-w-0">
              <div className="font-medium text-gray-900">{item.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{item.category}</div>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatDate(item.visitedAt)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
