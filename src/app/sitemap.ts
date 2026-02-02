import type { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/mdx'
import { SITE_URL } from '@/lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles()

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/${article.category}/${article.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const categorySet = new Set(articles.map((a) => a.category))
  const categoryEntries: MetadataRoute.Sitemap = Array.from(categorySet).map((cat) => ({
    url: `${SITE_URL}/${cat}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/community`,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/forum`,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/gallery`,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/designer`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/resources`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  return [...staticPages, ...categoryEntries, ...articleEntries]
}
