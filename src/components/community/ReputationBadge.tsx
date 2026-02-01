'use client'

import { getTierForPoints } from '@/lib/reputation'

interface Props {
  points: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function ReputationBadge({ points, showLabel = true, size = 'sm' }: Props) {
  const tier = getTierForPoints(points)

  const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${tier.bgColor} ${tier.color} ${sizeClasses}`}
      title={`${tier.label} - ${points} reputation`}
    >
      <span className="font-bold">{points}</span>
      {showLabel && <span>{tier.label}</span>}
    </span>
  )
}
