import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase'
import type {
  UserProfile,
  ArticleVersion,
  VersionStatus,
  Playbook,
  CommunityPlay,
  PlayVote,
  Discussion,
  DiscussionCategory,
  Comment,
  Notification,
  ModerationReport,
  ReportStatus,
  PaginatedResult,
} from '@/types/community'

// ---------------------------------------------------------------------------
// localStorage helpers (fallback when Supabase is not configured or user is
// not authenticated). Keys are prefixed with "ge-" to avoid collisions.
// ---------------------------------------------------------------------------

const LS_PREFIX = 'ge-'

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value))
  } catch {
    // localStorage full or unavailable
  }
}

function generateId(): string {
  return crypto.randomUUID()
}

function nowIso(): string {
  return new Date().toISOString()
}

// ---------------------------------------------------------------------------
// Connection check
// ---------------------------------------------------------------------------

function getClient() {
  if (!isSupabaseConfigured()) return null
  return getSupabaseBrowserClient()
}

function isOnline(): boolean {
  return getClient() !== null
}

export { isOnline }

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const sb = getClient()
  if (sb) {
    const { data } = await sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return data as UserProfile | null
  }
  return lsGet<UserProfile | null>(`profile-${userId}`, null)
}

export async function getProfileByUsername(username: string): Promise<UserProfile | null> {
  const sb = getClient()
  if (sb) {
    const { data } = await sb
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
    return data as UserProfile | null
  }
  // localStorage: iterate stored profiles (limited use case)
  return null
}

export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile | null> {
  const sb = getClient()
  if (sb) {
    const { data } = await sb
      .from('profiles')
      .update({ ...updates, last_active_at: nowIso() })
      .eq('id', userId)
      .select()
      .single()
    return data as UserProfile | null
  }
  const existing = lsGet<UserProfile | null>(`profile-${userId}`, null)
  if (!existing) return null
  const updated = { ...existing, ...updates, lastActiveAt: nowIso() }
  lsSet(`profile-${userId}`, updated)
  return updated
}

// ---------------------------------------------------------------------------
// Article Versions (wiki edits)
// ---------------------------------------------------------------------------

export async function getArticleVersions(
  articleSlug: string,
  page = 1,
  pageSize = 20,
): Promise<PaginatedResult<ArticleVersion>> {
  const sb = getClient()
  if (sb) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, count } = await sb
      .from('article_versions')
      .select('*', { count: 'exact' })
      .eq('article_slug', articleSlug)
      .order('created_at', { ascending: false })
      .range(from, to)
    return {
      data: (data ?? []) as unknown as ArticleVersion[],
      total: count ?? 0,
      page,
      pageSize,
      hasMore: (count ?? 0) > page * pageSize,
    }
  }
  const all = lsGet<ArticleVersion[]>(`versions-${articleSlug}`, [])
  const start = (page - 1) * pageSize
  return {
    data: all.slice(start, start + pageSize),
    total: all.length,
    page,
    pageSize,
    hasMore: all.length > page * pageSize,
  }
}

export async function submitArticleEdit(
  articleSlug: string,
  authorId: string,
  authorName: string,
  edit: { title: string; content: string; summary: string },
): Promise<ArticleVersion | null> {
  const version: ArticleVersion = {
    id: generateId(),
    articleSlug,
    authorId,
    authorName,
    title: edit.title,
    content: edit.content,
    summary: edit.summary,
    status: 'pending',
    reviewedBy: null,
    reviewNote: null,
    createdAt: nowIso(),
    reviewedAt: null,
  }

  const sb = getClient()
  if (sb) {
    const { data } = await sb
      .from('article_versions')
      .insert({
        id: version.id,
        article_slug: articleSlug,
        author_id: authorId,
        author_name: authorName,
        title: edit.title,
        content: edit.content,
        summary: edit.summary,
        status: 'pending',
      })
      .select()
      .single()
    return data as unknown as ArticleVersion | null
  }
  const all = lsGet<ArticleVersion[]>(`versions-${articleSlug}`, [])
  lsSet(`versions-${articleSlug}`, [version, ...all])
  return version
}

