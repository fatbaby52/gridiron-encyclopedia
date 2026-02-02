import type { Metadata } from 'next'
import { GalleryPageClient } from './GalleryPageClient'

export const metadata: Metadata = {
  title: 'Play Gallery',
  description: 'Browse community-shared football plays, formations, and schemes.',
  alternates: { canonical: '/gallery' },
}

export default function GalleryPage() {
  return <GalleryPageClient />
}
