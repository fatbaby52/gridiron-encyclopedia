import type { Metadata } from 'next'
import { EditArticlePageClient } from './EditArticlePageClient'

export const metadata: Metadata = {
  title: 'Edit Article',
  description: 'Edit an article on Gridiron Encyclopedia.',
  robots: { index: false, follow: false },
}

export default function EditArticlePage() {
  return <EditArticlePageClient />
}
