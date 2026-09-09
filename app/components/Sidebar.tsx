import React, { useMemo } from 'react'
import { Reference } from '../data/quiz'
import { X, BookOpen } from 'lucide-react'

interface SidebarProps {
  references: Reference[]
  selectedId: string | null
  onSelect: (id: string) => void
  isOpen: boolean
  onToggle: (open: boolean) => void
}

export default function Sidebar({
  references,
  selectedId,
  onSelect,
  isOpen,
  onToggle,
}: SidebarProps) {
  const categories = useMemo(() => {
    const cats: Record<string, Reference[]> = {}
    references.forEach(ref => {
      if (!cats[ref.category]) {
        cats[ref.category] = []
      }
      cats[ref.category].push(ref)
    })
    return cats
  }, [references])

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => onToggle(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative lg:translate-x-0 w-80 h-screen bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform
          duration-300 ease-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={24} className="text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              References
            </h2>
          </div>
          <button
            onClick={() => onToggle(false)}
            className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-label="Close sidebar"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Sidebar Content */}
        <nav className="flex-1 overflow-auto p-4">
          <div className="space-y-6">
            {Object.entries(categories).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {items.map(ref => (
                    <button
                      key={ref.id}
                      onClick={() => {
                        onSelect(ref.id)
                        onToggle(false) // Close sidebar on mobile
                      }}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                        font-medium group
                        ${
                          selectedId === ref.id
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <span className="truncate block">{ref.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-xs text-gray-700 dark:text-gray-300">
            <p className="font-medium mb-1">💡 Tip</p>
            <p>
              Click on references while taking the quiz to deepen your understanding of each topic.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
