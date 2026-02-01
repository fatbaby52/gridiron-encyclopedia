import Link from 'next/link'
import { LevelBadge } from '@/components/wiki/LevelBadge'
import type { ArticleListItem } from '@/types'

interface ArticleCardProps {
  article: ArticleListItem
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/${article.category}/${article.slug}`}
      className="block p-4 rounded-lg border border-gray-200 hover:border-grass/50 hover:shadow-md transition-all"
    >
      <div className="text-xs text-gray-400 mb-1">
        {article.category
          .split('/')
          .map((p) =>
            p
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' '),
          )
          .join(' > ')}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
      {article.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{article.description}</p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {article.level.map((lvl) => (
          <LevelBadge key={lvl} level={lvl} />
        ))}
      </div>
    </Link>
  )
}
