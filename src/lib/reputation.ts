import type { ReputationAction, ReputationTier } from '@/types/community'

export const REPUTATION_POINTS: Record<ReputationAction, number> = {
  edit_approved: 25,
  edit_rejected: -5,
  play_shared: 5,
  play_upvoted: 2,
  play_featured: 50,
  discussion_created: 3,
  comment_upvoted: 1,
  report_confirmed: 10,
}

interface TierInfo {
  tier: ReputationTier
  label: string
  minPoints: number
  color: string
  bgColor: string
}

export const REPUTATION_TIERS: TierInfo[] = [
  { tier: 'hall-of-fame', label: 'Hall of Fame', minPoints: 5000, color: 'text-yellow-700 dark:text-yellow-300', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { tier: 'all-pro', label: 'All-Pro', minPoints: 2000, color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  { tier: 'pro-bowl', label: 'Pro Bowl', minPoints: 750, color: 'text-blue-700 dark:text-blue-300', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  { tier: 'all-star', label: 'All-Star', minPoints: 250, color: 'text-green-700 dark:text-green-300', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  { tier: 'starter', label: 'Starter', minPoints: 50, color: 'text-gray-700 dark:text-gray-300', bgColor: 'bg-gray-100 dark:bg-slate-800' },
  { tier: 'rookie', label: 'Rookie', minPoints: 0, color: 'text-gray-500 dark:text-gray-400', bgColor: 'bg-gray-50 dark:bg-slate-800' },
]

export function getTierForPoints(points: number): TierInfo {
  for (const tier of REPUTATION_TIERS) {
    if (points >= tier.minPoints) return tier
  }
  return REPUTATION_TIERS[REPUTATION_TIERS.length - 1]
}

export function getNextTier(points: number): TierInfo | null {
  const current = getTierForPoints(points)
  const idx = REPUTATION_TIERS.indexOf(current)
  return idx > 0 ? REPUTATION_TIERS[idx - 1] : null
}

export function getProgressToNextTier(points: number): number {
  const current = getTierForPoints(points)
  const next = getNextTier(points)
  if (!next) return 100
  const range = next.minPoints - current.minPoints
  const progress = points - current.minPoints
  return Math.min(Math.round((progress / range) * 100), 100)
}