export async function reviewArticleEdit(
  versionId: string,
  articleSlug: string,
  reviewerId: string,
  status: 'approved' | 'rejected',
  reviewNote?: string,
): Promise<ArticleVersion | null> {
  const sb = getClient()
  if (sb) {
    const { data } = await sb
      .from('article_versions')
      .update({
        status,
        reviewed_by: reviewerId,
        review_note: reviewNote ?? null,
        reviewed_at: nowIso(),
      })
      .eq('id', versionId)
      .select()
      .single()
    return data as unknown as ArticleVersion | null
  }
  const all = lsGet<ArticleVersion[]>(`versions-${articleSlug}`, [])
  const updated = all.map((v) =>
    v.id === versionId
      ? { ...v, status: status as VersionStatus, reviewedBy: reviewerId, reviewNote: reviewNote ?? null, reviewedAt: nowIso() }
      : v,
  )
  lsSet(`versions-${articleSlug}`, updated)
  return updated.find((v) => v.id === versionId) ?? null
}

// ---------------------------------------------------------------------------
// Playbooks
// ---------------------------------------------------------------------------

export async function getUserPlaybooks(userId: string): Promise<Playbook[]> {
  const sb = getClient()
  if (sb) {
    const { data } = await sb
      .from('playbooks')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    return (data ?? []) as unknown as Playbook[]
  }
  return lsGet<Playbook[]>(`playbooks-${userId}`, [])
}

export async function createPlaybook(
  userId: string,
  input: { name: string; description: string; isPublic: boolean },
): Promise<Playbook | null> {
  const playbook: Playbook = {
    id: generateId(),
    userId,
    name: input.name,
    description: input.description,
    isPublic: input.isPublic,
    playCount: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  const sb = getClient()
  if (sb) {
    const { data } = await sb
      .from('playbooks')
      .insert({
        id: playbook.id,
        user_id: userId,
        name: input.name,
        description: input.description,
        is_public: input.isPublic,
      })
      .select()
      .single()
    return data as unknown as Playbook | null
  }
  const all = lsGet<Playbook[]>(`playbooks-${userId}`, [])
  lsSet(`playbooks-${userId}`, [playbook, ...all])
  return playbook
}

export async function updatePlaybook(
  playbookId: string,
  userId: string,
  updates: Partial<Pick<Playbook, 'name' | 'description' | 'isPublic'>>,
): Promise<Playbook | null> {
  const sb = getClient()
  if (sb) {
    const { data } = await sb
      .from('playbooks')
      .update({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.isPublic !== undefined && { is_public: updates.isPublic }),
        updated_at: nowIso(),
      })
      .eq('id', playbookId)
      .eq('user_id', userId)
      .select()
      .single()
    return data as unknown as Playbook | null
  }
  const all = lsGet<Playbook[]>(`playbooks-${userId}`, [])
  const updated = all.map((p) =>
    p.id === playbookId ? { ...p, ...updates, updatedAt: nowIso() } : p,
  )
  lsSet(`playbooks-${userId}`, updated)
  return updated.find((p) => p.id === playbookId) ?? null
}

export async function deletePlaybook(playbookId: string, userId: string): Promise<boolean> {
  const sb = getClient()
  if (sb) {
    const { error } = await sb
      .from('playbooks')
      .delete()
      .eq('id', playbookId)
      .eq('user_id', userId)
    return !error
  }
  const all = lsGet<Playbook[]>(`playbooks-${userId}`, [])
  lsSet(
    `playbooks-${userId}`,
    all.filter((p) => p.id !== playbookId),
  )
  // Also remove plays in that playbook
  const plays = lsGet<CommunityPlay[]>(`plays-${userId}`, [])
  lsSet(
    `plays-${userId}`,
    plays.map((p) => (p.playbookId === playbookId ? { ...p, playbookId: null } : p)),
  )
  return true
}

// ---------------------------------------------------------------------------
// Community Plays
// ---------------------------------------------------------------------------

const MAX_PLAYS = 50

export async function getUserPlays(userId: string): Promise<CommunityPlay[]> {
  const sb = getClient()
  if (sb) {
    const { data } = await sb
      .from('community_plays')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    return (data ?? []) as unknown as CommunityPlay[]
  }
  return lsGet<CommunityPlay[]>(`plays-${userId}`, [])
}

