export type ArticleLevel = 'hs' | 'college' | 'nfl'
export type ArticleStatus = 'draft' | 'review' | 'published'

export interface ArticleFrontmatter {
  title: string
  slug: string
  category: string
  level: ArticleLevel[]
  tags: string[]
  related: string[]
  diagram?: string
  status: ArticleStatus
  description?: string
  lastUpdated?: string
}

export interface Article {
  frontmatter: ArticleFrontmatter
  content: string
  slug: string
}

export interface ArticleListItem {
  title: string
  slug: string
  category: string
  level: ArticleLevel[]
  tags: string[]
  description?: string
  status: ArticleStatus
}
