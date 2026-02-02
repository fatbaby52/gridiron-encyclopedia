import type { Metadata } from 'next'
import { ResourcesPageClient } from './ResourcesPageClient'

export const metadata: Metadata = {
  title: 'Free Downloads',
  description:
    'Download free football playbooks and printable workout templates. Spread offense, Wing-T, 4-3 defense, 3-4 defense, special teams, and position-specific training programs.',
  alternates: { canonical: '/resources' },
}

export default function ResourcesPage() {
  return <ResourcesPageClient />
}
