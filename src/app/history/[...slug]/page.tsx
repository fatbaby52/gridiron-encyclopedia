import type { Metadata } from 'next'
import { ArticleHistoryPageClient } from './ArticleHistoryPageClient'

export const metadata: Metadata = {
  title: 'Edit History',
  description: 'View the edit history of an article.',
  robots: { index: false, follow: false },
}

export default function ArticleHistoryPage() {
  return <ArticleHistoryPageClient />
}
