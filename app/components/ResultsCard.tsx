import React from 'react'
import { RotateCcw, TrendingUp, Target } from 'lucide-react'

interface TopicScore {
  total: number
  correct: number
}

interface ResultsCardProps {
  score: number
  total: number
  topicScores: Record<string, TopicScore>
  onRestart: () => void
}

export default function ResultsCard({
  score,
  total,
  topicScores,
  onRestart,
}: ResultsCardProps) {
  const percentage = Math.round((score / total) * 100)

  const getMessage = () => {
    if (percentage >= 90) return 'Excellent! You\'re exam-ready.'
    if (percentage >= 75) return 'Very good. Focus on weaker topics.'
    if (percentage >= 60) return 'Good foundation. Review weak areas.'
    return 'Keep studying. Strong effort needed.'
  }

  const getColor = () => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400'
    if (percentage >= 75) return 'text-blue-600 dark:text-blue-400'
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getBgColor = () => {
    if (percentage >= 90) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    if (percentage >= 75) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    if (percentage >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  }

  const sortedTopics = Object.entries(topicScores)
    .sort(([, a], [, b]) => {
      const percentA = (a.correct / a.total) * 100
      const percentB = (b.correct / b.total) * 100
      return percentB - percentA
    })

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Main Result Card */}
      <div className={`
        rounded-2xl border-2 p-8 sm:p-12 mb-8 text-center
        ${getBgColor()}
      `}>
        <div className="mb-6">
          <Target size={48} className={`mx-auto mb-4 ${getColor()}`} />
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Quiz Complete!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here's how you performed
          </p>
        </div>

        <div className="my-8">
          <div className="text-6xl sm:text-7xl font-bold text-gray-900 dark:text-white mb-2">
            {percentage}%
          </div>
          <p className={`text-xl sm:text-2xl font-semibold ${getColor()} mb-4`}>
            {score} out of {total} correct
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {getMessage()}
          </p>
        </div>
      </div>

      {/* Topic Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Score by Topic
          </h3>
        </div>

        <div className="space-y-4">
          {sortedTopics.map(([topic, scores]) => {
            const topicPercentage = Math.round((scores.correct / scores.total) * 100)
            const isStrong = topicPercentage >= 80
            const isWeak = topicPercentage < 60

            return (
              <div key={topic}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {topic}
                  </span>
                  <span className={`
                    font-bold text-sm
                    ${isStrong ? 'text-green-600 dark:text-green-400' : 
                      isWeak ? 'text-red-600 dark:text-red-400' :
                      'text-blue-600 dark:text-blue-400'}
                  `}>
                    {scores.correct}/{scores.total}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`
                      h-2 rounded-full transition-all duration-500
                      ${isStrong ? 'bg-green-500' : 
                        isWeak ? 'bg-red-500' :
                        'bg-blue-500'}
                    `}
                    style={{ width: `${topicPercentage}%` }}
                  />
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {topicPercentage}%
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6 sm:p-8 mb-8">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">
          📋 Next Steps
        </h3>
        <ul className="space-y-3 text-blue-800 dark:text-blue-200">
          {percentage < 75 ? (
            <>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">1.</span>
                <span>Review the reference materials for weaker topics using the sidebar</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">2.</span>
                <span>Focus your study on topics where you scored below 60%</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">3.</span>
                <span>Retake the quiz after 2-3 hours of focused study</span>
              </li>
            </>
          ) : (
            <>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">✓</span>
                <span>Solid understanding demonstrated. Use references to deepen expertise.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">✓</span>
                <span>Practice with the official Google Cloud certification exam.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">✓</span>
                <span>Work on real-world projects to reinforce learning.</span>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <RotateCcw size={20} />
          Retake Quiz
        </button>
        
        <a
          href="https://www.google.com/search?q=google+cloud+professional+data+engineer+certification"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
        >
          Learn More
        </a>
      </div>
    </div>
  )
}
