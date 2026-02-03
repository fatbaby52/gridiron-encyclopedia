import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { ArticleHeader } from './ArticleHeader'
import { TableOfContents } from './TableOfContents'
import { RelatedArticles } from './RelatedArticles'
import { ReadingHistoryTracker } from './ReadingHistoryTracker'
import { EditButton } from './EditButton'
import { BookmarkButton } from '@/components/ui/BookmarkButton'
import { PlayDiagram } from '@/components/diagrams/PlayDiagram'
import { getRelatedArticles } from '@/lib/mdx'
import type { Article } from '@/types'

interface ArticlePageProps {
  article: Article
}

const mdxComponents = {
  PlayDiagram,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = typeof props.children === 'string' ? props.children : ''
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    return <h2 id={id} {...props} />
  },
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = typeof props.children === 'string' ? props.children : ''
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    return <h3 id={id} {...props} />
  },
}

export function ArticlePage({ article }: ArticlePageProps) {
  const relatedArticles = getRelatedArticles(article.frontmatter.related || [])
  const slug = `${article.frontmatter.category}/${article.frontmatter.slug}`

  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0">
        <ReadingHistoryTracker
          slug={slug}
          title={article.frontmatter.title}
          category={article.frontmatter.category}
        />
        <div className="flex items-start justify-between gap-4 mb-2">
          <ArticleHeader frontmatter={article.frontmatter} />
          <div className="flex items-center gap-3 flex-shrink-0 pt-1">
            <EditButton slug={slug} />
            <a
              href={`/history/${slug}`}
              className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
              title="View edit history"
            >
              History
            </a>
            <BookmarkButton
              slug={slug}
              title={article.frontmatter.title}
              category={article.frontmatter.category}
            />
          </div>
        </div>
        {article.frontmatter.diagram && (
          <PlayDiagram diagramId={article.frontmatter.diagram} animated />
        )}
        <div className="prose max-w-none">
          <MDXRemote source={article.content} components={mdxComponents} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </div>
        <RelatedArticles articles={relatedArticles} />
      </article>
      <TableOfContents content={article.content} />
    </div>
  )
}
