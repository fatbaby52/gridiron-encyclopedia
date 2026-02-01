'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

const COMMUNITY_LINKS = [
  { label: 'Overview', href: '/community' },
  { label: 'Forum', href: '/community/forum' },
  { label: 'Gallery', href: '/gallery' },
]

const AUTH_LINKS = [
  { label: 'My Playbooks', href: '/playbooks' },
]

export function CommunityNav() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  const links = user ? [...COMMUNITY_LINKS, ...AUTH_LINKS] : COMMUNITY_LINKS

  return (
    <nav className="border-b border-gray-200 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto -mb-px">
          {links.map((link) => {
            const isActive =
              link.href === '/community'
                ? pathname === '/community'
                : pathname.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-grass text-grass-dark'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
