'use client'

import type { UserRole } from '@/types/community'

interface Props {
  role: UserRole
}

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string }> = {
  registered: { label: 'Member', color: 'text-gray-600', bg: 'bg-gray-100' },
  contributor: { label: 'Contributor', color: 'text-green-700', bg: 'bg-green-100' },
  editor: { label: 'Editor', color: 'text-blue-700', bg: 'bg-blue-100' },
  admin: { label: 'Admin', color: 'text-red-700', bg: 'bg-red-100' },
}

export function RoleBadge({ role }: Props) {
  const config = ROLE_CONFIG[role]

  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  )
}
