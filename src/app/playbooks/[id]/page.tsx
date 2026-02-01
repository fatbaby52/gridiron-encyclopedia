'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { usePlaybookStore } from '@/stores/playbookStore'
import { useAuthStore } from '@/stores/authStore'
import { PlayCard } from '@/components/community/PlayCard'

export default function PlaybookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { playbooks, plays, loadPlaybooks, loadPlays } = usePlaybookStore()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false)
        return
      }

      if (playbooks.length === 0) {
        await loadPlaybooks(user.id)
      }
      if (plays.length === 0) {
        await loadPlays(user.id)
      }

      setLoading(false)
    }

    load()
  }, [user, playbooks.length, plays.length, loadPlaybooks, loadPlays])

  const playbook = useMemo(() => playbooks.find((pb) => pb.id === id) ?? null, [id, playbooks])
  const playbookPlays = useMemo(() => plays.filter((p) => p.playbookId === id), [id, plays])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="grid gap-4 md:grid-cols-2 mt-8">
            <div className="h-40 bg-gray-200 rounded-lg" />
            <div className="h-40 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!playbook) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Playbook Not Found</h1>
        <p className="text-gray-500 mb-6">
          This playbook does not exist or you do not have access to it.
        </p>
        <Link
          href="/playbooks"
          className="inline-block px-4 py-2 bg-grass text-white text-sm font-medium rounded-lg hover:bg-grass-dark transition-colors"
        >
          Back to Playbooks
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/playbooks"
        className="inline-flex items-center text-sm text-gray-500 hover:text-grass-dark mb-4 transition-colors"
      >
        &larr; All Playbooks
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{playbook.name}</h1>
          {playbook.description && (
            <p className="text-sm text-gray-600 mt-1">{playbook.description}</p>
          )}
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${playbook.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {playbook.isPublic ? 'Public' : 'Private'}
        </span>
      </div>

      <p className="text-sm text-gray-400 mb-6">
        {playbookPlays.length} {playbookPlays.length === 1 ? 'play' : 'plays'}
      </p>

      {playbookPlays.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium mb-2">No plays in this playbook</p>
          <p className="text-sm">
            Add plays from the Play Designer or fork plays from the Gallery.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {playbookPlays.map((play) => (
            <PlayCard key={play.id} play={play} />
          ))}
        </div>
      )}
    </div>
  )
}
