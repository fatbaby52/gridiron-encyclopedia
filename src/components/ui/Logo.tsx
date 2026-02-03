import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="w-8 h-8 bg-grass rounded-md flex items-center justify-center">
        <span className="text-white font-bold text-sm">GE</span>
      </div>
      <span className="text-lg font-bold text-grass-dark dark:text-grass-light hidden sm:inline">
        Gridiron Encyclopedia
      </span>
    </Link>
  )
}
