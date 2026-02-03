'use client'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = []

  // Always include first page
  pages.push(1)

  // Calculate the range around the current page
  const rangeStart = Math.max(2, current - 1)
  const rangeEnd = Math.min(total - 1, current + 1)

  // Add leading ellipsis if needed
  if (rangeStart > 2) {
    pages.push('ellipsis')
  }

  // Add pages around current
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i)
  }

  // Add trailing ellipsis if needed
  if (rangeEnd < total - 1) {
    pages.push('ellipsis')
  }

  // Always include last page
  pages.push(total)

  return pages
}

export function Pagination({ page, totalPages, onPageChange, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null

  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={`flex items-center justify-center gap-1 ${className}`}
    >
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Go to previous page"
        className="px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:hover:bg-transparent"
      >
        Previous
      </button>

      {/* Page Numbers */}
      <div className="hidden sm:flex items-center gap-1">
        {pageNumbers.map((entry, index) => {
          if (entry === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-2 text-sm text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              >
                ...
              </span>
            )
          }

          const isCurrent = entry === page

          return (
            <button
              key={entry}
              onClick={() => onPageChange(entry)}
              disabled={isCurrent}
              aria-label={`Go to page ${entry}`}
              aria-current={isCurrent ? 'page' : undefined}
              className={`min-w-[2.25rem] px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                isCurrent
                  ? 'bg-grass text-white cursor-default'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              {entry}
            </button>
          )
        })}
      </div>

      {/* Mobile page indicator */}
      <span className="sm:hidden text-sm text-gray-500 dark:text-gray-400 px-2">
        Page {page} of {totalPages}
      </span>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Go to next page"
        className="px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:hover:bg-transparent"
      >
        Next
      </button>
    </nav>
  )
}
