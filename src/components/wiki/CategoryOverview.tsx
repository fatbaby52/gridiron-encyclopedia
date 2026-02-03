import Link from 'next/link'
import { getArticlesByCategory } from '@/lib/mdx'
import { CATEGORIES, type CategoryKey } from '@/lib/constants'
import { LevelBadge } from './LevelBadge'

interface CategoryOverviewProps {
  categoryPath: string
}

export function CategoryOverview({ categoryPath }: CategoryOverviewProps) {
  const topLevel = categoryPath.split('/')[0] as CategoryKey
  const categoryMeta = CATEGORIES[topLevel]
  const articles = getArticlesByCategory(categoryPath)

  const categoryLabel = categoryPath
    .split('/')
    .map((p) =>
      p
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
    )
    .join(' > ')

  return (
    <div>
      <h1 className="text-3xl font-bold text-grass-dark dark:text-grass-light mb-2">{categoryLabel}</h1>
      {categoryMeta && (
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">{categoryMeta.description}</p>
      )}

      {articles.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500">No articles in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/${article.category}/${article.slug}`}
              className="block p-5 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-grass/50 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{article.title}</h3>
              {article.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{article.description}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {article.level.map((lvl) => (
                  <LevelBadge key={lvl} level={lvl} />
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
