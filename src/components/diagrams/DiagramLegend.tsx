export function DiagramLegend() {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-3 text-xs text-gray-600">
      <div className="flex items-center gap-1.5">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" fill="white" stroke="#2d5a27" strokeWidth="1.5" />
        </svg>
        <span>Offense</span>
      </div>
      <div className="flex items-center gap-1.5">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <line x1="3" y1="3" x2="13" y2="13" stroke="#cc3333" strokeWidth="2" />
          <line x1="13" y1="3" x2="3" y2="13" stroke="#cc3333" strokeWidth="2" />
        </svg>
        <span>Defense</span>
      </div>
      <div className="flex items-center gap-1.5">
        <svg width="24" height="16" viewBox="0 0 24 16">
          <line x1="2" y1="8" x2="18" y2="8" stroke="white" strokeWidth="1.5" />
          <polygon points="16 4, 22 8, 16 12" fill="white" />
        </svg>
        <span>Route</span>
      </div>
      <div className="flex items-center gap-1.5">
        <svg width="24" height="16" viewBox="0 0 24 16">
          <line x1="2" y1="8" x2="18" y2="8" stroke="#c9a227" strokeWidth="1.5" />
          <polygon points="16 4, 22 8, 16 12" fill="#c9a227" />
        </svg>
        <span>Block</span>
      </div>
      <div className="flex items-center gap-1.5">
        <svg width="24" height="16" viewBox="0 0 24 16">
          <line x1="2" y1="8" x2="22" y2="8" stroke="#c9a227" strokeWidth="2" strokeDasharray="6 3" />
        </svg>
        <span>LOS</span>
      </div>
    </div>
  )
}
