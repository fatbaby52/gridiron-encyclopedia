import type { Metadata } from 'next'
import { PublicProfilePageClient } from './PublicProfilePageClient'

export const metadata: Metadata = {
  title: 'User Profile',
  description: 'View user profile and reputation on Gridiron Encyclopedia.',
}

export default function PublicProfilePage() {
  return <PublicProfilePageClient />
}
