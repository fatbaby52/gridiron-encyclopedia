import { getArticleBySlug, getAllArticles } from '@/lib/mdx'
import { ArticlePage } from '@/components/wiki/ArticlePage'
import { CategoryOverview } from '@/components/wiki/CategoryOverview'
import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (article) {
    return {
      title: article.frontmatter.title,
      description: article.frontmatter.description || `Learn about ${article.frontmatter.title} on ${SITE_NAME}`,
    }
  }

  const categoryLabel = slug
    .map((s) =>
      s
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
    )
    .join(' > ')

  return {
    title: categoryLabel,
    description: `Browse ${categoryLabel} articles on ${SITE_NAME}`,
  }
}

export async function generateStaticParams() {
  const articles = getAllArticles()
  const paths: { slug: string[] }[] = []

  for (const article of articles) {
    const slugParts = [...article.category.split('/'), article.slug]
    paths.push({ slug: slugParts })
  }

  // Also add category pages
  const categories = new Set(articles.map((a) => a.category))
  for (const cat of categories) {
    paths.push({ slug: cat.split('/') })
  }

  return paths
}

export default async function WikiPage({ params }: PageProps) {
  const { slug } = await params

  // Try article first
  const article = getArticleBySlug(slug)
  if (article) {
    return <ArticlePage article={article} />
  }

  // Fall back to category overview
  const categoryPath = slug.join('/')
  return <CategoryOverview categoryPath={categoryPath} />
}
