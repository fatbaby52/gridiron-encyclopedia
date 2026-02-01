'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import { UserRow } from '@/components/admin/UserRow'

interface UserRecord {
  id: string
  username: string
  displayName: string
  role: string
  reputation: number
}

export default function UsersPage() {
  const router = useRouter()
  const { user, initialized: authInit } = useAuthStore()
  const { profile } = useProfileStore()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    if (authInit && (!user || (profile && profile.role !== 'admin'))) {
      router.push('/')
    }
  }, [authInit, user, profile, router])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/users?page=${page}&pageSize=20`)
        if (res.ok) {
          const json = await res.json()
          setUsers(json.data ?? [])
          setHasMore(json.hasMore ?? false)
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false)
      }
    }
    if (user && profile && profile.role === 'admin') {
      load()
    }
  }, [user, profile, page])

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role } : u)),
        )
      }
    } catch {
      // silent fail
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
      <p className="text-sm text-gray-500 mb-6">
        View all users and manage their role assignments.
      </p>

      {users.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">No users found.</p>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <UserRow key={u.id} user={u} onRoleChange={handleRoleChange} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
