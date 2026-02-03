'use client'

import { useState, useEffect } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

function extractHeadings(mdxContent: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const headings: TocItem[] = []
  let match

  while ((match = headingRegex.exec(mdxContent)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    headings.push({ id, text, level })
  }

  return headings
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState('')
  const headings = extractHeadings(content)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' },
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className="hidden xl:block w-56 shrink-0">
      <div className="sticky top-20">
        <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          On this page
        </h4>
        <ul className="space-y-1.5 text-sm border-l border-gray-200 dark:border-slate-700">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={`block pl-3 py-0.5 transition-colors border-l-2 -ml-px ${
                  activeId === h.id
                    ? 'border-grass text-grass-dark font-medium'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                } ${h.level === 3 ? 'pl-6' : ''}`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
