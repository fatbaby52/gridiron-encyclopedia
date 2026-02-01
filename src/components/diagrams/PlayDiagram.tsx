import { getDiagramById } from '@/lib/diagrams'
import { DiagramField } from './DiagramField'
import { DiagramPlayers } from './DiagramPlayers'
import { DiagramRoutes } from './DiagramRoutes'
import { DiagramLegend } from './DiagramLegend'
import { AnimatedPlayDiagram } from './AnimatedPlayDiagram'

interface PlayDiagramProps {
  diagramId: string
  animated?: boolean
}

export function PlayDiagram({ diagramId, animated = false }: PlayDiagramProps) {
  const diagram = getDiagramById(diagramId)
  if (!diagram) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
        <p>Diagram not found: {diagramId}</p>
      </div>
    )
  }

  if (animated) {
    return <AnimatedPlayDiagram diagram={diagram} />
  }

  return (
    <figure className="my-6">
      <div className="bg-chalk rounded-lg p-4 border border-gray-200">
        <DiagramField>
          <DiagramPlayers offense={diagram.players.offense} defense={diagram.players.defense} />
          <DiagramRoutes assignments={diagram.assignments.offense} side="offense" />
          {diagram.assignments.defense && (
            <DiagramRoutes assignments={diagram.assignments.defense} side="defense" />
          )}
        </DiagramField>
      </div>
      <figcaption className="mt-2 text-center">
        <span className="text-sm font-semibold text-grass-dark">{diagram.name}</span>
        <DiagramLegend />
      </figcaption>
    </figure>
  )
}
