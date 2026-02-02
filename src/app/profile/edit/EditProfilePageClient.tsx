'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'

export function EditProfilePageClient() {
  const router = useRouter()
  const { user, initialized: authInit } = useAuthStore()
  const { profile, initialized: profileInit, updateProfile } = useProfileStore()

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [favoriteTeam, setFavoriteTeam] = useState('')
  const [coachingLevel, setCoachingLevel] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (authInit && !user) {
      router.push('/auth/login')
    }
  }, [authInit, user, router])

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '')
      setBio(profile.bio || '')
      setFavoriteTeam(profile.favoriteTeam || '')
      setCoachingLevel(profile.coachingLevel || '')
    }
  }, [profile])

  if (!authInit || !profileInit || !profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        favoriteTeam: favoriteTeam.trim() || null,
        coachingLevel: coachingLevel.trim() || null,
      })
      setMessage('Profile updated successfully')
    } catch {
      setMessage('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grass/50 focus:border-grass"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grass/50 focus:border-grass resize-none"
            placeholder="Tell us about yourself..."
          />
          <p className="mt-1 text-xs text-gray-400">{bio.length}/500</p>
        </div>

        <div>
          <label htmlFor="favoriteTeam" className="block text-sm font-medium text-gray-700 mb-1">
            Favorite Team
          </label>
          <input
            id="favoriteTeam"
            type="text"
            value={favoriteTeam}
            onChange={(e) => setFavoriteTeam(e.target.value)}
            maxLength={50}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grass/50 focus:border-grass"
            placeholder="e.g., San Francisco 49ers"
          />
        </div>

        <div>
          <label htmlFor="coachingLevel" className="block text-sm font-medium text-gray-700 mb-1">
            Coaching Level
          </label>
          <select
            id="coachingLevel"
            value={coachingLevel}
            onChange={(e) => setCoachingLevel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grass/50 focus:border-grass bg-white"
          >
            <option value="">Select...</option>
            <option value="Fan">Fan</option>
            <option value="Youth Coach">Youth Coach</option>
            <option value="High School Coach">High School Coach</option>
            <option value="College Coach">College Coach</option>
            <option value="Professional Coach">Professional Coach</option>
            <option value="Analyst">Analyst</option>
            <option value="Player">Player</option>
          </select>
        </div>

        {message && (
          <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-grass text-white text-sm font-medium rounded-lg hover:bg-grass-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
