'use client'

import { useRef, useCallback } from 'react'
import { useDesignerStore } from '@/stores/designerStore'

const SCALE = 4 // coordinate * 4 = SVG pixel
const WIDTH = 400
const HEIGHT = 300

function getSvgCoords(
  e: React.MouseEvent | React.PointerEvent,
  svg: SVGSVGElement,
): [number, number] {
  const rect = svg.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * WIDTH
  const y = ((e.clientY - rect.top) / rect.height) * HEIGHT
  return [Math.round(x / SCALE), Math.round(y / SCALE)]
}

export function DesignerCanvas() {
  const svgRef = useRef<SVGSVGElement>(null)
  const isDrawingRef = useRef(false)

  const {
    offensePlayers,
    defensePlayers,
    offenseAssignments,
    defenseAssignments,
    activeTool,
    selectedPlayerId,
    showDefense,
    isFlipped,
    drawingPath,
    setSelectedPlayer,
    updatePlayerPosition,
    addPlayer,
    removePlayer,
    addDrawingPoint,
    clearDrawingPath,
    commitDrawing,
  } = useDesignerStore()

  // When flipped, mirror y around the center of the field (logical y=37.5)
  const displayY = (logicalY: number) => isFlipped ? (75 - logicalY) * SCALE : logicalY * SCALE
  const inputY = (rawY: number) => isFlipped ? 75 - rawY : rawY

  const handleSvgPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!svgRef.current) return
      const [rawX, rawY] = getSvgCoords(e, svgRef.current)
      const x = rawX
      const y = inputY(rawY)

      if (activeTool === 'addOffense') {
        addPlayer('offense', {
          id: '',
          position: 'WR',
          x,
          y,
          label: 'O',
        })
        return
      }

      if (activeTool === 'addDefense') {
        addPlayer('defense', {
          id: '',
          position: 'LB',
          x,
          y,
          label: 'X',
        })
        return
      }

      if (activeTool === 'drawRoute' || activeTool === 'drawBlock') {
        if (selectedPlayerId) {
          isDrawingRef.current = true
          clearDrawingPath()
          // Start from the player's position
          const player =
            offensePlayers.find((p) => p.id === selectedPlayerId) ||
            defensePlayers.find((p) => p.id === selectedPlayerId)
          if (player) {
            addDrawingPoint([player.x, player.y])
          }
          addDrawingPoint([x, y])
          ;(e.target as Element).setPointerCapture?.(e.pointerId)
        }
        return
      }
    },
    [
      activeTool,
      selectedPlayerId,
      offensePlayers,
      defensePlayers,
      addPlayer,
      clearDrawingPath,
      addDrawingPoint,
      inputY,
    ],
  )

  const handleSvgPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!svgRef.current || !isDrawingRef.current) return
      const [rawX, rawY] = getSvgCoords(e, svgRef.current)
      addDrawingPoint([rawX, inputY(rawY)])
    },
    [addDrawingPoint, inputY],
  )

  const handleSvgPointerUp = useCallback(() => {
    if (!isDrawingRef.current || !selectedPlayerId) return
    isDrawingRef.current = false

    const isOffense = offensePlayers.some((p) => p.id === selectedPlayerId)
    const side = isOffense ? 'offense' : 'defense'
    const type = activeTool === 'drawBlock' ? 'block' : 'route'

    commitDrawing(selectedPlayerId, type, side as 'offense' | 'defense')
  }, [selectedPlayerId, offensePlayers, activeTool, commitDrawing])

  const handlePlayerPointerDown = useCallback(
    (e: React.PointerEvent, playerId: string, side: 'offense' | 'defense') => {
      e.stopPropagation()

      if (activeTool === 'erase') {
        removePlayer(side, playerId)
        return
      }

      if (activeTool === 'drawRoute' || activeTool === 'drawBlock') {
        setSelectedPlayer(playerId)
        return
      }

      if (activeTool === 'select') {
        setSelectedPlayer(playerId)
        const svg = svgRef.current
        if (!svg) return

        ;(e.target as Element).setPointerCapture?.(e.pointerId)

        const onMove = (me: PointerEvent) => {
          const [rawX, rawY] = getSvgCoords(me as unknown as React.PointerEvent, svg)
          const clampedX = Math.max(2, Math.min(98, rawX))
          const clampedY = Math.max(2, Math.min(73, inputY(rawY)))
          updatePlayerPosition(side, playerId, clampedX, clampedY)
        }

        const onUp = () => {
          document.removeEventListener('pointermove', onMove)
          document.removeEventListener('pointerup', onUp)
        }

        document.addEventListener('pointermove', onMove)
        document.addEventListener('pointerup', onUp)
      }
    },
    [activeTool, setSelectedPlayer, removePlayer, updatePlayerPosition, inputY],
  )

  // Yard lines
  const yardLines = [60, 90, 120, 150, 180, 210, 240]

  // Simplify drawing path for display (take every 3rd point)
  const simplifiedPath =
    drawingPath.length > 2
      ? drawingPath.filter((_, i) => i === 0 || i === drawingPath.length - 1 || i % 3 === 0)
      : drawingPath

  const drawingPathD =
    simplifiedPath.length >= 2
      ? simplifiedPath
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0] * SCALE} ${displayY(p[1])}`)
          .join(' ')
      : ''

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full border border-gray-300 rounded-lg cursor-crosshair select-none touch-none"
      onPointerDown={handleSvgPointerDown}
      onPointerMove={handleSvgPointerMove}
      onPointerUp={handleSvgPointerUp}
      role="img"
      aria-label="Play designer field"
    >
      {/* Field background */}
      <rect width={WIDTH} height={HEIGHT} fill="#3d6b35" rx="4" />

      {/* Yard lines */}
      {yardLines.map((y) => (
        <line key={y} x1="20" y1={y} x2="380" y2={y} stroke="white" strokeWidth="0.5" opacity="0.3" />
      ))}

      {/* Hash marks */}
      {yardLines.map((y) => (
        <g key={`hash-${y}`}>
          <line x1="130" y1={y - 3} x2="130" y2={y + 3} stroke="white" strokeWidth="0.5" opacity="0.3" />
          <line x1="270" y1={y - 3} x2="270" y2={y + 3} stroke="white" strokeWidth="0.5" opacity="0.3" />
        </g>
      ))}

      {/* Sidelines */}
      <line x1="20" y1="30" x2="20" y2="270" stroke="white" strokeWidth="1" opacity="0.4" />
      <line x1="380" y1="30" x2="380" y2="270" stroke="white" strokeWidth="1" opacity="0.4" />

      {/* LOS */}
      <line x1="20" y1="150" x2="380" y2="150" stroke="#c9a227" strokeWidth="2" strokeDasharray="6 3" />

      {/* Arrow markers */}
      <defs>
        <marker id="arrow-o-design" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="white" />
        </marker>
        <marker id="arrow-d-design" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#cc3333" />
        </marker>
        <marker id="arrow-block-design" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#c9a227" />
        </marker>
      </defs>

      {/* Offense assignments */}
      {offenseAssignments.map((a, i) => {
        if (a.path.length < 2) return null
        const pathD = a.path.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p[0] * SCALE} ${displayY(p[1])}`).join(' ')
        const color = a.type === 'block' ? '#c9a227' : '#ffffff'
        const marker = a.type === 'block' ? 'url(#arrow-block-design)' : 'url(#arrow-o-design)'
        return (
          <path
            key={`oa-${a.playerId}-${i}`}
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            markerEnd={marker}
            strokeDasharray={a.style === 'dashed' ? '4 3' : a.style === 'dotted' ? '2 2' : undefined}
          />
        )
      })}

      {/* Defense assignments */}
      {showDefense &&
        defenseAssignments.map((a, i) => {
          if (a.path.length < 2) return null
          const pathD = a.path.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p[0] * SCALE} ${displayY(p[1])}`).join(' ')
          return (
            <path
              key={`da-${a.playerId}-${i}`}
              d={pathD}
              fill="none"
              stroke="#cc3333"
              strokeWidth="1.5"
              markerEnd="url(#arrow-d-design)"
            />
          )
        })}

      {/* Current drawing path */}
      {drawingPathD && (
        <path
          d={drawingPathD}
          fill="none"
          stroke={activeTool === 'drawBlock' ? '#c9a227' : '#ffff00'}
          strokeWidth="2"
          strokeDasharray="4 2"
          opacity="0.8"
        />
      )}

      {/* Offense players */}
      {offensePlayers.map((p) => {
        const cx = p.x * SCALE
        const cy = displayY(p.y)
        const isSelected = selectedPlayerId === p.id
        return (
          <g
            key={p.id}
            onPointerDown={(e) => handlePlayerPointerDown(e, p.id, 'offense')}
            className="cursor-grab active:cursor-grabbing"
          >
            {isSelected && (
              <circle cx={cx} cy={cy} r="14" fill="none" stroke="#ffff00" strokeWidth="2" strokeDasharray="3 2" />
            )}
            <circle cx={cx} cy={cy} r="10" fill="white" stroke="#2d5a27" strokeWidth="1.5" />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="7"
              fontWeight="bold"
              fill="#2d5a27"
              style={{ pointerEvents: 'none' }}
            >
              {p.label}
            </text>
          </g>
        )
      })}

      {/* Defense players */}
      {showDefense &&
        defensePlayers.map((p) => {
          const cx = p.x * SCALE
          const cy = displayY(p.y)
          const isSelected = selectedPlayerId === p.id
          return (
            <g
              key={p.id}
              onPointerDown={(e) => handlePlayerPointerDown(e, p.id, 'defense')}
              className="cursor-grab active:cursor-grabbing"
            >
              {isSelected && (
                <circle cx={cx} cy={cy} r="14" fill="none" stroke="#ffff00" strokeWidth="2" strokeDasharray="3 2" />
              )}
              <line x1={cx - 7} y1={cy - 7} x2={cx + 7} y2={cy + 7} stroke="#cc3333" strokeWidth="2" />
              <line x1={cx + 7} y1={cy - 7} x2={cx - 7} y2={cy + 7} stroke="#cc3333" strokeWidth="2" />
              <text
                x={cx}
                y={cy - 12}
                textAnchor="middle"
                fontSize="6"
                fill="white"
                opacity="0.9"
                style={{ pointerEvents: 'none' }}
              >
                {p.label}
              </text>
            </g>
          )
        })}
    </svg>
  )
}
