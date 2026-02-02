import type { Metadata } from 'next'
import { PlayDetailPageClient } from './PlayDetailPageClient'

export const metadata: Metadata = {
  title: 'Play Detail',
  description: 'View play details, diagrams, and community feedback on Gridiron Encyclopedia.',
  alternates: { canonical: '/gallery' },
}

export default function PlayDetailPage() {
  return <PlayDetailPageClient />
}
