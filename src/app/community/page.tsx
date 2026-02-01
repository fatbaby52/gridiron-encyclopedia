'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CommunityNav } from '@/components/community/CommunityNav'
import { useAuthStore } from '@/stores/authStore'
import type { Discussion, CommunityPlay } from '@/types/community'

interface TopContributor {
  id: string
  displayName: string
  reputation: number
  avatarUrl: string | null
}

export default function CommunityPage() {
  const { user } = useAuthStore()
  const [recentDiscussions, setRecentDiscussions] = useState<Discussion[]>([])
  const [popularPlays, setPopularPlays] = useState<CommunityPlay[]>([])
  const [topContributors, setTopContributors] = useState<TopContributor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCommunityData() {
      setLoading(true)
      try {
        const [discussionRes, playsRes] = await Promise.allSettled([
          fetch('/api/discussions?page=1&limit=3&sort=recent'),
          fetch('/api/plays?page=1&sort=popular'),
        ])

        if (discussionRes.status === 'fulfilled' && discussionRes.value.ok) {
          const data = await discussionRes.value.json()
          setRecentDiscussions((data.data ?? []).slice(0, 3))
        }

        if (playsRes.status === 'fulfilled' && playsRes.value.ok) {
          const data = await playsRes.value.json()
          setPopularPlays((data.data ?? []).slice(0, 3))
        }

        // Top contributors would come from a dedicated endpoint in a full implementation
        setTopContributors([])
      } catch {
        // Silently handle errors; sections remain empty
      } finally {
        setLoading(false)
      }
    }

    fetchCommunityData()
  }, [])

  return (
    <>
      <CommunityNav />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Community</h1>
          <p className="text-gray-500">
            Discuss strategy, share plays, and connect with football enthusiasts.
          </p>
        </div>

        {/* CTA for non-authed users */}
        {!user && (
          <div className="mb-10 rounded-xl border border-grass/20 bg-grass/5 p-6 text-center">
            <h2 className="text-lg font-semibold text-grass-dark mb-1">
              Join the community
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Create an account to participate in discussions, share your plays, and build your
              coaching reputation.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-grass text-white hover:bg-grass-dark transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Discussions */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Discussions</h2>
              <Link
                href="/community/forum"
                className="text-sm font-medium text-grass hover:text-grass-dark transition-colors"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentDiscussions.length > 0 ? (
              <div className="space-y-3">
                {recentDiscussions.map((discussion) => (
                  <Link
                    key={discussion.id}
                    href={`/community/forum/${discussion.id}`}
                    className="block p-4 rounded-lg border border-gray-200 hover:border-grass/30 hover:bg-grass/5 transition-colors"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                      {discussion.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{discussion.authorName}</span>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {discussion.category}
                      </span>
                      <span>
                        {discussion.commentCount}{' '}
                        {discussion.commentCount === 1 ? 'reply' : 'replies'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-sm text-gray-500 bg-gray-50 rounded-lg">
                <p className="font-medium mb-1">No discussions yet</p>
                <p>Be the first to start a conversation.</p>
              </div>
            )}
          </section>

          {/* Top Contributors Sidebar */}
          <aside>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h2>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : topContributors.length > 0 ? (
              <ul className="space-y-3">
                {topContributors.map((contributor, index) => (
                  <li key={contributor.id}>
                    <Link
                      href={`/profile/${contributor.displayName}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-grass/30 hover:bg-grass/5 transition-colors"
                    >
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-grass/10 text-grass-dark flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {contributor.displayName}
                        </p>
                        <p className="text-xs text-gray-500">{contributor.reputation} rep</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-sm text-gray-500 bg-gray-50 rounded-lg">
                <p>Contributors will appear here as the community grows.</p>
              </div>
            )}
          </aside>
        </div>

        {/* Popular Plays Section */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Popular Plays</h2>
            <Link
              href="/gallery"
              className="text-sm font-medium text-grass hover:text-grass-dark transition-colors"
            >
              Browse gallery
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : popularPlays.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {popularPlays.map((play) => (
                <Link
                  key={play.id}
                  href={`/gallery/${play.id}`}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-grass/30 hover:bg-grass/5 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                    {play.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{play.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{play.authorName}</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {play.upvotes}
                    </span>
                    {play.tags.length > 0 && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {play.tags[0]}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-sm text-gray-500 bg-gray-50 rounded-lg">
              <p className="font-medium mb-1">No plays shared yet</p>
              <p>
                Open the{' '}
                <Link href="/designer" className="text-grass hover:text-grass-dark underline">
                  Play Designer
                </Link>{' '}
                to create and share your first play.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
