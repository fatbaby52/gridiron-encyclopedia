import { LEVEL_LABELS, LEVEL_COLORS } from '@/lib/constants'

interface LevelBadgeProps {
  level: string
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[level] || 'bg-gray-100 text-gray-800'}`}
    >
      {LEVEL_LABELS[level] || level.toUpperCase()}
    </span>
  )
}
