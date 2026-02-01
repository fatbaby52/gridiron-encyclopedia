import Link from 'next/link'
import { getAllArticles } from '@/lib/mdx'
import { CATEGORIES, type CategoryKey } from '@/lib/constants'
import { CategoryCard } from '@/components/ui/CategoryCard'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { SearchModal } from '@/components/ui/SearchModal'
import { ChatPanel } from '@/components/ai/ChatPanel'

export default function HomePage() {
  const articles = getAllArticles()
  const featuredArticles = articles.slice(0, 6)

  const topCategories: CategoryKey[] = [
    'fundamentals',
    'offense',
    'defense',
    'strategy',
    'special-teams',
  ]

  return (
    <>
      <SearchModal />
      <ChatPanel />

      {/* Hero */}
      <section className="bg-gradient-to-br from-grass-dark to-turf text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Gridiron Encyclopedia</h1>
          <p className="text-lg md:text-xl text-grass-light max-w-2xl mx-auto mb-8">
            The comprehensive American football knowledge base. Plays, formations, strategies, and
            coaching concepts from high school to the NFL.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Link
              href="/fundamentals"
              className="w-full sm:w-auto px-6 py-3 bg-gold text-turf font-semibold rounded-lg hover:bg-gold-light transition-colors text-center"
            >
              Start Learning
            </Link>
            <Link
              href="/reference/glossary"
              className="w-full sm:w-auto px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors text-center"
            >
              Browse Glossary
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-grass-dark mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {topCategories.map((key) => {
            const cat = CATEGORIES[key]
            return (
              <CategoryCard
                key={key}
                label={cat.label}
                description={cat.description}
                href={`/${key}`}
                icon={cat.icon}
              />
            )
          })}
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-grass-dark mb-6">Featured Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Play Designer CTA */}
      <section className="bg-gradient-to-r from-turf to-grass-dark">
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-3">Play Designer</h2>
            <p className="text-grass-light mb-6 max-w-lg">
              Create your own plays with our drag-and-drop designer. Choose formations, draw
              routes, set blocking assignments, and export your plays as images or JSON.
            </p>
            <Link
              href="/designer"
              className="inline-block px-6 py-3 bg-gold text-turf font-semibold rounded-lg hover:bg-gold-light transition-colors"
            >
              Open Play Designer
            </Link>
          </div>
          <div className="w-full max-w-xs">
            <svg viewBox="0 0 200 150" className="w-full opacity-80">
              <rect width="200" height="150" fill="#3d6b35" rx="8" />
              <line x1="10" y1="75" x2="190" y2="75" stroke="#c9a227" strokeWidth="1.5" strokeDasharray="4 2" />
              <circle cx="100" cy="68" r="6" fill="white" stroke="#2d5a27" strokeWidth="1" />
              <circle cx="80" cy="62" r="6" fill="white" stroke="#2d5a27" strokeWidth="1" />
              <circle cx="120" cy="62" r="6" fill="white" stroke="#2d5a27" strokeWidth="1" />
              <circle cx="60" cy="68" r="6" fill="white" stroke="#2d5a27" strokeWidth="1" />
              <circle cx="140" cy="68" r="6" fill="white" stroke="#2d5a27" strokeWidth="1" />
              <polyline points="80,62 80,45 60,30" fill="none" stroke="white" strokeWidth="1.5" />
              <polyline points="120,62 120,45 140,30" fill="none" stroke="white" strokeWidth="1.5" />
              <polyline points="60,68 40,55" fill="none" stroke="white" strokeWidth="1.5" />
              <polyline points="140,68 160,55" fill="none" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </section>

      {/* AI CTA */}
      <section className="bg-chalk">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-grass-dark mb-3">Have a Football Question?</h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Our AI assistant can answer questions about plays, rules, strategy, and football
            history. Try it out.
          </p>
          <Link
            href="/fundamentals"
            className="inline-block px-6 py-3 bg-grass text-white font-semibold rounded-lg hover:bg-grass-dark transition-colors"
          >
            Explore Articles
          </Link>
        </div>
      </section>

      {/* About */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-grass-dark mb-3">About Gridiron Encyclopedia</h2>
          <p className="text-gray-600 leading-relaxed">
            Gridiron Encyclopedia is a free, comprehensive resource for learning about American
            football. Whether you&apos;re a new fan trying to understand the basics, a coach looking
            for scheme ideas, or a lifelong student of the game, we&apos;ve got you covered. Our
            articles cover everything from fundamental rules to advanced X&apos;s and O&apos;s, with
            play diagrams and coaching insights at every level.
          </p>
        </div>
      </section>
    </>
  )
}
