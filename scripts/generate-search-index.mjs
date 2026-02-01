import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content')
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'search-index.json')

function getMdxFiles(dir) {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== 'diagrams') {
      files.push(...getMdxFiles(fullPath))
    } else if (entry.name.endsWith('.mdx')) {
      files.push(fullPath)
    }
  }
  return files
}

function main() {
  const files = getMdxFiles(CONTENT_DIR)
  const articles = []

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(raw)

    if (data.status !== 'published') continue

    articles.push({
      title: data.title,
      slug: data.slug,
      category: data.category,
      level: data.level || [],
      tags: data.tags || [],
      description: data.description || '',
      status: data.status,
    })
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(articles, null, 2))
  console.log(`Search index generated: ${articles.length} articles written to ${OUTPUT_PATH}`)
}

main()
