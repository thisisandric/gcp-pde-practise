'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { QuizQuestion } from '../data/quiz'
import QuestionCard from './QuestionCard'
import ResultsCard from './ResultsCard'
import { ChevronRight, ChevronLeft, BookOpen, RotateCcw } from 'lucide-react'

interface QuizProps {
  questions: QuizQuestion[]
  onReferenceSelect: (id: string) => void
}

interface TopicScore {
  total: number
  correct: number
}

const STORAGE_KEY = 'gcp-pde-quiz-progress-v1'
const STORAGE_VERSION = 1
const MAX_AGE_MS = 15 * 24 * 60 * 60 * 1000

interface StoredProgress {
  version: number
  updatedAt: string
  currentIndex: number
  selectedAnswers: Record<number, number>
  answeredQuestions: number[]
  showResults: boolean
}

export default function Quiz({ questions, onReferenceSelect }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  // Restore persisted progress on mount (client-only, avoids SSR/hydration mismatch)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: StoredProgress = JSON.parse(raw)
        const age = Date.now() - new Date(parsed.updatedAt).getTime()
        const isFresh = Number.isFinite(age) && age <= MAX_AGE_MS

        if (isFresh && parsed.version === STORAGE_VERSION) {
          const validIds = new Set(questions.map(q => q.id))

          const restoredAnswers: Record<number, number> = {}
          Object.entries(parsed.selectedAnswers || {}).forEach(([idStr, optionIndex]) => {
            const id = Number(idStr)
            const question = questions.find(q => q.id === id)
            if (question && validIds.has(id) && question.options[optionIndex] !== undefined) {
              restoredAnswers[id] = optionIndex
            }
          })

          const restoredAnswered = new Set(
            (parsed.answeredQuestions || []).filter(id => validIds.has(id) && id in restoredAnswers)
          )

          const clampedIndex = Math.min(Math.max(parsed.currentIndex || 0, 0), questions.length - 1)

          setSelectedAnswers(restoredAnswers)
          setAnsweredQuestions(restoredAnswered)
          setCurrentIndex(clampedIndex)
          setShowResults(Boolean(parsed.showResults))
        } else {
          window.localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist progress on every relevant change, once hydrated
  useEffect(() => {
    if (!hydrated) return
    const progress: StoredProgress = {
      version: STORAGE_VERSION,
      updatedAt: new Date().toISOString(),
      currentIndex,
      selectedAnswers,
      answeredQuestions: Array.from(answeredQuestions),
      showResults,
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      // localStorage unavailable (e.g. private browsing quota) — progress just won't persist
    }
  }, [hydrated, currentIndex, selectedAnswers, answeredQuestions, showResults])

  const currentQuestion = questions[currentIndex]
  const isAnswered = answeredQuestions.has(currentQuestion.id)

  const topicScores = useMemo(() => {
    const scores: Record<string, TopicScore> = {}
    
    questions.forEach(q => {
      if (!scores[q.topic]) {
        scores[q.topic] = { total: 0, correct: 0 }
      }
      scores[q.topic].total += 1
      
      if (selectedAnswers[q.id] !== undefined) {
        const isCorrect = q.options[selectedAnswers[q.id]].correct
        if (isCorrect) {
          scores[q.topic].correct += 1
        }
      }
    })
    
    return scores
  }, [questions, selectedAnswers])

  const score = useMemo(() => {
    let correct = 0
    questions.forEach(q => {
      if (selectedAnswers[q.id] !== undefined) {
        if (q.options[selectedAnswers[q.id]].correct) {
          correct += 1
        }
      }
    })
    return correct
  }, [questions, selectedAnswers])

  const handleAnswer = (optionIndex: number) => {
    if (!isAnswered) {
      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: optionIndex
      }))
      setAnsweredQuestions(prev => new Set([...prev, currentQuestion.id]))
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleRestart = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    setCurrentIndex(0)
    setSelectedAnswers({})
    setShowResults(false)
    setAnsweredQuestions(new Set())
  }

  const handleResetClick = () => {
    if (window.confirm('Reset your quiz progress? This will clear all your answers and start from question 1.')) {
      handleRestart()
    }
  }

  if (!hydrated) {
    return <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8" />
  }

  if (showResults) {
    return (
      <ResultsCard
        score={score}
        total={questions.length}
        topicScores={topicScores}
        onRestart={handleRestart}
      />
    )
  }

  const isAnsweredCorrect = isAnswered && 
    selectedAnswers[currentQuestion.id] !== undefined && 
    questions[currentIndex].options[selectedAnswers[currentQuestion.id]].correct

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {answeredQuestions.size} answered
            </span>
            <button
              onClick={handleResetClick}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <RotateCcw size={14} />
              Reset progress
            </button>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <QuestionCard
        question={currentQuestion}
        isAnswered={isAnswered}
        selectedOptionIndex={selectedAnswers[currentQuestion.id]}
        onAnswer={handleAnswer}
        onReferenceSelect={onReferenceSelect}
      />

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`
            flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            ${currentIndex === 0
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
            }
          `}
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className={`
            flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            ${isAnswered
              ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }
          `}
        >
          {currentIndex === questions.length - 1 ? (
            <>
              Finish Quiz
              <ChevronRight size={20} />
            </>
          ) : (
            <>
              Next
              <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>

      {/* Hint */}
      {!isAnswered && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">Hint:</span> Select an answer to proceed to the next question.
          </p>
        </div>
      )}
    </div>
  )
}
