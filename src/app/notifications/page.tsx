import type { Metadata } from 'next'
import { NotificationsPageClient } from './NotificationsPageClient'

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'View your notifications.',
  robots: { index: false, follow: false },
}

export default function NotificationsPage() {
  return <NotificationsPageClient />
}
