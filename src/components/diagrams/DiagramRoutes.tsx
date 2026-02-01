import type { Assignment } from '@/types'

interface DiagramRoutesProps {
  assignments: Assignment[]
  side: 'offense' | 'defense'
}

function getStrokeDasharray(style?: string): string {
  switch (style) {
    case 'dashed':
      return '4 3'
    case 'dotted':
      return '2 2'
    default:
      return 'none'
  }
}

function getColor(type: string, side: string): string {
  if (side === 'defense') return '#cc3333'
  switch (type) {
    case 'block':
      return '#c9a227'
    default:
      return '#ffffff'
  }
}

export function DiagramRoutes({ assignments, side }: DiagramRoutesProps) {
  return (
    <g>
      <defs>
        <marker id={`arrow-${side}`} markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={side === 'offense' ? 'white' : '#cc3333'} />
        </marker>
        <marker id="arrow-block" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#c9a227" />
        </marker>
      </defs>

      {assignments.map((a, i) => {
        if (a.path.length < 2) return null
        const color = getColor(a.type, side)
        const dashArray = getStrokeDasharray(a.style)
        const markerId = a.type === 'block' ? 'arrow-block' : `arrow-${side}`

        const pathD = a.path
          .map((point, j) => {
            const x = point[0] * 4
            const y = point[1] * 4
            return j === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
          })
          .join(' ')

        return (
          <path
            key={`${a.playerId}-${i}`}
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray={dashArray}
            markerEnd={`url(#${markerId})`}
          />
        )
      })}
    </g>
  )
}
