'use client'

import { useEffect, useState, useCallback } from 'react'
import { PlayCard } from '@/components/community/PlayCard'
import type { CommunityPlay } from '@/types/community'

type SortOption = 'recent' | 'popular'

export function GalleryPageClient() {
  const [plays, setPlays] = useState<CommunityPlay[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [sort, setSort] = useState<SortOption>('recent')
  const [tagFilter, setTagFilter] = useState('')

  const fetchPlays = useCallback(
    async (pageNum: number, append: boolean) => {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          sort,
        })
        if (tagFilter.trim()) {
          params.set('tag', tagFilter.trim())
        }

        const res = await fetch(`/api/plays?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch plays')

        const data = await res.json()
        const fetched: CommunityPlay[] = data.data ?? []
        const more: boolean = data.hasMore ?? false

        if (append) {
          setPlays((prev) => [...prev, ...fetched])
        } else {
          setPlays(fetched)
        }
        setHasMore(more)
      } catch {
        // Silently handle fetch errors; plays remain as-is
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [sort, tagFilter],
  )

  // Re-fetch from page 1 when sort or tag changes
  useEffect(() => {
    setPage(1)
    fetchPlays(1, false)
  }, [fetchPlays])

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    fetchPlays(next, true)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Play Gallery</h1>
      <p className="text-sm text-gray-500 mb-6">
        Browse community-shared plays and formations
      </p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex items-center gap-2">
          <label htmlFor="gallery-sort" className="text-sm font-medium text-gray-700">
            Sort:
          </label>
          <select
            id="gallery-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-grass/50 focus:border-grass"
          >
            <option value="recent">Recent</option>
            <option value="popular">Popular</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="gallery-tag" className="text-sm font-medium text-gray-700">
            Tag:
          </label>
          <input
            id="gallery-tag"
            type="text"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            placeholder="e.g., zone, screen"
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grass/50 focus:border-grass"
          />
        </div>
      </div>

      {/* Play Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : plays.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium mb-2">No plays found</p>
          <p className="text-sm">
            {tagFilter.trim()
              ? 'Try a different tag or clear the filter.'
              : 'Be the first to share a play with the community!'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plays.map((play) => (
              <PlayCard key={play.id} play={play} />
            ))}
          </div>

          {/* Pagination */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-grass text-white text-sm font-medium rounded-lg hover:bg-grass-dark transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
