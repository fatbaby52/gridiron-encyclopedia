import type { Metadata } from 'next'
import { AdminPageClient } from './AdminPageClient'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage content, reports, and users for Gridiron Encyclopedia.',
}

export default function AdminPage() {
  return <AdminPageClient />
}
