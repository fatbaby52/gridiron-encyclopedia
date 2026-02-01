interface BadgeProps {
  children: React.ReactNode
  color?: 'grass' | 'gold' | 'leather' | 'gray'
}

const colors = {
  grass: 'bg-grass/10 text-grass-dark',
  gold: 'bg-gold/10 text-gold',
  leather: 'bg-leather/10 text-leather',
  gray: 'bg-gray-100 text-gray-600',
}

export function Badge({ children, color = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}
