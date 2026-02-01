// Community feature types for Gridiron Encyclopedia

export type UserRole = 'registered' | 'contributor' | 'editor' | 'admin'

export type ReputationTier =
  | 'rookie'
  | 'starter'
  | 'all-star'
  | 'pro-bowl'
  | 'all-pro'
  | 'hall-of-fame'

export interface UserProfile {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string
  role: UserRole
  reputation: number
  joinedAt: string
  lastActiveAt: string
  favoriteTeam: string | null
  coachingLevel: string | null
}

export interface ReputationEvent {
  id: string
  userId: string
  action: ReputationAction
  points: number
  referenceType: string | null
  referenceId: string | null
  createdAt: string
}

export type ReputationAction =
  | 'edit_approved'
  | 'edit_rejected'
  | 'play_shared'
  | 'play_upvoted'
  | 'play_featured'
  | 'discussion_created'
  | 'comment_upvoted'
  | 'report_confirmed'

export type VersionStatus = 'pending' | 'approved' | 'rejected'

export interface ArticleVersion {
  id: string
  articleSlug: string
  authorId: string
  authorName: string
  title: string
  content: string
  summary: string
  status: VersionStatus
  reviewedBy: string | null
  reviewNote: string | null
  createdAt: string
  reviewedAt: string | null
}

export interface Playbook {
  id: string
  userId: string
  name: string
  description: string
  isPublic: boolean
  playCount: number
  createdAt: string
  updatedAt: string
}

export interface CommunityPlay {
  id: string
  userId: string
  authorName: string
  title: string
  description: string
  diagramData: string
  playbookId: string | null
  isPublic: boolean
  tags: string[]
  upvotes: number
  favorites: number
  forkCount: number
  forkedFromId: string | null
  submittedToEncyclopedia: boolean
  createdAt: string
  updatedAt: string
}

export interface PlayVote {
  id: string
  playId: string
  userId: string
  type: 'upvote' | 'favorite'
  createdAt: string
}

export type DiscussionCategory =
  | 'general'
  | 'offense'
  | 'defense'
  | 'special-teams'
  | 'strategy'
  | 'coaching'
  | 'film-study'

export interface Discussion {
  id: string
  authorId: string
  authorName: string
  title: string
  content: string
  category: DiscussionCategory
  articleSlug: string | null
  isPinned: boolean
  isLocked: boolean
  commentCount: number
  lastActivityAt: string
  createdAt: string
}

export interface Comment {
  id: string
  discussionId: string
  authorId: string
  authorName: string
  content: string
  parentId: string | null
  upvotes: number
  depth: number
  createdAt: string
  updatedAt: string
}

export interface CommentVote {
  id: string
  commentId: string
  userId: string
  createdAt: string
}

export type NotificationType =
  | 'edit_approved'
  | 'edit_rejected'
  | 'comment_reply'
  | 'discussion_reply'
  | 'play_upvoted'
  | 'play_forked'
  | 'moderation_action'
  | 'reputation_milestone'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  linkUrl: string | null
  isRead: boolean
  createdAt: string
}

export type ReportReason =
  | 'spam'
  | 'offensive'
  | 'misinformation'
  | 'plagiarism'
  | 'off-topic'
  | 'other'

export type ReportStatus = 'pending' | 'resolved' | 'dismissed'

export type ReportTargetType = 'comment' | 'discussion' | 'play' | 'article_version'

export interface ModerationReport {
  id: string
  reporterId: string
  targetType: ReportTargetType
  targetId: string
  reason: ReportReason
  details: string
  status: ReportStatus
  resolvedBy: string | null
  resolvedAt: string | null
  createdAt: string
}

export type ModerationActionType = 'warn' | 'mute' | 'ban' | 'remove_content' | 'restore_content'

export interface ModerationAction {
  id: string
  moderatorId: string
  targetUserId: string
  action: ModerationActionType
  reason: string
  reportId: string | null
  createdAt: string
}

// Pagination helper
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
