import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireAuth, isAuthError } from '@/lib/authGuard'
import { submitEditSchema } from '@/lib/validation'
import { getAllArticles } from '@/lib/mdx'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content')

function findArticleFile(slug: string): string | null {
  const articles = getAllArticles()
  const article = articles.find((a) => a.slug === slug)
  if (!article) return null
  const filePath = path.join(CONTENT_DIR, ...article.category.split('/'), slug + '.mdx')
  return fs.existsSync(filePath) ? filePath : null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const { searchParams } = new URL(request.url)

  // If requesting current MDX content for editing
  if (searchParams.get('current') === 'true') {
    const filePath = findArticleFile(slug)
    if (!filePath) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)
    return NextResponse.json({ title: data.title, content })
  }

  // Otherwise return version history
  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ data: [], total: 0, page: 1, pageSize: 20, hasMore: false })
  }

  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count } = await supabase
    .from('article_versions')
    .select('*', { count: 'exact' })
    .eq('article_slug', slug)
    .order('created_at', { ascending: false })
    .range(from, to)

  const versions = (data ?? []).map((v: Record<string, unknown>) => ({
    id: v.id,
    articleSlug: v.article_slug,
    authorId: v.author_id,
    authorName: v.author_name,
    title: v.title,
    content: v.content,
    summary: v.summary,
    status: v.status,
    reviewedBy: v.reviewed_by,
    reviewNote: v.review_note,
    createdAt: v.created_at,
    reviewedAt: v.reviewed_at,
  }))

  return NextResponse.json({
    data: versions,
    total: count ?? 0,
    page,
    pageSize,
    hasMore: (count ?? 0) > page * pageSize,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth.response

  const { slug } = await params
  const body = await request.json()
  const parsed = submitEditSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  // Verify article exists
  const filePath = findArticleFile(slug)
  if (!filePath) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  // Get author name from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', auth.userId)
    .single()

  const authorName = profile?.display_name || profile?.username || 'Unknown'

  const { data, error } = await supabase
    .from('article_versions')
    .insert({
      article_slug: slug,
      author_id: auth.userId,
      author_name: authorName,
      title: parsed.data.title,
      content: parsed.data.content,
      summary: parsed.data.summary,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to submit edit' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
