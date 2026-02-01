interface DiagramFieldProps {
  losY?: number
  children?: React.ReactNode
}

export function DiagramField({ losY = 150, children }: DiagramFieldProps) {
  const yardLines = [60, 90, 120, 150, 180, 210, 240]

  return (
    <svg viewBox="0 0 400 300" className="w-full max-w-lg mx-auto" role="img">
      <rect width="400" height="300" fill="#3d6b35" rx="4" />

      {yardLines.map((y) => (
        <line key={y} x1="20" y1={y} x2="380" y2={y} stroke="white" strokeWidth="0.5" opacity="0.3" />
      ))}

      {yardLines.map((y) => (
        <g key={`hash-${y}`}>
          <line x1="130" y1={y - 3} x2="130" y2={y + 3} stroke="white" strokeWidth="0.5" opacity="0.3" />
          <line x1="270" y1={y - 3} x2="270" y2={y + 3} stroke="white" strokeWidth="0.5" opacity="0.3" />
        </g>
      ))}

      <line x1="20" y1="30" x2="20" y2="270" stroke="white" strokeWidth="1" opacity="0.4" />
      <line x1="380" y1="30" x2="380" y2="270" stroke="white" strokeWidth="1" opacity="0.4" />

      <line x1="20" y1={losY} x2="380" y2={losY} stroke="#c9a227" strokeWidth="2" strokeDasharray="6 3" />

      {children}
    </svg>
  )
}
