import type { Metadata } from 'next'
import { CommunityPageClient } from './CommunityPageClient'

export const metadata: Metadata = {
  title: 'Community',
  description: 'Discuss strategy, share plays, and connect with football enthusiasts on Gridiron Encyclopedia.',
  alternates: { canonical: '/community' },
}

export default function CommunityPage() {
  return <CommunityPageClient />
}
