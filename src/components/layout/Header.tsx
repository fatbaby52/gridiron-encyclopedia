'use client'

import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { UserMenu } from '@/components/auth/UserMenu'
import { NAV_ITEMS } from '@/lib/constants'
import { useUIStore } from '@/stores/uiStore'

export function Header() {
  const { toggleSearch, toggleChat, toggleMobileMenu } = useUIStore()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-grass-dark transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/designer"
            className="text-sm font-medium text-gold hover:text-gold-light transition-colors"
          >
            Play Designer
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSearch}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Search"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <button
            onClick={toggleChat}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-grass text-white text-sm font-medium rounded-lg hover:bg-grass-dark transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Ask AI
          </button>

          <UserMenu />

          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
