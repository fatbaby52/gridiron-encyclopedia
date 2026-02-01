import Fuse, { type IFuseOptions } from 'fuse.js'
import type { ArticleListItem } from '@/types'

let fuseIndex: Fuse<ArticleListItem> | null = null

const FUSE_OPTIONS: IFuseOptions<ArticleListItem> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'tags', weight: 0.3 },
    { name: 'category', weight: 0.15 },
    { name: 'description', weight: 0.15 },
  ],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2,
}

export function buildSearchIndex(articles: ArticleListItem[]): Fuse<ArticleListItem> {
  fuseIndex = new Fuse(articles, FUSE_OPTIONS)
  return fuseIndex
}

export function searchArticles(
  query: string,
  articles?: ArticleListItem[],
): ArticleListItem[] {
  if (!fuseIndex && articles) {
    buildSearchIndex(articles)
  }
  if (!fuseIndex) return []
  return fuseIndex.search(query, { limit: 10 }).map((result) => result.item)
}
