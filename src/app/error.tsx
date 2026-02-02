'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-grass-dark mb-4">Fumble!</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Play Blown Dead</h2>
      <p className="text-gray-500 mb-8">
        Something went wrong on our end. The play has been whistled dead &mdash; but
        you can always line up and try again.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-grass text-white font-semibold rounded-lg hover:bg-grass-dark transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-grass text-grass-dark font-semibold rounded-lg hover:bg-grass/5 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
