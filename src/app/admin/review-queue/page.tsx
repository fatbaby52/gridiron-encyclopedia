import type { Metadata } from 'next'
import { ReviewQueuePageClient } from './ReviewQueuePageClient'

export const metadata: Metadata = {
  title: 'Review Queue',
  description: 'Review pending article edits submitted by contributors.',
}

export default function ReviewQueuePage() {
  return <ReviewQueuePageClient />
}
