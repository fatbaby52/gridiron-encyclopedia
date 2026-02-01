'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import { ReputationBadge } from '@/components/community/ReputationBadge'

export function UserMenu() {
  const { user, initialized, signOut } = useAuthStore()
  const { profile } = useProfileStore()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  if (!initialized) return null

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="text-sm text-gray-600 hover:text-grass-dark font-medium transition-colors"
      >
        Sign In
      </Link>
    )
  }

  const displayName = profile?.displayName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        aria-label="User menu"
      >
        <div className="w-8 h-8 rounded-full bg-grass text-white flex items-center justify-center text-sm font-bold hover:bg-grass-dark transition-colors">
          {initial}
        </div>
        {profile && <ReputationBadge points={profile.reputation} showLabel={false} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            {profile && (
              <div className="mt-1">
                <ReputationBadge points={profile.reputation} size="sm" />
              </div>
            )}
          </div>
          <Link
            href={profile ? `/profile/${profile.username}` : '/profile/edit'}
            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            My Profile
          </Link>
          <Link
            href="/favorites"
            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Favorites
          </Link>
          <Link
            href="/reading-history"
            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Reading History
          </Link>
          {profile && (profile.role === 'editor' || profile.role === 'admin') && (
            <Link
              href="/admin"
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Admin
            </Link>
          )}
          <div className="border-t border-gray-100">
            <button
              onClick={() => {
                signOut()
                setIsOpen(false)
              }}
              className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
