import { getArticleBySlug, getAllArticles } from '@/lib/mdx'
import { ArticlePage } from '@/components/wiki/ArticlePage'
import { CategoryOverview } from '@/components/wiki/CategoryOverview'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo'
import { SITE_URL, SITE_NAME } from '@/lib/constants'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  const url = `${SITE_URL}/${slug.join('/')}`

  if (article) {
    const description =
      article.frontmatter.description ||
      `Learn about ${article.frontmatter.title} on ${SITE_NAME}`

    const categoryLabel = article.frontmatter.category
      .split('/')
      .map((s) =>
        s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      )
      .join(' > ')

    const ogParams = new URLSearchParams({
      title: article.frontmatter.title,
      description: description.slice(0, 150),
      category: categoryLabel,
    })

    return {
      title: article.frontmatter.title,
      description,
      keywords: article.frontmatter.tags,
      alternates: { canonical: `/${slug.join('/')}` },
      openGraph: {
        type: 'article',
        title: article.frontmatter.title,
        description,
        url,
        images: [`/api/og?${ogParams.toString()}`],
      },
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
    alternates: { canonical: `/${slug.join('/')}` },
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
    const url = `${SITE_URL}/${slug.join('/')}`
    const description =
      article.frontmatter.description ||
      `Learn about ${article.frontmatter.title} on ${SITE_NAME}`

    const categoryParts = article.frontmatter.category.split('/')
    const breadcrumbs = [
      { name: 'Home', href: '/' },
      ...categoryParts.map((part, i) => ({
        name: part
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
        href: `/${categoryParts.slice(0, i + 1).join('/')}`,
      })),
      { name: article.frontmatter.title, href: `/${slug.join('/')}` },
    ]

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              articleJsonLd({
                title: article.frontmatter.title,
                description,
                url,
                dateModified: article.frontmatter.lastUpdated,
                tags: article.frontmatter.tags,
              }),
            ),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)),
          }}
        />
        <ArticlePage article={article} />
      </>
    )
  }

  // Fall back to category overview
  const categoryPath = slug.join('/')
  return <CategoryOverview categoryPath={categoryPath} />
}
