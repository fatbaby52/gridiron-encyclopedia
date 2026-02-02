import type { Metadata } from 'next'
import { UsersPageClient } from './UsersPageClient'

export const metadata: Metadata = {
  title: 'User Management',
  description: 'View and manage user accounts and role assignments.',
}

export default function UsersPage() {
  return <UsersPageClient />
}
