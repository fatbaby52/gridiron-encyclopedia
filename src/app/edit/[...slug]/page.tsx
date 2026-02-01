'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useWikiEditStore } from '@/stores/wikiEditStore'
import { ArticleEditor } from '@/components/wiki/ArticleEditor'

export default function EditArticlePage() {
  const params = useParams()
  const router = useRouter()
  const { user, initialized } = useAuthStore()
  const { initEdit } = useWikiEditStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const slugParts = (params.slug as string[]) || []
  const articleSlug = slugParts[slugParts.length - 1] || ''
  const fullPath = slugParts.join('/')

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth/login')
    }
  }, [initialized, user, router])

  useEffect(() => {
    async function loadArticle() {
      try {
        const res = await fetch(`/api/articles/${encodeURIComponent(articleSlug)}/versions?current=true`)
        if (res.ok) {
          const data = await res.json()
          initEdit(articleSlug, data.title, data.content)
        } else {
          setError('Could not load article content for editing.')
        }
      } catch {
        setError('Failed to load article.')
      } finally {
        setLoading(false)
      }
    }

    if (user && articleSlug) {
      loadArticle()
    }
  }, [user, articleSlug, initEdit])

  if (!initialized || !user) {
    return null
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Article</h1>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
        <p className="text-sm text-gray-500 mt-1">
          Editing: <span className="font-mono">{fullPath}</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Your edit will be submitted for review by an editor before it is published.
        </p>
      </div>
      <ArticleEditor />
    </div>
  )
}
