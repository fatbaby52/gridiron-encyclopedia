'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tabs } from '@/components/ui/Tabs'
import { ResourceCard } from '@/components/ui/ResourceCard'
import { RESOURCES, getDownloadUrl } from '@/lib/resources'

const TABS = [
  { key: 'all', label: 'All Resources' },
  { key: 'playbooks', label: 'Playbooks (5)' },
  { key: 'workouts', label: 'Workout Templates (7)' },
]

export function ResourcesPageClient() {
  const [activeTab, setActiveTab] = useState('all')

  const filtered =
    activeTab === 'all'
      ? RESOURCES
      : RESOURCES.filter((r) => r.category === activeTab)

  const handleDownload = (filename: string) => {
    const link = document.createElement('a')
    link.href = getDownloadUrl(filename)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Free Downloads</h1>
        <p className="text-gray-500">
          Printable playbooks and workout templates for your program.
        </p>
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} className="mb-8" />

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((resource) => (
          <ResourceCard
            key={resource.id}
            title={resource.title}
            description={resource.description}
            icon={resource.icon}
            pageCount={resource.pageCount}
            tags={resource.tags}
            onDownload={() => handleDownload(resource.filename)}
          />
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500 mb-3">
          Looking for more training content?
        </p>
        <Link
          href="/training"
          className="inline-block px-5 py-2.5 text-sm font-medium rounded-lg border border-grass text-grass-dark hover:bg-grass/5 transition-colors"
        >
          Browse Training Articles
        </Link>
      </div>
    </div>
  )
}
