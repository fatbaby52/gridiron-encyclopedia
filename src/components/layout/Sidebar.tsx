'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CATEGORIES, type CategoryKey } from '@/lib/constants'

const SUBCATEGORIES: Record<string, { label: string; href: string }[]> = {
  offense: [
    { label: 'Formations', href: '/offense/formations' },
    { label: 'Run Schemes', href: '/offense/schemes/run' },
    { label: 'Pass Concepts', href: '/offense/concepts/pass' },
    { label: 'Systems', href: '/offense/systems' },
  ],
  defense: [
    { label: 'Fronts', href: '/defense/fronts' },
    { label: 'Coverages', href: '/defense/coverages' },
    { label: 'Pressures', href: '/defense/pressures' },
  ],
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <nav className="sticky top-20 space-y-4 pr-4">
        {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
          const cat = CATEGORIES[key]
          const isActive = pathname.startsWith(`/${key}`)
          const subs = SUBCATEGORIES[key]

          return (
            <div key={key}>
              <Link
                href={`/${key}`}
                className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-grass/10 text-grass-dark'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </Link>
              {subs && isActive && (
                <ul className="ml-4 mt-1 space-y-1">
                  {subs.map((sub) => (
                    <li key={sub.href}>
                      <Link
                        href={sub.href}
                        className={`block px-3 py-1.5 text-sm rounded transition-colors ${
                          pathname.startsWith(sub.href)
                            ? 'text-grass-dark font-medium'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
