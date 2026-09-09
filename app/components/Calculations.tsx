import React, { useMemo, useState } from 'react'
import { CalculationExample } from '../data/calculations'
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react'

interface CalculationsProps {
  calculations: CalculationExample[]
}

function CalculationCard({ calc }: { calc: CalculationExample }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex-1">
          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-medium rounded-full mb-3">
            {calc.category}
          </span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {calc.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {calc.scenario}
          </p>
        </div>
        <div className="flex-shrink-0 mt-1">
          {expanded ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 sm:px-6 pb-6 border-t border-gray-100 dark:border-gray-700 pt-5">
          {/* Formula */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 font-mono text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
            {calc.formula}
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-4">
            {calc.steps.map((step, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {step.label}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mt-0.5">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Result */}
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-lg p-4 mb-4">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">
              Result
            </p>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              {calc.result}
            </p>
          </div>

          {/* Takeaway */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">
              💡 Exam takeaway
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
              {calc.takeaway}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Calculations({ calculations }: CalculationsProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const categories = useMemo(() => {
    const cats = Array.from(new Set(calculations.map(c => c.category)))
    return ['All', ...cats]
  }, [calculations])

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return calculations
    return calculations.filter(c => c.category === activeCategory)
  }, [calculations, activeCategory])

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-2">
        <Calculator size={28} className="text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Calculation examples
        </h2>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Worked formulas and step-by-step math for the cost, throughput and capacity questions the exam tests.
      </p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${activeCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Calculation cards */}
      <div className="space-y-4">
        {filtered.map(calc => (
          <CalculationCard key={calc.id} calc={calc} />
        ))}
      </div>
    </div>
  )
}
