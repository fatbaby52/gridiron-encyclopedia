'use client'

import { useState } from 'react'
import { useWikiEditStore } from '@/stores/wikiEditStore'
import { DiffView } from './DiffView'

type Tab = 'edit' | 'preview' | 'diff'

export function ArticleEditor() {
  const [activeTab, setActiveTab] = useState<Tab>('edit')
  const {
    draftTitle,
    draftContent,
    editSummary,
    originalContent,
    isDirty,
    submitting,
    error,
    setDraftTitle,
    setDraftContent,
    setEditSummary,
    submitEdit,
  } = useWikiEditStore()

  const handleSubmit = async () => {
    const success = await submitEdit()
    if (success) {
      window.history.back()
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'edit', label: 'Edit' },
    { key: 'preview', label: 'Preview' },
    { key: 'diff', label: 'Changes' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="edit-title"
          type="text"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grass/50 focus:border-grass"
        />
      </div>

      <div>
        <div className="flex border-b border-gray-200 mb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.key
                  ? 'text-grass-dark border-grass'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'edit' && (
          <textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            rows={24}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-grass/50 focus:border-grass resize-y"
            placeholder="Article content in MDX format..."
          />
        )}

        {activeTab === 'preview' && (
          <div className="border border-gray-200 rounded-lg p-4 min-h-[300px] prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{draftContent}</pre>
          </div>
        )}

        {activeTab === 'diff' && (
          <div className="min-h-[300px]">
            {isDirty ? (
              <DiffView oldText={originalContent} newText={draftContent} />
            ) : (
              <p className="text-sm text-gray-500 py-8 text-center">No changes yet</p>
            )}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="edit-summary" className="block text-sm font-medium text-gray-700 mb-1">
          Edit Summary
        </label>
        <input
          id="edit-summary"
          type="text"
          value={editSummary}
          onChange={(e) => setEditSummary(e.target.value)}
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grass/50 focus:border-grass"
          placeholder="Briefly describe your changes..."
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting || !isDirty}
          className="px-4 py-2 bg-grass text-white text-sm font-medium rounded-lg hover:bg-grass-dark transition-colors disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit for Review'}
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
