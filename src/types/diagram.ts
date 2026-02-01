export interface PlayerPosition {
  id: string
  position: string
  x: number
  y: number
  label: string
}

export interface Assignment {
  playerId: string
  type: 'route' | 'block' | 'run' | 'zone' | 'spy' | 'blitz'
  path: [number, number][]
  readKey?: string
  style?: 'solid' | 'dashed' | 'dotted'
}

export interface TimingStep {
  step: number
  description: string
  events: string[]
}

export interface PlayDiagram {
  id: string
  name: string
  formation: {
    offense: string
    defense: string
  }
  players: {
    offense: PlayerPosition[]
    defense: PlayerPosition[]
  }
  assignments: {
    offense: Assignment[]
    defense?: Assignment[]
  }
  timing: TimingStep[]
  tags: string[]
}
