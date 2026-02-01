'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { VersionHistory } from '@/components/wiki/VersionHistory'

export default function ArticleHistoryPage() {
  const params = useParams()
  const slugParts = (params.slug as string[]) || []
  const articleSlug = slugParts[slugParts.length - 1] || ''
  const fullPath = slugParts.join('/')

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/${fullPath}`}
          className="text-sm text-grass-dark hover:underline"
        >
          Back to article
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Edit History</h1>
        <p className="text-sm text-gray-500 mt-1">
          Article: <span className="font-mono">{fullPath}</span>
        </p>
      </div>
      <VersionHistory articleSlug={articleSlug} />
    </div>
  )
}
