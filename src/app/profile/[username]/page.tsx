'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProfileCard } from '@/components/community/ProfileCard'
import { ReputationBadge } from '@/components/community/ReputationBadge'
import { getProgressToNextTier, getNextTier } from '@/lib/reputation'
import type { UserProfile } from '@/types/community'

export default function PublicProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(username)}`)
        if (!res.ok) {
          setError(res.status === 404 ? 'Profile not found' : 'Failed to load profile')
          return
        }
        const data = await res.json()
        setProfile(data)
      } catch {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [username])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-lg" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Profile not found'}</h1>
        <p className="text-gray-600">The profile you are looking for does not exist.</p>
      </div>
    )
  }

  const progress = getProgressToNextTier(profile.reputation)
  const nextTier = getNextTier(profile.reputation)
  const joinDate = new Date(profile.joinedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ProfileCard profile={profile} />

      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Reputation</h2>
        <div className="flex items-center gap-3 mb-2">
          <ReputationBadge points={profile.reputation} size="md" />
          {nextTier && (
            <span className="text-xs text-gray-500">
              {nextTier.minPoints - profile.reputation} points to {nextTier.label}
            </span>
          )}
        </div>
        {nextTier && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-grass h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Joined {joinDate}
      </div>
    </div>
  )
}
