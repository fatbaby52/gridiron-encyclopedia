'use client'

interface Props {
  playId: string
  onFork: () => void
  disabled?: boolean
}

export function ForkButton({ playId, onFork, disabled = false }: Props) {
  return (
    <button
      onClick={onFork}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
        disabled
          ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-white border-gray-200 text-gray-700 hover:border-grass hover:text-grass-dark hover:bg-grass/5'
      }`}
      aria-label="Fork this play"
      data-play-id={playId}
    >
      {/* Branch / fork icon */}
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 3v6m0 0a3 3 0 103 3V9m-3 3a3 3 0 10-3 3m12-9v6m0 0a3 3 0 103 3v-3m-3 0a3 3 0 10-3 3"
        />
        <circle cx="6" cy="6" r="2" strokeWidth={2} />
        <circle cx="18" cy="6" r="2" strokeWidth={2} />
        <circle cx="12" cy="18" r="2" strokeWidth={2} />
      </svg>
      Fork
    </button>
  )
}
