import { create } from 'zustand'
import type { PlayerPosition, Assignment, TimingStep, PlayDiagram } from '@/types'

export type DesignerTool = 'select' | 'addOffense' | 'addDefense' | 'drawRoute' | 'drawBlock' | 'erase'

export interface DesignerState {
  // Play data
  playName: string
  formationOffense: string
  formationDefense: string
  offensePlayers: PlayerPosition[]
  defensePlayers: PlayerPosition[]
  offenseAssignments: Assignment[]
  defenseAssignments: Assignment[]
  timingSteps: TimingStep[]
  tags: string[]

  // UI state
  activeTool: DesignerTool
  selectedPlayerId: string | null
  isDragging: boolean
  drawingPath: [number, number][]
  showDefense: boolean
  isFlipped: boolean
  hasUnsavedChanges: boolean

  // Actions
  setPlayName: (name: string) => void
  setActiveTool: (tool: DesignerTool) => void
  setSelectedPlayer: (id: string | null) => void
  setIsDragging: (dragging: boolean) => void
  setShowDefense: (show: boolean) => void
  toggleFlip: () => void

  addPlayer: (side: 'offense' | 'defense', player: PlayerPosition) => void
  updatePlayerPosition: (side: 'offense' | 'defense', id: string, x: number, y: number) => void
  removePlayer: (side: 'offense' | 'defense', id: string) => void
  updatePlayerLabel: (side: 'offense' | 'defense', id: string, label: string) => void

  addAssignment: (side: 'offense' | 'defense', assignment: Assignment) => void
  removeAssignment: (side: 'offense' | 'defense', playerId: string) => void

  addDrawingPoint: (point: [number, number]) => void
  clearDrawingPath: () => void
  commitDrawing: (playerId: string, type: Assignment['type'], side: 'offense' | 'defense') => void

  addTimingStep: (step: TimingStep) => void
  removeTimingStep: (stepNum: number) => void
  updateTimingStep: (stepNum: number, data: Partial<TimingStep>) => void

  loadFormation: (side: 'offense' | 'defense', players: PlayerPosition[]) => void
  loadPlay: (diagram: PlayDiagram) => void
  exportPlay: () => PlayDiagram
  reset: () => void

  // Autosave
  saveDraft: () => void
  loadDraft: () => boolean
}

let playerCounter = 100

function generatePlayerId(position: string): string {
  playerCounter++
  return `${position}-${playerCounter}`
}

const initialState = {
  playName: 'Untitled Play',
  formationOffense: 'custom',
  formationDefense: 'custom',
  offensePlayers: [] as PlayerPosition[],
  defensePlayers: [] as PlayerPosition[],
  offenseAssignments: [] as Assignment[],
  defenseAssignments: [] as Assignment[],
  timingSteps: [
    { step: 1, description: 'Snap', events: ['snap'] },
  ] as TimingStep[],
  tags: [] as string[],
  activeTool: 'select' as DesignerTool,
  selectedPlayerId: null as string | null,
  isDragging: false,
  drawingPath: [] as [number, number][],
  showDefense: true,
  isFlipped: false,
  hasUnsavedChanges: false,
}

