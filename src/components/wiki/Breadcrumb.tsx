import Link from 'next/link'

interface BreadcrumbProps {
  category: string
  title: string
}

export function Breadcrumb({ category, title }: BreadcrumbProps) {
  const parts = category.split('/')
  const crumbs = parts.map((part, i) => ({
    label: part
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    href: '/' + parts.slice(0, i + 1).join('/'),
  }))

  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 flex-wrap">
      <Link href="/" className="hover:text-grass-dark transition-colors">
        Home
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <span>/</span>
          <Link href={crumb.href} className="hover:text-grass-dark transition-colors">
            {crumb.label}
          </Link>
        </span>
      ))}
      <span>/</span>
      <span className="text-gray-700 font-medium">{title}</span>
    </nav>
  )
}