export async function getPublicPlays(
  page = 1,
  pageSize = 20,
  sortBy: 'recent' | 'popular' = 'recent',
  tag?: string,
): Promise<PaginatedResult<CommunityPlay>> {
  const sb = getClient()
  if (sb) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    let query = sb
      .from('community_plays')
      .select('*', { count: 'exact' })
      .eq('is_public', true)

    if (tag) {
      query = query.contains('tags', [tag])
    }

    if (sortBy === 'popular') {
      query = query.order('upvotes', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, count } = await query.range(from, to)
    return {
      data: (data ?? []) as unknown as CommunityPlay[],
      total: count ?? 0,
      page,
      pageSize,
      hasMore: (count ?? 0) > page * pageSize,
    }
  }
  return { data: [], total: 0, page, pageSize, hasMore: false }
}

export async function createPlay(
  userId: string,
  authorName: string,
  input: {
    title: string
    description: string
    diagramData: string
    playbookId: string | null
    isPublic: boolean
    tags: string[]
  },
): Promise<CommunityPlay | null> {
  // Enforce play limit
  const existing = await getUserPlays(userId)
  if (existing.length >= MAX_PLAYS) return null

  const play: CommunityPlay = {
    id: generateId(),
    userId,
    authorName,
    title: input.title,
    description: input.description,
    diagramData: input.diagramData,
    playbookId: input.playbookId,
    isPublic: input.isPublic,
    tags: input.tags,
    upvotes: 0,
    favorites: 0,
    forkCount: 0,
    forkedFromId: null,
    submittedToEncyclopedia: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  const sb = getClient()
  if (sb) {
    const { data } = await sb
      .from('community_plays')
      .insert({
        id: play.id,
        user_id: userId,
        author_name: authorName,
        title: input.title,
        description: input.description,
        diagram_data: input.diagramData,
        playbook_id: input.playbookId,
        is_public: input.isPublic,
        tags: input.tags,
      })
      .select()
      .single()
    return data as unknown as CommunityPlay | null
  }
  const all = lsGet<CommunityPlay[]>(`plays-${userId}`, [])
  lsSet(`plays-${userId}`, [play, ...all])
  return play
}

export async function updatePlay(
  playId: string,
  userId: string,
  updates: Partial<Pick<CommunityPlay, 'title' | 'description' | 'diagramData' | 'playbookId' | 'isPublic' | 'tags'>>,
): Promise<CommunityPlay | null> {
  const sb = getClient()
  if (sb) {
    const dbUpdates: Record<string, unknown> = { updated_at: nowIso() }
    if (updates.title !== undefined) dbUpdates.title = updates.title
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.diagramData !== undefined) dbUpdates.diagram_data = updates.diagramData
    if (updates.playbookId !== undefined) dbUpdates.playbook_id = updates.playbookId
    if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags

    const { data } = await sb
      .from('community_plays')
      .update(dbUpdates)
      .eq('id', playId)
      .eq('user_id', userId)
      .select()
      .single()
    return data as unknown as CommunityPlay | null
  }
  const all = lsGet<CommunityPlay[]>(`plays-${userId}`, [])
  const updated = all.map((p) =>
    p.id === playId ? { ...p, ...updates, updatedAt: nowIso() } : p,
  )
  lsSet(`plays-${userId}`, updated)
  return updated.find((p) => p.id === playId) ?? null
}

export async function deletePlay(playId: string, userId: string): Promise<boolean> {
  const sb = getClient()
  if (sb) {
    const { error } = await sb
      .from('community_plays')
      .delete()
      .eq('id', playId)
      .eq('user_id', userId)
    return !error
  }
  const all = lsGet<CommunityPlay[]>(`plays-${userId}`, [])
  lsSet(
    `plays-${userId}`,
    all.filter((p) => p.id !== playId),
  )
  return true
}

export async function voteOnPlay(
  playId: string,
  userId: string,
  type: 'upvote' | 'favorite',
): Promise<boolean> {
  const sb = getClient()
  if (sb) {
    // Check existing vote
    const { data: existing } = await sb
      .from('play_votes')
      .select('id')
      .eq('play_id', playId)
      .eq('user_id', userId)
      .eq('type', type)
      .single()

    if (existing) {
      // Remove vote
      await sb.from('play_votes').delete().eq('id', existing.id)
      const col = type === 'upvote' ? 'upvotes' : 'favorites'
      await sb.rpc('decrement_play_count', { play_id: playId, col_name: col })
      return false
    }

    // Add vote
    await sb.from('play_votes').insert({ play_id: playId, user_id: userId, type })
    const col = type === 'upvote' ? 'upvotes' : 'favorites'
    await sb.rpc('increment_play_count', { play_id: playId, col_name: col })
    return true
  }
  // localStorage: toggle in a simple set
  const votes = lsGet<PlayVote[]>('play-votes', [])
  const idx = votes.findIndex((v) => v.playId === playId && v.userId === userId && v.type === type)
  if (idx >= 0) {
    votes.splice(idx, 1)
    lsSet('play-votes', votes)
    return false
  }
  votes.push({ id: generateId(), playId, userId, type, createdAt: nowIso() })
  lsSet('play-votes', votes)
  return true
}

