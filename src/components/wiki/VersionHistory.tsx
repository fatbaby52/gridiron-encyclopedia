'use client'

import { useEffect, useState } from 'react'
import type { ArticleVersion } from '@/types/community'

interface Props {
  articleSlug: string
}

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
}

export function VersionHistory({ articleSlug }: Props) {
  const [versions, setVersions] = useState<ArticleVersion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/articles/${encodeURIComponent(articleSlug)}/versions`)
        if (res.ok) {
          const data = await res.json()
          setVersions(data.data ?? [])
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [articleSlug])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (versions.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-8 text-center">No edit history for this article yet.</p>
    )
  }

  return (
    <div className="space-y-2">
      {versions.map((v) => {
        const style = STATUS_STYLES[v.status] ?? STATUS_STYLES.pending
        const date = new Date(v.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })

        return (
          <div key={v.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.color}`}>
                  {style.label}
                </span>
                <span className="text-xs text-gray-500">{date}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mt-1 truncate">{v.summary}</p>
              <p className="text-xs text-gray-500">by {v.authorName}</p>
              {v.reviewNote && (
                <p className="text-xs text-gray-600 mt-1 italic">Review: {v.reviewNote}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
