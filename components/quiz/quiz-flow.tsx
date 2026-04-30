'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { QuestionCard } from './question-card'
import { AnalyzingScreen } from './analyzing-screen'
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
  quizSessionId: string
  onComplete: () => void
}

export function QuizFlow({
  skillName,
  quizSessionId,
  onComplete,
}: QuizFlowProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate questions on mount
  useEffect(() => {
    const generateQuestions = async () => {
      try {
        const response = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillName }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate questions')
        }

        const text = await response.text()
        const questionsData = JSON.parse(text)
        setQuestions(questionsData)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load questions'
        )
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
    setIsAnalyzing(true)
    try {
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
        throw new Error('Failed to analyze quiz')
      }

      onComplete()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit quiz'
      )
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

  if (error || questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <p className="mb-4 text-red-600">{error || 'Failed to load quiz'}</p>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
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
