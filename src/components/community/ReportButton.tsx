'use client'

import { useState } from 'react'
import { ReportModal } from '@/components/community/ReportModal'

interface Props {
  targetType: string
  targetId: string
}

export function ReportButton({ targetType, targetId }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        title="Report"
        aria-label="Report content"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
          />
        </svg>
      </button>

      <ReportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetType={targetType}
        targetId={targetId}
      />
    </>
  )
}
