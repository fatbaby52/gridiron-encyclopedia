'use client'

import type { UserRole } from '@/types/community'

interface Props {
  user: {
    id: string
    username: string
    displayName: string
    role: string
    reputation: number
  }
  onRoleChange: (id: string, role: string) => void
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'registered', label: 'Registered' },
  { value: 'contributor', label: 'Contributor' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
]

export function UserRow({ user, onRoleChange }: Props) {
  return (
    <div className="flex items-center gap-4 border border-gray-200 rounded-lg p-4">
      {/* Avatar placeholder */}
      <div className="w-10 h-10 rounded-full bg-grass/20 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-grass">
          {(user.displayName || user.username).charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.displayName || user.username}
        </p>
        <p className="text-xs text-gray-500">@{user.username}</p>
      </div>

      <div className="text-right flex-shrink-0 mr-2">
        <p className="text-xs text-gray-400">Reputation</p>
        <p className="text-sm font-semibold text-gray-700">{user.reputation}</p>
      </div>

      <select
        value={user.role}
        onChange={(e) => onRoleChange(user.id, e.target.value)}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-grass/50 focus:border-grass"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  )
}
