'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import type { ArticleVersion } from '@/types/community'

export default function ReviewQueuePage() {
  const router = useRouter()
  const { user, initialized: authInit } = useAuthStore()
  const { profile } = useProfileStore()
  const [versions, setVersions] = useState<ArticleVersion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authInit && (!user || (profile && profile.role !== 'editor' && profile.role !== 'admin'))) {
      router.push('/')
    }
  }, [authInit, user, profile, router])

  useEffect(() => {
    async function load() {
      try {
        // Fetch all pending versions across all articles
        const res = await fetch('/api/articles/_all/versions?status=pending')
        if (res.ok) {
          const data = await res.json()
          setVersions(data.data ?? [])
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false)
      }
    }
    if (user && profile && (profile.role === 'editor' || profile.role === 'admin')) {
      load()
    }
  }, [user, profile])

  const handleReview = async (versionId: string, articleSlug: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(
        `/api/articles/${encodeURIComponent(articleSlug)}/versions/${versionId}/review`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        },
      )
      if (res.ok) {
        setVersions((prev) => prev.filter((v) => v.id !== versionId))
      }
    } catch {
      // silent fail
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Review Queue</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Review Queue</h1>

      {versions.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">No pending edits to review.</p>
      ) : (
        <div className="space-y-3">
          {versions.map((v) => {
            const date = new Date(v.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <div key={v.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{v.title}</p>
                    <p className="text-xs text-gray-500">
                      {v.articleSlug} &middot; by {v.authorName} &middot; {date}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{v.summary}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleReview(v.id, v.articleSlug, 'approved')}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(v.id, v.articleSlug, 'rejected')}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
