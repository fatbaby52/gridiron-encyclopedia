'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV_ITEMS } from '@/lib/constants'
import { useUIStore } from '@/stores/uiStore'

export function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu, toggleSearch, toggleChat } = useUIStore()

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeMobileMenu}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-50 shadow-xl"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-bold text-grass-dark dark:text-grass-light">Menu</span>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="block px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-4">
                <Link
                  href="/designer"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2.5 rounded-lg text-gold font-semibold hover:bg-gold/10 transition-colors"
                >
                  Play Designer
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 space-y-2">
                <button
                  onClick={() => {
                    closeMobileMenu()
                    toggleSearch()
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
                <button
                  onClick={() => {
                    closeMobileMenu()
                    toggleChat()
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-grass-dark dark:text-grass-light hover:bg-grass/10 rounded-lg font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Ask AI
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
