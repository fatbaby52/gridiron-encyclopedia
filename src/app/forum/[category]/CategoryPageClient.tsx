'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { useDiscussionStore } from '@/stores/discussionStore'
import { DiscussionList } from '@/components/community/DiscussionList'
import { NewDiscussionForm } from '@/components/community/NewDiscussionForm'
import type { DiscussionCategory } from '@/types/community'

const VALID_CATEGORIES: DiscussionCategory[] = [
  'general',
  'offense',
  'defense',
  'special-teams',
  'strategy',
  'coaching',
  'film-study',
]

const CATEGORY_LABELS: Record<DiscussionCategory, string> = {
  general: 'General',
  offense: 'Offense',
  defense: 'Defense',
  'special-teams': 'Special Teams',
  strategy: 'Strategy',
  coaching: 'Coaching',
  'film-study': 'Film Study',
}

export function CategoryPageClient() {
  const params = useParams<{ category: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const { discussions, loading, loadDiscussions, createDiscussion } = useDiscussionStore()

  const [showForm, setShowForm] = useState(false)

  const category = params.category as DiscussionCategory

  useEffect(() => {
    if (!VALID_CATEGORIES.includes(category)) {
      router.push('/forum')
      return
    }
    loadDiscussions(category)
  }, [category, loadDiscussions, router])

  if (!VALID_CATEGORIES.includes(category)) {
    return null
  }

  const handleCreate = async (data: {
    title: string
    content: string
    category: string
    articleSlug: string | null
  }) => {
    const result = await createDiscussion(data)
    if (result) {
      setShowForm(false)
      loadDiscussions(category)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/forum" className="hover:text-grass transition-colors">
          Forum
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">
          {CATEGORY_LABELS[category]}
        </span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {CATEGORY_LABELS[category]}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse and discuss {CATEGORY_LABELS[category].toLowerCase()} topics.
          </p>
        </div>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-grass text-white text-sm font-medium rounded-lg hover:bg-grass-dark transition-colors"
          >
            {showForm ? 'Cancel' : 'New Discussion'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <NewDiscussionForm
            categories={VALID_CATEGORIES}
            onSubmit={handleCreate}
          />
        </div>
      )}

      <DiscussionList discussions={discussions} loading={loading} />
    </div>
  )
}
