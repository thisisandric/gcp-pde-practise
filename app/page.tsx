'use client'

import React, { useState, useMemo } from 'react'
import { quizQuestions, references } from './data/quiz'
import { calculations } from './data/calculations'
import QuizComponent from './components/Quiz'
import Sidebar from './components/Sidebar'
import Header, { ViewMode } from './components/Header'
import Calculations from './components/Calculations'

export default function Home() {
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState<ViewMode>('quiz')

  const selectedReference = useMemo(() => {
    if (!selectedReferenceId) return null
    return references.find(ref => ref.id === selectedReferenceId)
  }, [selectedReferenceId])

  const handleViewChange = (view: ViewMode) => {
    setActiveView(view)
    setSelectedReferenceId(null)
  }

  const handleReferenceSelect = (id: string) => {
    setSelectedReferenceId(id)
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        references={references}
        selectedId={selectedReferenceId}
        onSelect={handleReferenceSelect}
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          activeView={activeView}
          onViewChange={handleViewChange}
        />

        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto h-full">
            {selectedReference ? (
              // Reference View
              <div className="p-6 sm:p-8 h-full overflow-auto">
                <button
                  onClick={() => setSelectedReferenceId(null)}
                  className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-2"
                >
                  ← Back to {activeView === 'calculations' ? 'Calculations' : 'Quiz'}
                </button>

                <article className="prose dark:prose-invert max-w-none">
                  <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                          {selectedReference.title}
                        </h1>
                        <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-medium rounded-full">
                          {selectedReference.category}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mt-6">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {selectedReference.content}
                      </p>
                    </div>

                    <div className="mt-8 grid md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-4 text-lg">Key Points</h3>
                        <ul className="space-y-3">
                          {selectedReference.keyPoints.map((point, idx) => (
                            <li key={idx} className="flex gap-3 text-gray-700 dark:text-gray-300">
                              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {selectedReference.externalLink && (
                        <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 rounded-lg p-6 border border-green-200 dark:border-green-800 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-green-900 dark:text-green-100 mb-4 text-lg">Learn More</h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                              For more details, check out the official Google Cloud documentation.
                            </p>
                          </div>
                          <a
                            href={selectedReference.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors w-full text-center"
                          >
                            Read Documentation →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            ) : activeView === 'calculations' ? (
              // Calculations View
              <Calculations calculations={calculations} />
            ) : (
              // Quiz View
              <QuizComponent
                questions={quizQuestions}
                onReferenceSelect={handleReferenceSelect}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
