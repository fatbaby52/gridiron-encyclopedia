import type { Metadata } from 'next'
import { CategoryPageClient } from './CategoryPageClient'

export const metadata: Metadata = {
  title: 'Forum Category',
  description: 'Browse and discuss football topics by category on Gridiron Encyclopedia.',
  alternates: { canonical: '/forum' },
}

export default function CategoryPage() {
  return <CategoryPageClient />
}
