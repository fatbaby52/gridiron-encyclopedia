import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-grass-dark mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Incomplete Pass</h2>
      <p className="text-gray-500 mb-8">
        The page you&apos;re looking for doesn&apos;t exist. It might have been moved, or maybe the
        route was broken up by the defense.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-grass text-white font-semibold rounded-lg hover:bg-grass-dark transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/fundamentals"
          className="px-6 py-3 border border-grass text-grass-dark font-semibold rounded-lg hover:bg-grass/5 transition-colors"
        >
          Browse Fundamentals
        </Link>
      </div>
    </div>
  )
}
