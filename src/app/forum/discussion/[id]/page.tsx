import type { Metadata } from 'next'
import { DiscussionPageClient } from './DiscussionPageClient'

export const metadata: Metadata = {
  title: 'Discussion',
  description: 'Join the conversation on Gridiron Encyclopedia forums.',
  alternates: { canonical: '/forum' },
}

export default function DiscussionPage() {
  return <DiscussionPageClient />
}
