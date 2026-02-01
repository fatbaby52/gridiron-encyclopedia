'use client'

import { useState, useCallback } from 'react'
import { useDesignerStore } from '@/stores/designerStore'

export function DesignerToolbar() {
  const {
    playName,
    setPlayName,
    hasUnsavedChanges,
    saveDraft,
    exportPlay,
    reset,
  } = useDesignerStore()

  const [isExportOpen, setIsExportOpen] = useState(false)

  const handleExportJSON = useCallback(() => {
    const play = exportPlay()
    const blob = new Blob([JSON.stringify(play, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${play.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    setIsExportOpen(false)
  }, [exportPlay])

  const handleExportSVG = useCallback(() => {
    const svg = document.querySelector('[aria-label="Play designer field"]')
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${playName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.svg`
    a.click()
    URL.revokeObjectURL(url)
    setIsExportOpen(false)
  }, [playName])

  const handleExportPNG = useCallback(() => {
    const svg = document.querySelector('[aria-label="Play designer field"]') as SVGSVGElement | null
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 800, 600)
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${playName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`
        a.click()
        URL.revokeObjectURL(url)
      })
    }
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`
    setIsExportOpen(false)
  }, [playName])

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 bg-white border-b border-gray-200">
      {/* Play name */}
      <input
        type="text"
        value={playName}
        onChange={(e) => setPlayName(e.target.value)}
        className="text-lg font-semibold text-grass-dark bg-transparent border-b border-transparent hover:border-gray-300 focus:border-grass focus:outline-none px-1 py-0.5 min-w-0 flex-shrink"
        placeholder="Play name..."
      />

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Save indicator */}
        {hasUnsavedChanges && (
          <span className="text-xs text-amber-600 hidden sm:inline">Unsaved</span>
        )}

        {/* Save draft */}
        <button
          onClick={saveDraft}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
        >
          Save Draft
        </button>

        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="px-3 py-1.5 text-sm bg-grass text-white hover:bg-grass-dark rounded-md transition-colors flex items-center gap-1"
          >
            Export
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isExportOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsExportOpen(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[140px]">
                <button
                  onClick={handleExportPNG}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Export as PNG
                </button>
                <button
                  onClick={handleExportSVG}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Export as SVG
                </button>
                <button
                  onClick={handleExportJSON}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Export as JSON
                </button>
              </div>
            </>
          )}
        </div>

        {/* New play */}
        <button
          onClick={reset}
          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          title="New play"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  )
}
