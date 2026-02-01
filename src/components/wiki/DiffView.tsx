'use client'

import { computeDiff, countChanges } from '@/lib/diffUtils'

interface Props {
  oldText: string
  newText: string
}

export function DiffView({ oldText, newText }: Props) {
  const diff = computeDiff(oldText, newText)
  const { additions, deletions } = countChanges(diff)

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 text-sm">
        <span className="text-green-700 font-medium">+{additions} additions</span>
        <span className="text-red-700 font-medium">-{deletions} deletions</span>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden font-mono text-sm">
        {diff.map((line, i) => {
          let bg = ''
          let prefix = ' '
          if (line.type === 'add') {
            bg = 'bg-green-50'
            prefix = '+'
          } else if (line.type === 'remove') {
            bg = 'bg-red-50'
            prefix = '-'
          }

          return (
            <div key={i} className={`flex ${bg}`}>
              <span className="w-10 text-right text-gray-400 select-none pr-2 border-r border-gray-200 flex-shrink-0">
                {line.lineNumber ?? ''}
              </span>
              <span className="w-10 text-right text-gray-400 select-none pr-2 border-r border-gray-200 flex-shrink-0">
                {line.newLineNumber ?? ''}
              </span>
              <span
                className={`pl-2 pr-4 whitespace-pre-wrap break-all flex-1 ${
                  line.type === 'add' ? 'text-green-800' : line.type === 'remove' ? 'text-red-800' : 'text-gray-700'
                }`}
              >
                {prefix} {line.content}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
