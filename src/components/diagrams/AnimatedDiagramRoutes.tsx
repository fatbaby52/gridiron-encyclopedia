'use client'

import { useRef, useEffect } from 'react'
import type { Assignment } from '@/types'

interface AnimatedDiagramRoutesProps {
  assignments: Assignment[]
  side: 'offense' | 'defense'
  progress: number // 0 to 1
}

function getStrokeDasharray(style?: string): string {
  switch (style) {
    case 'dashed':
      return '4 3'
    case 'dotted':
      return '2 2'
    default:
      return ''
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

function buildPathD(path: [number, number][]): string {
  return path
    .map((point, j) => {
      const x = point[0] * 4
      const y = point[1] * 4
      return j === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    })
    .join(' ')
}

function AnimatedPath({
  assignment,
  side,
  progress,
}: {
  assignment: Assignment
  side: string
  progress: number
}) {
  const pathRef = useRef<SVGPathElement>(null)

  const color = getColor(assignment.type, side)
  const dashArray = getStrokeDasharray(assignment.style)
  const pathD = buildPathD(assignment.path)
  const markerId = assignment.type === 'block' ? 'arrow-block-anim' : `arrow-${side}-anim`

  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const totalLength = path.getTotalLength()
    path.style.strokeDasharray = `${totalLength}`
    path.style.strokeDashoffset = `${totalLength * (1 - progress)}`
  }, [progress])

  if (assignment.path.length < 2) return null

  return (
    <path
      ref={pathRef}
      d={pathD}
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeDasharray={dashArray || undefined}
      markerEnd={progress >= 0.95 ? `url(#${markerId})` : undefined}
      style={{
        transition: 'stroke-dashoffset 0.4s ease-out',
        strokeDasharray: '1000',
        strokeDashoffset: '1000',
      }}
    />
  )
}

export function AnimatedDiagramRoutes({
  assignments,
  side,
  progress,
}: AnimatedDiagramRoutesProps) {
  return (
    <g>
      <defs>
        <marker
          id={`arrow-${side}-anim`}
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 8 3, 0 6"
            fill={side === 'offense' ? 'white' : '#cc3333'}
          />
        </marker>
        <marker
          id="arrow-block-anim"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#c9a227" />
        </marker>
      </defs>

      {assignments.map((a, i) => (
        <AnimatedPath
          key={`${a.playerId}-${i}`}
          assignment={a}
          side={side}
          progress={progress}
        />
      ))}
    </g>
  )
}
