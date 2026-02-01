'use client'

import { useDesignerStore, type DesignerTool } from '@/stores/designerStore'
import { OFFENSE_FORMATIONS, DEFENSE_FORMATIONS } from '@/lib/formations'

const TOOLS: { id: DesignerTool; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'select',
    label: 'Select',
    description: 'Drag players to reposition',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
  },
  {
    id: 'addOffense',
    label: 'Add O',
    description: 'Click field to add offense player',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="10" y1="6" x2="10" y2="14" stroke="currentColor" strokeWidth="2" />
        <line x1="6" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'addDefense',
    label: 'Add D',
    description: 'Click field to add defense player',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20">
        <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="2" />
        <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="2" />
        <line x1="10" y1="3" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    id: 'drawRoute',
    label: 'Route',
    description: 'Select player, then draw route on field',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20">
        <polyline points="4,16 8,8 14,12 18,4" fill="none" stroke="currentColor" strokeWidth="2" />
        <polygon points="17,2 20,5 16,5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'drawBlock',
    label: 'Block',
    description: 'Select player, then draw blocking path',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20">
        <line x1="4" y1="16" x2="16" y2="6" stroke="#c9a227" strokeWidth="2.5" />
        <polygon points="15,4 18,7 14,7" fill="#c9a227" />
      </svg>
    ),
  },
  {
    id: 'erase',
    label: 'Erase',
    description: 'Click a player to remove',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
]

export function DesignerSidebar() {
  const {
    activeTool,
    setActiveTool,
    selectedPlayerId,
    showDefense,
    setShowDefense,
    isFlipped,
    toggleFlip,
    loadFormation,
    offensePlayers,
    defensePlayers,
    updatePlayerLabel,
    removeAssignment,
  } = useDesignerStore()

  const selectedPlayer =
    offensePlayers.find((p) => p.id === selectedPlayerId) ||
    defensePlayers.find((p) => p.id === selectedPlayerId)

  const selectedSide = offensePlayers.some((p) => p.id === selectedPlayerId)
    ? 'offense'
    : 'defense'

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      {/* Tools */}
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Tools</h3>
        <div className="grid grid-cols-3 gap-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-md text-xs transition-colors ${
                activeTool === tool.id
                  ? 'bg-grass/10 text-grass-dark border border-grass/30'
                  : 'hover:bg-gray-50 text-gray-600 border border-transparent'
              }`}
              title={tool.description}
            >
              {tool.icon}
              <span className="text-[10px]">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View options */}
      <div className="px-3 py-2 border-b border-gray-100">
        <button
          onClick={toggleFlip}
          className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors ${
            isFlipped
              ? 'bg-grass/10 text-grass-dark border border-grass/30'
              : 'hover:bg-gray-50 text-gray-600 border border-transparent'
          }`}
          title="Flip field orientation"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Flip Field
          <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${
            isFlipped ? 'bg-grass/20 text-grass-dark' : 'bg-gray-100 text-gray-400'
          }`}>
            {isFlipped ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Selected player info */}
      {selectedPlayer && (activeTool === 'select' || activeTool === 'drawRoute' || activeTool === 'drawBlock') && (
        <div className="p-3 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Selected Player</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500">Label</label>
              <input
                type="text"
                value={selectedPlayer.label}
                onChange={(e) =>
                  updatePlayerLabel(selectedSide as 'offense' | 'defense', selectedPlayer.id, e.target.value)
                }
                className="block w-full mt-0.5 px-2 py-1 text-sm border border-gray-200 rounded"
                maxLength={3}
              />
            </div>
            <div className="text-xs text-gray-400">
              Position: ({selectedPlayer.x}, {selectedPlayer.y})
            </div>
            <button
              onClick={() => removeAssignment(selectedSide as 'offense' | 'defense', selectedPlayer.id)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear assignment
            </button>
          </div>
        </div>
      )}

      {/* Offense formations */}
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Offense Formations</h3>
        <div className="space-y-1">
          {OFFENSE_FORMATIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => loadFormation('offense', f.players)}
              className="block w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-50 transition-colors"
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Defense formations */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase">Defense Formations</h3>
          <button
            onClick={() => setShowDefense(!showDefense)}
            className={`text-xs px-1.5 py-0.5 rounded ${
              showDefense ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {showDefense ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="space-y-1">
          {DEFENSE_FORMATIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => loadFormation('defense', f.players)}
              className="block w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={!showDefense}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Help text */}
      <div className="p-3 mt-auto">
        <div className="text-xs text-gray-400 space-y-1">
          <p className="font-medium text-gray-500">Quick tips:</p>
          <p>Select a formation to start</p>
          <p>Drag players to move them</p>
          <p>Select a player, then use Route/Block tool to draw</p>
          <p>Drafts auto-save to your browser</p>
        </div>
      </div>
    </div>
  )
}
