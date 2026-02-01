import Link from 'next/link'

interface CategoryCardProps {
  label: string
  description: string
  href: string
  icon: string
}

export function CategoryCard({ label, description, href, icon }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="block p-6 rounded-xl border border-gray-200 hover:border-grass/50 hover:shadow-lg transition-all group"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 group-hover:text-grass-dark transition-colors">
        {label}
      </h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Link>
  )
}
