import React from 'react'
import { Menu } from 'lucide-react'

export type ViewMode = 'quiz' | 'calculations'

interface HeaderProps {
  onMenuClick: () => void
  activeView: ViewMode
  onViewChange: (view: ViewMode) => void
}

export default function Header({ onMenuClick, activeView, onViewChange }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} className="text-gray-600 dark:text-gray-400" />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              GCP Professional Data Engineer
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Interactive Certification Prep
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1 flex-shrink-0">
          <button
            onClick={() => onViewChange('quiz')}
            className={`
              px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors
              ${activeView === 'quiz'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            Quiz
          </button>
          <button
            onClick={() => onViewChange('calculations')}
            className={`
              px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors
              ${activeView === 'calculations'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            Calculations
          </button>
        </nav>
      </div>
    </header>
  )
}
