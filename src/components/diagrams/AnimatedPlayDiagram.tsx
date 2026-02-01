'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { DiagramField } from './DiagramField'
import { DiagramPlayers } from './DiagramPlayers'
import { AnimatedDiagramRoutes } from './AnimatedDiagramRoutes'
import { DiagramControls } from './DiagramControls'
import { DiagramLegend } from './DiagramLegend'
import type { PlayDiagram } from '@/types'

interface AnimatedPlayDiagramProps {
  diagram: PlayDiagram
}

export function AnimatedPlayDiagram({ diagram }: AnimatedPlayDiagramProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [showDefense, setShowDefense] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalSteps = diagram.timing.length

  // Derive effective playing state: playing and not yet at end
  const effectivelyPlaying = isPlaying && currentStep < totalSteps

  // Progress: 0 when at formation (step 0), 1 when at final step
  const progress = totalSteps > 0 ? currentStep / totalSteps : 0

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const advanceStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = prev + 1
      if (next > totalSteps) return prev
      if (next >= totalSteps) {
        // Reached the end — stop playing via a scheduled callback
        // to avoid setState-in-effect lint rule
        setIsPlaying(false)
      }
      return next
    })
  }, [totalSteps])

  // Auto-advance when effectively playing
  useEffect(() => {
    if (!effectivelyPlaying) {
      clearTimer()
      return
    }
    const delay = 1200 / speed
    timerRef.current = setTimeout(advanceStep, delay)
    return clearTimer
  }, [effectivelyPlaying, currentStep, speed, advanceStep, clearTimer])

  const handlePlayPause = useCallback(() => {
    if (currentStep >= totalSteps) {
      // Reset and play from start
      setCurrentStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying((prev) => !prev)
    }
  }, [currentStep, totalSteps])

  const handleStepForward = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }, [totalSteps])

  const handleStepBack = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }, [])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
  }, [])

  // Get current step description
  const stepDescription =
    currentStep === 0
      ? 'Pre-snap formation'
      : diagram.timing[currentStep - 1]?.description ?? ''

  return (
    <figure className="my-6">
      <div className="bg-chalk rounded-lg p-4 border border-gray-200">
        <DiagramField>
          <DiagramPlayers
            offense={diagram.players.offense}
            defense={showDefense ? diagram.players.defense : []}
          />
          {progress > 0 && (
            <>
              <AnimatedDiagramRoutes
                assignments={diagram.assignments.offense}
                side="offense"
                progress={progress}
              />
              {showDefense && diagram.assignments.defense && (
                <AnimatedDiagramRoutes
                  assignments={diagram.assignments.defense}
                  side="defense"
                  progress={progress}
                />
              )}
            </>
          )}
        </DiagramField>

        {/* Step description */}
        <div className="mt-2 min-h-[1.5rem] text-center">
          <p className="text-xs text-gray-600 italic">{stepDescription}</p>
        </div>

        {/* Controls */}
        <div className="mt-2">
          <DiagramControls
            isPlaying={effectivelyPlaying}
            currentStep={currentStep}
            totalSteps={totalSteps}
            speed={speed}
            showDefense={showDefense}
            onPlayPause={handlePlayPause}
            onStepForward={handleStepForward}
            onStepBack={handleStepBack}
            onReset={handleReset}
            onSpeedChange={setSpeed}
            onToggleDefense={() => setShowDefense((prev) => !prev)}
          />
        </div>
      </div>
      <figcaption className="mt-2 text-center">
        <span className="text-sm font-semibold text-grass-dark">{diagram.name}</span>
        <DiagramLegend />
      </figcaption>
    </figure>
  )
}
