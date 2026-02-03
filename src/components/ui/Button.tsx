import Link from 'next/link'

interface ButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const variants = {
  primary: 'bg-grass text-white hover:bg-grass-dark',
  secondary: 'bg-white dark:bg-slate-900 text-grass-dark border border-grass hover:bg-grass/5',
  ghost: 'text-gray-600 dark:text-gray-400 hover:text-grass-dark hover:bg-gray-100 dark:hover:bg-slate-800',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
