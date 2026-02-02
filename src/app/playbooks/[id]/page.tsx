import type { Metadata } from 'next'
import { PlaybookDetailPageClient } from './PlaybookDetailPageClient'

export const metadata: Metadata = {
  title: 'Playbook',
  description: 'View and manage plays in your playbook.',
  robots: { index: false, follow: false },
}

export default function PlaybookDetailPage() {
  return <PlaybookDetailPageClient />
}
