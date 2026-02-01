'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useDiscussionStore } from '@/stores/discussionStore'
import { DiscussionList } from '@/components/community/DiscussionList'
import type { DiscussionCategory } from '@/types/community'

const CATEGORIES: { key: DiscussionCategory; label: string; description: string }[] = [
  {
    key: 'general',
    label: 'General',
    description: 'Open discussion about football topics.',
  },
  {
    key: 'offense',
    label: 'Offense',
    description: 'Offensive schemes, plays, and formations.',
  },
  {
    key: 'defense',
    label: 'Defense',
    description: 'Defensive fronts, coverages, and adjustments.',
  },
  {
    key: 'special-teams',
    label: 'Special Teams',
    description: 'Kicking, punting, returns, and trick plays.',
  },
  {
    key: 'strategy',
    label: 'Strategy',
    description: 'Game planning, clock management, and situational play.',
  },
  {
    key: 'coaching',
    label: 'Coaching',
    description: 'Coaching philosophy, practice planning, and player development.',
  },
  {
    key: 'film-study',
    label: 'Film Study',
    description: 'Breakdowns, analysis, and game film discussion.',
  },
]

export default function ForumPage() {
  const { discussions, loading, loadDiscussions } = useDiscussionStore()

  useEffect(() => {
    loadDiscussions()
  }, [loadDiscussions])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Forum</h1>
        <p className="text-sm text-gray-500">
          Discuss football strategy, share ideas, and connect with the community.
        </p>
      </div>

      {/* Category cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.key}
            href={`/forum/${cat.key}`}
            className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-grass/40 hover:shadow-sm transition-all"
          >
            <h2 className="font-semibold text-gray-900 mb-1">{cat.label}</h2>
            <p className="text-xs text-gray-500 line-clamp-2">
              {cat.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent discussions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Discussions
        </h2>
        <DiscussionList discussions={discussions} loading={loading} />
      </div>
    </div>
  )
}
