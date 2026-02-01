import { Breadcrumb } from './Breadcrumb'
import { LevelBadge } from './LevelBadge'
import type { ArticleFrontmatter } from '@/types'

interface ArticleHeaderProps {
  frontmatter: ArticleFrontmatter
}

export function ArticleHeader({ frontmatter }: ArticleHeaderProps) {
  return (
    <header className="mb-8">
      <Breadcrumb category={frontmatter.category} title={frontmatter.title} />
      <h1 className="text-3xl font-bold text-grass-dark mb-3">{frontmatter.title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        {frontmatter.level.map((lvl) => (
          <LevelBadge key={lvl} level={lvl} />
        ))}
        {frontmatter.tags.map((tag) => (
          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      {frontmatter.description && (
        <p className="mt-3 text-gray-600 text-lg leading-relaxed">{frontmatter.description}</p>
      )}
    </header>
  )
}
