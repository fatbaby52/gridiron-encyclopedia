import type { Metadata } from 'next'
import { ReportsPageClient } from './ReportsPageClient'

export const metadata: Metadata = {
  title: 'Moderation Reports',
  description: 'Review and resolve content reports.',
}

export default function ReportsPage() {
  return <ReportsPageClient />
}