export const useDesignerStore = create<DesignerState>((set, get) => ({
  ...initialState,

  setPlayName: (name) => set({ playName: name, hasUnsavedChanges: true }),
  setActiveTool: (tool) => set({ activeTool: tool, selectedPlayerId: null, drawingPath: [] }),
  setSelectedPlayer: (id) => set({ selectedPlayerId: id }),
  setIsDragging: (dragging) => set({ isDragging: dragging }),
  setShowDefense: (show) => set({ showDefense: show }),
  toggleFlip: () => set((s) => ({ isFlipped: !s.isFlipped })),

  addPlayer: (side, player) => {
    const p = { ...player, id: generatePlayerId(player.position) }
    if (side === 'offense') {
      set((s) => ({ offensePlayers: [...s.offensePlayers, p], hasUnsavedChanges: true }))
    } else {
      set((s) => ({ defensePlayers: [...s.defensePlayers, p], hasUnsavedChanges: true }))
    }
  },

  updatePlayerPosition: (side, id, x, y) => {
    if (side === 'offense') {
      set((s) => ({
        offensePlayers: s.offensePlayers.map((p) => (p.id === id ? { ...p, x, y } : p)),
        hasUnsavedChanges: true,
      }))
    } else {
      set((s) => ({
        defensePlayers: s.defensePlayers.map((p) => (p.id === id ? { ...p, x, y } : p)),
        hasUnsavedChanges: true,
      }))
    }
  },

  removePlayer: (side, id) => {
    if (side === 'offense') {
      set((s) => ({
        offensePlayers: s.offensePlayers.filter((p) => p.id !== id),
        offenseAssignments: s.offenseAssignments.filter((a) => a.playerId !== id),
        selectedPlayerId: s.selectedPlayerId === id ? null : s.selectedPlayerId,
        hasUnsavedChanges: true,
      }))
    } else {
      set((s) => ({
        defensePlayers: s.defensePlayers.filter((p) => p.id !== id),
        defenseAssignments: s.defenseAssignments.filter((a) => a.playerId !== id),
        selectedPlayerId: s.selectedPlayerId === id ? null : s.selectedPlayerId,
        hasUnsavedChanges: true,
      }))
    }
  },

  updatePlayerLabel: (side, id, label) => {
    if (side === 'offense') {
      set((s) => ({
        offensePlayers: s.offensePlayers.map((p) => (p.id === id ? { ...p, label } : p)),
        hasUnsavedChanges: true,
      }))
    } else {
      set((s) => ({
        defensePlayers: s.defensePlayers.map((p) => (p.id === id ? { ...p, label } : p)),
        hasUnsavedChanges: true,
      }))
    }
  },

  addAssignment: (side, assignment) => {
    if (side === 'offense') {
      set((s) => ({
        offenseAssignments: [
          ...s.offenseAssignments.filter((a) => a.playerId !== assignment.playerId),
          assignment,
        ],
        hasUnsavedChanges: true,
      }))
    } else {
      set((s) => ({
        defenseAssignments: [
          ...s.defenseAssignments.filter((a) => a.playerId !== assignment.playerId),
          assignment,
        ],
        hasUnsavedChanges: true,
      }))
    }
  },

  removeAssignment: (side, playerId) => {
    if (side === 'offense') {
      set((s) => ({
        offenseAssignments: s.offenseAssignments.filter((a) => a.playerId !== playerId),
        hasUnsavedChanges: true,
      }))
    } else {
      set((s) => ({
        defenseAssignments: s.defenseAssignments.filter((a) => a.playerId !== playerId),
        hasUnsavedChanges: true,
      }))
    }
  },

  addDrawingPoint: (point) => {
    set((s) => ({ drawingPath: [...s.drawingPath, point] }))
  },

  clearDrawingPath: () => set({ drawingPath: [] }),

  commitDrawing: (playerId, type, side) => {
    const { drawingPath } = get()
    if (drawingPath.length < 2) {
      set({ drawingPath: [] })
      return
    }
    const assignment: Assignment = {
      playerId,
      type,
      path: drawingPath,
      style: type === 'route' ? 'solid' : undefined,
    }
    get().addAssignment(side, assignment)
    set({ drawingPath: [] })
  },

  addTimingStep: (step) => {
    set((s) => ({ timingSteps: [...s.timingSteps, step], hasUnsavedChanges: true }))
  },

  removeTimingStep: (stepNum) => {
    set((s) => ({
      timingSteps: s.timingSteps
        .filter((t) => t.step !== stepNum)
        .map((t, i) => ({ ...t, step: i + 1 })),
      hasUnsavedChanges: true,
    }))
  },

  updateTimingStep: (stepNum, data) => {
    set((s) => ({
      timingSteps: s.timingSteps.map((t) => (t.step === stepNum ? { ...t, ...data } : t)),
      hasUnsavedChanges: true,
    }))
  },

  loadFormation: (side, players) => {
    if (side === 'offense') {
      set({
        offensePlayers: players,
        offenseAssignments: [],
        hasUnsavedChanges: true,
      })
    } else {
      set({
        defensePlayers: players,
        defenseAssignments: [],
        hasUnsavedChanges: true,
      })
    }
  },

  loadPlay: (diagram) => {
    set({
      playName: diagram.name,
      formationOffense: diagram.formation.offense,
      formationDefense: diagram.formation.defense,
      offensePlayers: diagram.players.offense,
      defensePlayers: diagram.players.defense,
      offenseAssignments: diagram.assignments.offense,
      defenseAssignments: diagram.assignments.defense || [],
      timingSteps: diagram.timing,
      tags: diagram.tags,
      hasUnsavedChanges: false,
    })
  },

  exportPlay: () => {
    const s = get()
    return {
      id: s.playName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: s.playName,
      formation: { offense: s.formationOffense, defense: s.formationDefense },
      players: { offense: s.offensePlayers, defense: s.defensePlayers },
      assignments: {
        offense: s.offenseAssignments,
        defense: s.defenseAssignments.length > 0 ? s.defenseAssignments : undefined,
      },
      timing: s.timingSteps,
      tags: s.tags,
    }
  },

  reset: () => {
    playerCounter = 100
    set({ ...initialState, hasUnsavedChanges: false })
  },

  saveDraft: () => {
    const play = get().exportPlay()
    try {
      localStorage.setItem('designer-draft', JSON.stringify(play))
      set({ hasUnsavedChanges: false })
    } catch {
      // localStorage full or unavailable
    }
  },

  loadDraft: () => {
    try {
      const raw = localStorage.getItem('designer-draft')
      if (!raw) return false
      const play = JSON.parse(raw) as PlayDiagram
      get().loadPlay(play)
      return true
    } catch {
      return false
    }
  },
}))