export async function forkPlay(
  playId: string,
  userId: string,
  authorName: string,
): Promise<CommunityPlay | null> {
  const sb = getClient()
  if (sb) {
    const { data: source } = await sb
      .from('community_plays')
      .select('*')
      .eq('id', playId)
      .single()
    if (!source) return null

    const forked = await createPlay(userId, authorName, {
      title: `${source.title} (Fork)`,
      description: source.description,
      diagramData: source.diagram_data,
      playbookId: null,
      isPublic: false,
      tags: source.tags ?? [],
    })
    if (forked) {
      // Update fork reference
      await sb
        .from('community_plays')
        .update({ forked_from_id: playId })
        .eq('id', forked.id)
      // Increment fork count on source
      await sb.rpc('increment_play_count', { play_id: playId, col_name: 'fork_count' })
    }
    return forked
  }
  return null
}

// ---------------------------------------------------------------------------
// Discussions
// ---------------------------------------------------------------------------

export async function getDiscussions(
  page = 1,
  pageSize = 20,
  category?: DiscussionCategory,
  articleSlug?: string,
): Promise<PaginatedResult<Discussion>> {
  const sb = getClient()
  if (sb) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    let query = sb
      .from('discussions')
      .select('*', { count: 'exact' })

    if (category) query = query.eq('category', category)
    if (articleSlug) query = query.eq('article_slug', articleSlug)

    const { data, count } = await query
      .order('is_pinned', { ascending: false })
      .order('last_activity_at', { ascending: false })
      .range(from, to)

    return {
      data: (data ?? []) as unknown as Discussion[],
      total: count ?? 0,
      page,
      pageSize,
      hasMore: (count ?? 0) > page * pageSize,
    }
  }
  return { data: [], total: 0, page, pageSize, hasMore: false }
}

export async function getDiscussion(discussionId: string): Promise<Discussion | null> {
  const sb = getClient()
  if (sb) {
    const { data } = await sb
      .from('discussions')
      .select('*')
      .eq('id', discussionId)
      .single()
    return data as unknown as Discussion | null
  }
  return null
}

export async function createDiscussion(
  authorId: string,
  authorName: string,
  input: {
    title: string
    content: string
    category: DiscussionCategory
    articleSlug: string | null
  },
): Promise<Discussion | null> {
  const sb = getClient()
  if (sb) {
    const { data } = await sb
      .from('discussions')
      .insert({
        author_id: authorId,
        author_name: authorName,
        title: input.title,
        content: input.content,
        category: input.category,
        article_slug: input.articleSlug,
      })
      .select()
      .single()
    return data as unknown as Discussion | null
  }
  return null
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export async function getComments(
  discussionId: string,
  page = 1,
  pageSize = 50,
): Promise<PaginatedResult<Comment>> {
  const sb = getClient()
  if (sb) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, count } = await sb
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true })
      .range(from, to)

    return {
      data: (data ?? []) as unknown as Comment[],
      total: count ?? 0,
      page,
      pageSize,
      hasMore: (count ?? 0) > page * pageSize,
    }
  }
  return { data: [], total: 0, page, pageSize, hasMore: false }
}

export async function createComment(
  discussionId: string,
  authorId: string,
  authorName: string,
  content: string,
  parentId: string | null = null,
): Promise<Comment | null> {
  const sb = getClient()
  if (sb) {
    // Calculate depth
    let depth = 0
    if (parentId) {
      const { data: parent } = await sb
        .from('comments')
        .select('depth')
        .eq('id', parentId)
        .single()
      depth = Math.min((parent?.depth ?? 0) + 1, 3)
    }

    const { data } = await sb
      .from('comments')
      .insert({
        discussion_id: discussionId,
        author_id: authorId,
        author_name: authorName,
        content,
        parent_id: parentId,
        depth,
      })
      .select()
      .single()

    // Update discussion last_activity_at and comment_count
    if (data) {
      await sb.rpc('increment_comment_count', { disc_id: discussionId })
    }

    return data as unknown as Comment | null
  }
  return null
}

