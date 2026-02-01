'use client'

import type { Playbook } from '@/types/community'

interface Props {
  playbooks: Playbook[]
  selectedId: string | null
  onChange: (id: string | null) => void
}

export function PlaybookSelector({ playbooks, selectedId, onChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    onChange(value === '' ? null : value)
  }

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="playbook-selector"
        className="text-sm font-medium text-gray-700 whitespace-nowrap"
      >
        Add to Playbook
      </label>
      <select
        id="playbook-selector"
        value={selectedId ?? ''}
        onChange={handleChange}
        className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 transition-colors focus:border-grass focus:ring-1 focus:ring-grass focus:outline-none hover:border-gray-300"
      >
        <option value="">None</option>
        {playbooks.map((playbook) => (
          <option key={playbook.id} value={playbook.id}>
            {playbook.name}
          </option>
        ))}
      </select>
    </div>
  )
}
