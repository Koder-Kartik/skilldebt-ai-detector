'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { QuestionCard } from './question-card'
import { AnalyzingScreen } from './analyzing-screen'
import { QuizErrorScreen } from './quiz-error-screen'
import { Spinner } from '@/components/ui/spinner'

interface Question {
  number: number
  question: string
  type: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  options: string[]
  correctAnswer: string
  explanation: string
}

interface QuizFlowProps {
  skillName: string
  onComplete: (quizSessionId: string) => void
}

export function QuizFlow({
  skillName,
  onComplete,
}: QuizFlowProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [quizSessionId, setQuizSessionId] = useState<string>('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate questions on mount
  useEffect(() => {
    const generateQuestions = async () => {
      try {
        console.log('[v0] Starting quiz generation for skill:', skillName)
        const response = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillName }),
        })

        if (!response.ok) {
          const errorData = await response.text()
          console.error('[v0] API error:', response.status, errorData)
          
          // Provide context-specific error messages
          if (response.status === 401 || response.status === 403) {
            throw new Error('API Key Configuration Error: The AI service credentials are not properly configured.')
          } else if (response.status === 429) {
            throw new Error('Rate Limit Error: Too many requests. Please wait a moment and try again.')
          } else if (response.status === 500) {
            throw new Error('Service Error: The question generation service encountered an error. Please try again later.')
          } else {
            throw new Error(`Failed to generate questions: ${response.statusText}`)
          }
        }

        const data = await response.json()
        console.log('[v0] Quiz data received:', { sessionId: data.quizSessionId, questionCount: data.questions?.length })
        
        if (!data.quizSessionId || !data.questions || data.questions.length === 0) {
          throw new Error('Invalid response from server: Missing quiz data')
        }
        
        setQuizSessionId(data.quizSessionId)
        setQuestions(data.questions)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred while generating questions'
        console.error('[v0] Quiz generation error:', errorMsg)
        setError(errorMsg)
      } finally {
        setIsLoading(false)
      }
    }

    generateQuestions()
  }, [skillName])

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isAnswered = answers[currentQuestionIndex] !== undefined

  const handleAnswerChange = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handleSubmit = async () => {
    if (!quizSessionId) {
      setError('Quiz session not initialized')
      return
    }

    setIsAnalyzing(true)
    try {
      console.log('[v0] Submitting quiz answers for session:', quizSessionId)
      
      const quizAnswers = questions.map((q, idx) => ({
        questionNumber: q.number,
        topic: q.topic,
        difficulty: q.difficulty,
        isCorrect: answers[idx] === q.correctAnswer,
      }))

      const response = await fetch('/api/quiz/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizSessionId,
          answers: quizAnswers,
          skillName,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('[v0] Analysis error:', response.status, errorData)
        throw new Error(`Failed to analyze quiz: ${response.statusText}`)
      }

      console.log('[v0] Quiz analysis complete')
      onComplete(quizSessionId)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit quiz'
      console.error('[v0] Quiz submit error:', errorMsg)
      setError(errorMsg)
      setIsAnalyzing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto mb-4 h-8 w-8" />
          <p className="text-gray-600">Generating assessment questions...</p>
        </div>
      </div>
    )
  }

  if (isAnalyzing) {
    return <AnalyzingScreen />
  }

  if (error) {
    return (
      <QuizErrorScreen
        error={error}
        onRetry={() => {
          setError(null)
          setIsLoading(true)
          // Trigger re-fetch by resetting state
          setQuestions([])
          setQuizSessionId('')
        }}
        showRetry={true}
      />
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto mb-4 h-8 w-8" />
          <p className="text-gray-600">Loading assessment questions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm font-medium text-gray-600">
          <span>Progress</span>
          <span>
            {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <QuestionCard
        key={currentQuestionIndex}
        questionNumber={currentQuestion.number}
        question={currentQuestion.question}
        difficulty={currentQuestion.difficulty}
        topic={currentQuestion.topic}
        options={currentQuestion.options}
        selectedAnswer={answers[currentQuestionIndex]}
        onAnswerChange={handleAnswerChange}
        isAnswered={isAnswered}
      />

      <div className="mt-8 flex gap-4">
        <Button
          variant="outline"
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
          }
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        <div className="flex-1" />
        <Button
          onClick={handleNext}
          disabled={!isAnswered}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
        </Button>
      </div>
    </div>
  )
}
