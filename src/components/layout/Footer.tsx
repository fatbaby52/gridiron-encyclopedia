import Link from 'next/link'
import { SITE_NAME } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="bg-turf text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">{SITE_NAME}</h3>
            <p className="text-gray-300 text-sm">
              The comprehensive American football knowledge base for coaches, players, and fans.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Browse</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/offense" className="hover:text-gold transition-colors">Offense</Link></li>
              <li><Link href="/defense" className="hover:text-gold transition-colors">Defense</Link></li>
              <li><Link href="/fundamentals" className="hover:text-gold transition-colors">Fundamentals</Link></li>
              <li><Link href="/strategy" className="hover:text-gold transition-colors">Strategy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Tools & Resources</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/designer" className="hover:text-gold transition-colors">Play Designer</Link></li>
              <li><Link href="/reference/glossary" className="hover:text-gold transition-colors">Glossary</Link></li>
              <li><Link href="/history" className="hover:text-gold transition-colors">History</Link></li>
              <li><Link href="/resources" className="hover:text-gold transition-colors">Free Downloads</Link></li>
              <li><Link href="/favorites" className="hover:text-gold transition-colors">Favorites</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <p className="mt-2 text-xs">
            Some links may be affiliate links. We may earn a commission at no extra cost to you.
          </p>
        </div>
      </div>
    </footer>
  )
}
