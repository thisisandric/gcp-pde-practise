import React from 'react'
import { QuizQuestion, Reference, references } from '../data/quiz'
import { Check, X, BookOpen, AlertCircle } from 'lucide-react'

interface QuestionCardProps {
  question: QuizQuestion
  isAnswered: boolean
  selectedOptionIndex?: number
  onAnswer: (optionIndex: number) => void
  onReferenceSelect: (id: string) => void
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    case 'medium':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
    case 'hard':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
  }
}

export default function QuestionCard({
  question,
  isAnswered,
  selectedOptionIndex,
  onAnswer,
  onReferenceSelect,
}: QuestionCardProps) {
  const correctOptionIndex = question.options.findIndex(opt => opt.correct)
  const isSelectedCorrect = selectedOptionIndex !== undefined && question.options[selectedOptionIndex].correct

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-medium rounded-full">
              {question.topic}
            </span>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Question Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
        {question.question}
      </h2>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          const isSelected = selectedOptionIndex === index
          const isCorrect = option.correct
          const shouldShowCorrect = isAnswered && isCorrect
          const shouldShowIncorrect = isAnswered && isSelected && !isCorrect

          return (
            <button
              key={index}
              onClick={() => !isAnswered && onAnswer(index)}
              disabled={isAnswered}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all group
                ${!isAnswered ? 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-500' : 'cursor-default'}
                ${
                  isSelected
                    ? shouldShowCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : shouldShowIncorrect
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : shouldShowCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  flex-shrink-0 w-6 h-6 rounded-full border-2 mt-1 flex items-center justify-center
                  ${
                    isSelected
                      ? shouldShowCorrect
                        ? 'border-green-500 bg-green-500'
                        : shouldShowIncorrect
                        ? 'border-red-500 bg-red-500'
                        : 'border-blue-500 bg-blue-500'
                      : shouldShowCorrect
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }
                `}>
                  {shouldShowCorrect && <Check size={16} className="text-white" />}
                  {shouldShowIncorrect && <X size={16} className="text-white" />}
                </div>
                <span className={`
                  text-base sm:text-lg font-medium leading-relaxed flex-1
                  ${
                    isSelected
                      ? shouldShowCorrect
                        ? 'text-green-700 dark:text-green-300'
                        : shouldShowIncorrect
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-blue-700 dark:text-blue-300'
                      : shouldShowCorrect
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-gray-900 dark:text-white'
                  }
                `}>
                  {option.text}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {isAnswered && (
        <div className={`
          rounded-lg p-4 mb-4 border-l-4
          ${isSelectedCorrect
            ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
            : 'bg-red-50 dark:bg-red-900/20 border-red-500'
          }
        `}>
          <div className="flex items-start gap-3">
            {isSelectedCorrect ? (
              <Check size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <X size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`
                font-semibold mb-2
                ${isSelectedCorrect
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
                }
              `}>
                {isSelectedCorrect ? '✓ Correct!' : '✗ Not quite.'}
              </p>
              <p className={`
                text-sm leading-relaxed mb-3
                ${isSelectedCorrect
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
                }
              `}>
                {question.explanation}
              </p>
              
              {question.bestPractice && (
                <div className="bg-white dark:bg-gray-700 rounded p-3 mt-3">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    💡 Best Practice
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {question.bestPractice}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Related References */}
      {isAnswered && question.references.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <BookOpen size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">
                Related Learning Materials
              </p>
              <div className="space-y-2">
                {question.references
                  .map(refId => references.find(r => r.id === refId))
                  .filter((ref): ref is Reference => Boolean(ref))
                  .map(ref => (
                    <button
                      key={ref.id}
                      onClick={() => onReferenceSelect(ref.id)}
                      className="block text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline text-left"
                    >
                      → {ref.title}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
