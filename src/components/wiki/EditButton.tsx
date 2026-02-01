'use client'

import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'

interface Props {
  slug: string
}

export function EditButton({ slug }: Props) {
  const { user, initialized } = useAuthStore()

  if (!initialized || !user) return null

  return (
    <Link
      href={`/edit/${slug}`}
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-grass-dark transition-colors"
      title="Suggest an edit"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      Edit
    </Link>
  )
}
