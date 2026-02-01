'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Fuse, { type IFuseOptions } from 'fuse.js'
import { useUIStore } from '@/stores/uiStore'
import type { ArticleListItem } from '@/types'

const FUSE_OPTIONS: IFuseOptions<ArticleListItem> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'tags', weight: 0.3 },
    { name: 'category', weight: 0.15 },
    { name: 'description', weight: 0.15 },
  ],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2,
}

let articleCache: ArticleListItem[] | null = null

function loadArticles(): Promise<ArticleListItem[]> {
  if (articleCache) return Promise.resolve(articleCache)
  return fetch('/search-index.json')
    .then((r) => r.json())
    .then((data: ArticleListItem[]) => {
      articleCache = data
      return data
    })
}

export function SearchModal() {
  const { isSearchOpen, closeSearch } = useUIStore()
  const [query, setQuery] = useState('')
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const fuse = useMemo(() => {
    if (articles.length === 0) return null
    return new Fuse(articles, FUSE_OPTIONS)
  }, [articles])

  const results = useMemo(() => {
    if (!fuse || !query.trim()) return []
    return fuse.search(query, { limit: 10 }).map((h) => h.item)
  }, [fuse, query])

  useEffect(() => {
    if (isSearchOpen) {
      loadArticles().then(setArticles).catch(() => {})
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isSearchOpen])

  const handleClose = useCallback(() => {
    setQuery('')
    closeSearch()
  }, [closeSearch])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        useUIStore.getState().toggleSearch()
      }
      if (e.key === 'Escape' && isSearchOpen) {
        handleClose()
      }
    },
    [isSearchOpen, handleClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
          >
            <div className="bg-white rounded-xl shadow-2xl mx-4 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="flex-1 text-sm outline-none"
                />
                <kbd className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  ESC
                </kbd>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {query && results.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    No articles found for &quot;{query}&quot;
                  </div>
                )}
                {results.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/${article.category}/${article.slug}`}
                    onClick={handleClose}
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <div className="text-sm font-medium text-gray-900">{article.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{article.category}</div>
                  </Link>
                ))}
                {!query && (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    Type to search the encyclopedia...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