export async function voteOnComment(
  commentId: string,
  userId: string,
): Promise<boolean> {
  const sb = getClient()
  if (sb) {
    const { data: existing } = await sb
      .from('comment_votes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single()

    if (existing) {
      await sb.from('comment_votes').delete().eq('id', existing.id)
      await sb.rpc('decrement_comment_upvotes', { cmt_id: commentId })
      return false
    }

    await sb.from('comment_votes').insert({ comment_id: commentId, user_id: userId })
    await sb.rpc('increment_comment_upvotes', { cmt_id: commentId })
    return true
  }
  return false
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function getNotifications(
  userId: string,
  page = 1,
  pageSize = 20,
  unreadOnly = false,
): Promise<PaginatedResult<Notification>> {
  const sb = getClient()
  if (sb) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    let query = sb
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (unreadOnly) query = query.eq('is_read', false)

    const { data, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    return {
      data: (data ?? []) as unknown as Notification[],
      total: count ?? 0,
      page,
      pageSize,
      hasMore: (count ?? 0) > page * pageSize,
    }
  }
  const all = lsGet<Notification[]>(`notifications-${userId}`, [])
  const filtered = unreadOnly ? all.filter((n) => !n.isRead) : all
  const start = (page - 1) * pageSize
  return {
    data: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    hasMore: filtered.length > page * pageSize,
  }
}

export async function markNotificationsRead(
  userId: string,
  notificationIds: string[],
): Promise<void> {
  const sb = getClient()
  if (sb) {
    await sb
      .from('notifications')
      .update({ is_read: true })
      .in('id', notificationIds)
      .eq('user_id', userId)
    return
  }
  const all = lsGet<Notification[]>(`notifications-${userId}`, [])
  const updated = all.map((n) =>
    notificationIds.includes(n.id) ? { ...n, isRead: true } : n,
  )
  lsSet(`notifications-${userId}`, updated)
}

export async function getUnreadCount(userId: string): Promise<number> {
  const sb = getClient()
  if (sb) {
    const { count } = await sb
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    return count ?? 0
  }
  const all = lsGet<Notification[]>(`notifications-${userId}`, [])
  return all.filter((n) => !n.isRead).length
}

// ---------------------------------------------------------------------------
// Moderation Reports
// ---------------------------------------------------------------------------

export async function getReports(
  page = 1,
  pageSize = 20,
  status?: ReportStatus,
): Promise<PaginatedResult<ModerationReport>> {
  const sb = getClient()
  if (sb) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    let query = sb
      .from('moderation_reports')
      .select('*', { count: 'exact' })

    if (status) query = query.eq('status', status)

    const { data, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    return {
      data: (data ?? []) as unknown as ModerationReport[],
      total: count ?? 0,
      page,
      pageSize,
      hasMore: (count ?? 0) > page * pageSize,
    }
  }
  return { data: [], total: 0, page, pageSize, hasMore: false }
}

export async function createReport(
  reporterId: string,
  input: {
    targetType: ModerationReport['targetType']
    targetId: string
    reason: ModerationReport['reason']
    details: string
  },
): Promise<ModerationReport | null> {
  const sb = getClient()
  if (sb) {
    const { data } = await sb
      .from('moderation_reports')
      .insert({
        reporter_id: reporterId,
        target_type: input.targetType,
        target_id: input.targetId,
        reason: input.reason,
        details: input.details,
      })
      .select()
      .single()
    return data as unknown as ModerationReport | null
  }
  return null
}

export async function resolveReport(
  reportId: string,
  moderatorId: string,
  status: 'resolved' | 'dismissed',
): Promise<ModerationReport | null> {
  const sb = getClient()
  if (sb) {
    const { data } = await sb
      .from('moderation_reports')
      .update({
        status,
        resolved_by: moderatorId,
        resolved_at: nowIso(),
      })
      .eq('id', reportId)
      .select()
      .single()
    return data as unknown as ModerationReport | null
  }
  return null
}
