import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'
import { ReadingHistoryList } from '@/components/ui/ReadingHistoryList'

export const metadata: Metadata = {
  title: `Reading History | ${SITE_NAME}`,
}

export default function ReadingHistoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-grass-dark mb-2">Reading History</h1>
      <p className="text-gray-500 mb-8">Articles you&apos;ve recently visited.</p>
      <ReadingHistoryList />
    </div>
  )
}
