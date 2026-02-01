import Link from 'next/link'
import type { ArticleListItem } from '@/types'

interface RelatedArticlesProps {
  articles: ArticleListItem[]
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-xl font-bold text-grass-dark mb-4">Related Concepts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/${article.category}/${article.slug}`}
            className="block p-4 rounded-lg border border-gray-200 hover:border-grass/50 hover:shadow-sm transition-all"
          >
            <h3 className="font-semibold text-gray-900 text-sm">{article.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{article.category}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
