import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; versionId: string }> },
) {
  const { versionId } = await params

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('article_versions')
    .select('*')
    .eq('id', versionId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Version not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: data.id,
    articleSlug: data.article_slug,
    authorId: data.author_id,
    authorName: data.author_name,
    title: data.title,
    content: data.content,
    summary: data.summary,
    status: data.status,
    reviewedBy: data.reviewed_by,
    reviewNote: data.review_note,
    createdAt: data.created_at,
    reviewedAt: data.reviewed_at,
  })
}
