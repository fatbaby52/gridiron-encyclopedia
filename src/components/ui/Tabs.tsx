'use client'

interface Tab {
  key: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (key: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`flex border-b border-gray-200 dark:border-slate-700 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab

        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.key}`}
            id={`tab-${tab.key}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
              isActive
                ? 'border-grass text-grass-dark'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
