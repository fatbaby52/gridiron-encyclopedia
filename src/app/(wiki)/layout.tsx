import { Sidebar } from '@/components/layout/Sidebar'

export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
