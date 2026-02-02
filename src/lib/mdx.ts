import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Article, ArticleListItem, ArticleFrontmatter } from '@/types'

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content')

function getMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getMdxFiles(fullPath))
    } else if (entry.name.endsWith('.mdx')) {
      files.push(fullPath)
    }
  }
  return files
}

export function getAllArticles(): ArticleListItem[] {
  const files = getMdxFiles(CONTENT_DIR)
  const articles: ArticleListItem[] = []

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(raw)
    const fm = data as ArticleFrontmatter
    if (fm.status !== 'published') continue
    articles.push({
      title: fm.title,
      slug: fm.slug,
      category: fm.category,
      level: fm.level,
      tags: fm.tags,
      description: fm.description,
      status: fm.status,
    })
  }

  return articles.sort((a, b) => a.title.localeCompare(b.title))
}

export function getArticleBySlug(slugParts: string[]): Article | null {
  // slugParts like ['offense', 'schemes', 'run', 'inside-zone']
  // First try direct file path match (filename === slug)
  const filePath = path.join(CONTENT_DIR, ...slugParts) + '.mdx'
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)
    return {
      frontmatter: data as ArticleFrontmatter,
      content,
      slug: slugParts.join('/'),
    }
  }

  // Fallback: search by frontmatter slug in the expected category directory
  const articleSlug = slugParts[slugParts.length - 1]
  const categoryParts = slugParts.slice(0, -1)
  const categoryDir = path.join(CONTENT_DIR, ...categoryParts)
  if (!fs.existsSync(categoryDir)) return null

  for (const file of getMdxFiles(categoryDir)) {
    const raw = fs.readFileSync(file, 'utf-8')
    const { data, content } = matter(raw)
    const fm = data as ArticleFrontmatter
    if (fm.slug === articleSlug && fm.status === 'published') {
      return {
        frontmatter: fm,
        content,
        slug: slugParts.join('/'),
      }
    }
  }

  return null
}

export function getArticlesByCategory(category: string): ArticleListItem[] {
  return getAllArticles().filter((a) => a.category === category || a.category.startsWith(category + '/'))
}

export function getRelatedArticles(slugs: string[]): ArticleListItem[] {
  const all = getAllArticles()
  return all.filter((a) => slugs.includes(a.slug))
}

export function getCategories(): string[] {
  const articles = getAllArticles()
  const categories = new Set(articles.map((a) => a.category))
  return Array.from(categories).sort()
}

export function categoryHasContent(categoryPath: string): boolean {
  const dirPath = path.join(CONTENT_DIR, ...categoryPath.split('/'))
  if (!fs.existsSync(dirPath)) return false
  return getMdxFiles(dirPath).length > 0
}
