import { z } from 'zod'

// Profile schemas
export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  favoriteTeam: z.string().max(50).nullable().optional(),
  coachingLevel: z.string().max(50).nullable().optional(),
})

export const usernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username may only contain letters, numbers, hyphens, and underscores')

// Article version schemas
export const submitEditSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(100000),
  summary: z.string().min(1).max(500),
})

export const reviewEditSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewNote: z.string().max(1000).optional(),
})

// Playbook schemas
export const createPlaybookSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().default(''),
  isPublic: z.boolean().optional().default(false),
})

export const updatePlaybookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
})

// Community play schemas
export const createPlaySchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional().default(''),
  diagramData: z.string().min(1).max(500000),
  playbookId: z.string().uuid().nullable().optional().default(null),
  isPublic: z.boolean().optional().default(false),
  tags: z.array(z.string().max(30)).max(10).optional().default([]),
})

export const updatePlaySchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  diagramData: z.string().min(1).max(500000).optional(),
  playbookId: z.string().uuid().nullable().optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
})

export const voteSchema = z.object({
  type: z.enum(['upvote', 'favorite']),
})

// Discussion schemas
export const createDiscussionSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(50000),
  category: z.enum([
    'general',
    'offense',
    'defense',
    'special-teams',
    'strategy',
    'coaching',
    'film-study',
  ]),
  articleSlug: z.string().max(200).nullable().optional().default(null),
})

export const updateDiscussionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(10).max(50000).optional(),
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
})

// Comment schemas
export const createCommentSchema = z.object({
  content: z.string().min(1).max(10000),
  parentId: z.string().uuid().nullable().optional().default(null),
})

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(10000),
})

// Moderation schemas
export const createReportSchema = z.object({
  targetType: z.enum(['comment', 'discussion', 'play', 'article_version']),
  targetId: z.string().uuid(),
  reason: z.enum(['spam', 'offensive', 'misinformation', 'plagiarism', 'off-topic', 'other']),
  details: z.string().max(1000).optional().default(''),
})

export const resolveReportSchema = z.object({
  status: z.enum(['resolved', 'dismissed']),
})

export const moderationActionSchema = z.object({
  targetUserId: z.string().uuid(),
  action: z.enum(['warn', 'mute', 'ban', 'remove_content', 'restore_content']),
  reason: z.string().min(1).max(1000),
  reportId: z.string().uuid().nullable().optional().default(null),
})

export const updateUserRoleSchema = z.object({
  role: z.enum(['registered', 'contributor', 'editor', 'admin']),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
})
