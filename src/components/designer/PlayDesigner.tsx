'use client'

import { useEffect } from 'react'
import { useDesignerStore } from '@/stores/designerStore'
import { DesignerToolbar } from './DesignerToolbar'
import { DesignerSidebar } from './DesignerSidebar'
import { DesignerCanvas } from './DesignerCanvas'
import { DesignerTimeline } from './DesignerTimeline'

export function PlayDesigner() {
  const { loadDraft, hasUnsavedChanges, saveDraft } = useDesignerStore()

  // Load draft on mount
  useEffect(() => {
    loadDraft()
  }, [loadDraft])

  // Autosave every 30 seconds when there are changes
  useEffect(() => {
    if (!hasUnsavedChanges) return
    const timer = setTimeout(saveDraft, 30000)
    return () => clearTimeout(timer)
  }, [hasUnsavedChanges, saveDraft])

  // Warn on page leave if unsaved
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedChanges])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-100">
      <DesignerToolbar />
      <div className="flex flex-1 min-h-0">
        <DesignerSidebar />
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <div className="w-full max-w-2xl">
            <DesignerCanvas />
          </div>
        </div>
      </div>
      <DesignerTimeline />
    </div>
  )
}
