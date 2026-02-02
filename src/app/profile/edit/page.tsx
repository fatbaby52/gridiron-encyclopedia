import type { Metadata } from 'next'
import { EditProfilePageClient } from './EditProfilePageClient'

export const metadata: Metadata = {
  title: 'Edit Profile',
  description: 'Update your Gridiron Encyclopedia profile.',
  robots: { index: false, follow: false },
}

export default function EditProfilePage() {
  return <EditProfilePageClient />
}
