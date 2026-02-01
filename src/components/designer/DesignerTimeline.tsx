'use client'

import { useState, useCallback } from 'react'
import { useDesignerStore } from '@/stores/designerStore'
import { AnimatedPlayDiagram } from '@/components/diagrams/AnimatedPlayDiagram'

export function DesignerTimeline() {
  const {
    timingSteps,
    addTimingStep,
    removeTimingStep,
    updateTimingStep,
    exportPlay,
  } = useDesignerStore()

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleAddStep = useCallback(() => {
    addTimingStep({
      step: timingSteps.length + 1,
      description: '',
      events: [],
    })
  }, [timingSteps.length, addTimingStep])

  const previewDiagram = isPreviewOpen ? exportPlay() : null

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-t border-gray-200 overflow-x-auto">
        <span className="text-xs font-semibold text-gray-500 flex-shrink-0">Timeline:</span>

        {timingSteps.map((step) => (
          <div
            key={step.step}
            className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-2 py-1 min-w-[120px] flex-shrink-0"
          >
            <span className="text-xs font-bold text-grass w-4">{step.step}</span>
            <input
              type="text"
              value={step.description}
              onChange={(e) => updateTimingStep(step.step, { description: e.target.value })}
              placeholder="Step description..."
              className="text-xs flex-1 min-w-0 outline-none bg-transparent"
            />
            {timingSteps.length > 1 && (
              <button
                onClick={() => removeTimingStep(step.step)}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        <button
          onClick={handleAddStep}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-grass border border-dashed border-gray-300 hover:border-grass rounded-md transition-colors flex-shrink-0"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Step
        </button>

        <div className="flex-1" />

        <button
          onClick={() => setIsPreviewOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-grass text-white rounded-md hover:bg-grass-dark transition-colors flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21" />
          </svg>
          Preview
        </button>
      </div>

      {/* Preview modal */}
      {isPreviewOpen && previewDiagram && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsPreviewOpen(false)}
          />
          <div className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50">
            <div className="bg-white rounded-xl shadow-2xl mx-4 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-grass-dark">Animation Preview</h3>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <AnimatedPlayDiagram diagram={previewDiagram} />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
