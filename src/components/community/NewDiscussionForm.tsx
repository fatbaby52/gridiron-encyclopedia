'use client'

import { useState } from 'react'

interface Props {
  categories: string[]
  articleSlug?: string | null
  onSubmit: (data: {
    title: string
    content: string
    category: string
    articleSlug: string | null
  }) => void
}

export function NewDiscussionForm({
  categories,
  articleSlug = null,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(categories[0] || 'general')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || submitting) return

    setSubmitting(true)
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      category,
      articleSlug,
    })
    setTitle('')
    setContent('')
    setCategory(categories[0] || 'general')
    setSubmitting(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border border-gray-200 rounded-lg bg-white space-y-4"
    >
      <div>
        <label
          htmlFor="disc-title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title
        </label>
        <input
          id="disc-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grass/50 focus:border-grass"
          placeholder="Discussion title..."
        />
      </div>

      <div>
        <label
          htmlFor="disc-category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category
        </label>
        <select
          id="disc-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grass/50 focus:border-grass bg-white"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="disc-content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Content
        </label>
        <textarea
          id="disc-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={50000}
          rows={6}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grass/50 focus:border-grass resize-none"
          placeholder="Share your thoughts..."
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!title.trim() || !content.trim() || submitting}
          className="px-4 py-2 bg-grass text-white text-sm font-medium rounded-lg hover:bg-grass-dark transition-colors disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Discussion'}
        </button>
      </div>
    </form>
  )
}
