import { Badge } from '@/components/ui/Badge'

interface ResourceCardProps {
  title: string
  description: string
  icon: string
  pageCount: number
  tags: string[]
  onDownload: () => void
}

export function ResourceCard({
  title,
  description,
  icon,
  pageCount,
  tags,
  onDownload,
}: ResourceCardProps) {
  return (
    <div className="p-5 rounded-xl border border-gray-200 hover:border-grass/50 hover:shadow-md transition-all flex flex-col bg-white">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="text-xs text-gray-400">PDF &middot; {pageCount} pages</span>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">{description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {tags.slice(0, 3).map((tag) => (
          <Badge key={tag} color="grass">
            {tag}
          </Badge>
        ))}
      </div>

      <button
        onClick={onDownload}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors bg-grass text-white hover:bg-grass-dark"
      >
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
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Download PDF
      </button>
    </div>
  )
}
