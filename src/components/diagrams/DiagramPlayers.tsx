import type { PlayerPosition } from '@/types'

interface DiagramPlayersProps {
  offense: PlayerPosition[]
  defense: PlayerPosition[]
}

export function DiagramPlayers({ offense, defense }: DiagramPlayersProps) {
  return (
    <g>
      {offense.map((p) => (
        <g key={p.id}>
          <circle cx={p.x * 4} cy={p.y * 4} r="10" fill="white" stroke="#2d5a27" strokeWidth="1.5" />
          <text
            x={p.x * 4}
            y={p.y * 4}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="7"
            fontWeight="bold"
            fill="#2d5a27"
          >
            {p.label}
          </text>
        </g>
      ))}

      {defense.map((p) => {
        const cx = p.x * 4
        const cy = p.y * 4
        return (
          <g key={p.id}>
            <line x1={cx - 7} y1={cy - 7} x2={cx + 7} y2={cy + 7} stroke="#cc3333" strokeWidth="2" />
            <line x1={cx + 7} y1={cy - 7} x2={cx - 7} y2={cy + 7} stroke="#cc3333" strokeWidth="2" />
            <text x={cx} y={cy - 12} textAnchor="middle" fontSize="6" fill="white" opacity="0.9">
              {p.label}
            </text>
          </g>
        )
      })}
    </g>
  )
}
