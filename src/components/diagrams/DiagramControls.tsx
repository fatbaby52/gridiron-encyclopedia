'use client'

interface DiagramControlsProps {
  isPlaying: boolean
  currentStep: number
  totalSteps: number
  speed: number
  showDefense: boolean
  onPlayPause: () => void
  onStepForward: () => void
  onStepBack: () => void
  onReset: () => void
  onSpeedChange: (speed: number) => void
  onToggleDefense: () => void
}

export function DiagramControls({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  showDefense,
  onPlayPause,
  onStepForward,
  onStepBack,
  onReset,
  onSpeedChange,
  onToggleDefense,
}: DiagramControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Step indicator */}
      <div className="flex items-center gap-1 justify-center">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 max-w-8 rounded-full transition-colors ${
              i < currentStep ? 'bg-grass' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Playback controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Reset */}
          <button
            onClick={onReset}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Reset"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Step back */}
          <button
            onClick={onStepBack}
            disabled={currentStep === 0}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30 transition-colors"
            aria-label="Previous step"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={onPlayPause}
            className="p-2 rounded-full bg-grass text-white hover:bg-grass-dark transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21" />
              </svg>
            )}
          </button>

          {/* Step forward */}
          <button
            onClick={onStepForward}
            disabled={currentStep >= totalSteps}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30 transition-colors"
            aria-label="Next step"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Step label */}
        <span className="text-xs text-gray-500 font-medium">
          {currentStep === 0 ? 'Formation' : `Step ${currentStep} / ${totalSteps}`}
        </span>

        <div className="flex items-center gap-2">
          {/* Speed */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">Speed</span>
            <select
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>

          {/* Defense toggle */}
          <button
            onClick={onToggleDefense}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              showDefense
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}
          >
            DEF
          </button>
        </div>
      </div>
    </div>
  )
}
