'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { usePlaybookStore } from '@/stores/playbookStore'
import { Badge } from '@/components/ui/Badge'
import type { Playbook } from '@/types/community'

export default function PlaybooksPage() {
  const router = useRouter()
  const { user, initialized: authInit } = useAuthStore()
  const { playbooks, loading, initialized, loadPlaybooks, createPlaybook } = usePlaybookStore()

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (authInit && !user) {
      router.push('/auth/login')
    }
  }, [authInit, user, router])

  useEffect(() => {
    if (user && !initialized) {
      loadPlaybooks(user.id)
    }
  }, [user, initialized, loadPlaybooks])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !name.trim()) return

    setCreating(true)
    await createPlaybook(user.id, {
      name: name.trim(),
      description: description.trim(),
      isPublic,
    })
    setName('')
    setDescription('')
    setIsPublic(false)
    setShowForm(false)
    setCreating(false)
  }

  if (!authInit || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="grid gap-4 md:grid-cols-2 mt-8">
            <div className="h-32 bg-gray-200 rounded-lg" />
            <div className="h-32 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Playbooks</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize your plays into playbooks
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-grass text-white text-sm font-medium rounded-lg hover:bg-grass-dark transition-colors"
        >
          {showForm ? 'Cancel' : 'Create Playbook'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 p-4 border border-gray-200 rounded-lg bg-white space-y-4"
        >
          <div>
            <label htmlFor="pb-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="pb-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grass/50 focus:border-grass"
              placeholder="e.g., West Coast Offense"
            />
          </div>

          <div>
            <label htmlFor="pb-desc" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="pb-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grass/50 focus:border-grass resize-none"
              placeholder="Describe the focus of this playbook..."
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-gray-300 text-grass focus:ring-grass"
            />
            Make this playbook public
          </label>

          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="px-4 py-2 bg-grass text-white text-sm font-medium rounded-lg hover:bg-grass-dark transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      {loading && !initialized ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : playbooks.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium mb-2">No playbooks yet</p>
          <p className="text-sm">
            Create your first playbook to start organizing plays.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {playbooks.map((pb: Playbook) => (
            <Link
              key={pb.id}
              href={`/playbooks/${pb.id}`}
              className="block p-4 border border-gray-200 rounded-lg hover:border-grass/40 hover:shadow-sm transition-all bg-white"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-semibold text-gray-900 line-clamp-1">
                  {pb.name}
                </h2>
                <Badge color={pb.isPublic ? 'grass' : 'gray'}>
                  {pb.isPublic ? 'Public' : 'Private'}
                </Badge>
              </div>
              {pb.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {pb.description}
                </p>
              )}
              <p className="text-xs text-gray-400">
                {pb.playCount} {pb.playCount === 1 ? 'play' : 'plays'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
