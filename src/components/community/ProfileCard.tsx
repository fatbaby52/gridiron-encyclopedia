'use client'

import Link from 'next/link'
import type { UserProfile } from '@/types/community'
import { ReputationBadge } from './ReputationBadge'
import { RoleBadge } from './RoleBadge'

interface Props {
  profile: UserProfile
  compact?: boolean
}

export function ProfileCard({ profile, compact = false }: Props) {
  const initial = (profile.displayName || profile.username).charAt(0).toUpperCase()

  if (compact) {
    return (
      <Link
        href={`/profile/${profile.username}`}
        className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-6 h-6 rounded-full bg-grass text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <span className="text-sm font-medium text-gray-900">
          {profile.displayName || profile.username}
        </span>
      </Link>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-grass text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/profile/${profile.username}`}
              className="text-lg font-bold text-gray-900 hover:text-grass-dark transition-colors"
            >
              {profile.displayName || profile.username}
            </Link>
            <RoleBadge role={profile.role} />
          </div>
          <p className="text-sm text-gray-500">@{profile.username}</p>
          <div className="mt-1">
            <ReputationBadge points={profile.reputation} />
          </div>
          {profile.bio && (
            <p className="mt-2 text-sm text-gray-700 line-clamp-2">{profile.bio}</p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            {profile.favoriteTeam && <span>{profile.favoriteTeam}</span>}
            {profile.coachingLevel && <span>{profile.coachingLevel}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
