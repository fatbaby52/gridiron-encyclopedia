import type { Metadata } from 'next'
import { PlaybooksPageClient } from './PlaybooksPageClient'

export const metadata: Metadata = {
  title: 'My Playbooks',
  description: 'Organize your football plays into custom playbooks.',
  robots: { index: false, follow: false },
}

export default function PlaybooksPage() {
  return <PlaybooksPageClient />
}
