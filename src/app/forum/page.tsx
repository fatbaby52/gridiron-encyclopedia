import type { Metadata } from 'next'
import { ForumPageClient } from './ForumPageClient'

export const metadata: Metadata = {
  title: 'Forum',
  description: 'Discuss football strategy, share ideas, and connect with the community.',
  alternates: { canonical: '/forum' },
}

export default function ForumPage() {
  return <ForumPageClient />
}
