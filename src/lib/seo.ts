import { SITE_NAME, SITE_URL } from './constants'

export interface ArticleJsonLdProps {
  title: string
  description: string
  url: string
  dateModified?: string
  tags?: string[]
}

export function articleJsonLd({ title, description, url, dateModified, tags }: ArticleJsonLdProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    ...(dateModified && { dateModified }),
    ...(tags && tags.length > 0 && { keywords: tags.join(', ') }),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}

export interface BreadcrumbItem {
  name: string
  href: string
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'The comprehensive American football knowledge base. Learn plays, formations, strategies, and coaching concepts from high school to the NFL.',
  }
}
