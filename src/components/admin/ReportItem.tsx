'use client'

import type { ModerationReport } from '@/types/community'

interface Props {
  report: ModerationReport
  onResolve: (id: string, status: 'resolved' | 'dismissed') => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  offensive: 'Offensive / Abusive',
  misinformation: 'Misinformation',
  plagiarism: 'Plagiarism',
  'off-topic': 'Off-topic',
  other: 'Other',
}

const TARGET_LABELS: Record<string, string> = {
  comment: 'Comment',
  discussion: 'Discussion',
  play: 'Play',
  article_version: 'Article Version',
}

export function ReportItem({ report, onResolve }: Props) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
              {REASON_LABELS[report.reason] ?? report.reason}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
              {TARGET_LABELS[report.targetType] ?? report.targetType}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-1">
            Reporter: {report.reporterId} &middot; Target: {report.targetId}
          </p>
          <p className="text-xs text-gray-400">{formatDate(report.createdAt)}</p>
          {report.details && (
            <p className="text-sm text-gray-700 mt-2 bg-gray-50 rounded p-2">{report.details}</p>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onResolve(report.id, 'resolved')}
            className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
          >
            Resolve
          </button>
          <button
            onClick={() => onResolve(report.id, 'dismissed')}
            className="px-3 py-1.5 text-xs font-medium text-white bg-gray-500 rounded hover:bg-gray-600 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
