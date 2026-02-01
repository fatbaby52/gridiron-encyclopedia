import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'
import { FavoritesList } from '@/components/ui/FavoritesList'

export const metadata: Metadata = {
  title: `Favorites | ${SITE_NAME}`,
}

export default function FavoritesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-grass-dark mb-2">Your Favorites</h1>
      <p className="text-gray-500 mb-8">Articles you&apos;ve bookmarked for quick access.</p>
      <FavoritesList />
    </div>
  )
}
