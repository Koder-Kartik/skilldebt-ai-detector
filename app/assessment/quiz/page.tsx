'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard-header'
import { QuizFlow } from '@/components/quiz/quiz-flow'
import { QuizResultsScreen } from '@/components/quiz/quiz-results-screen'

interface QuizResult {
  score: number
  correctAnswers: number
  totalQuestions: number
  overallAssessment: string
  gaps: Array<{
    description: string
    category: 'foundational' | 'intermediate' | 'advanced'
    severity: 'low' | 'medium' | 'high'
    relatedQuestions: number[]
  }>
  gapChain: string
  recommendations: string[]
}

function QuizPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const skillName = searchParams.get('skill')
  const [quizSessionId, setQuizSessionId] = useState<string | null>(null)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeQuiz = async () => {
      if (!skillName) {
        router.push('/assessment')
        return
      }

      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        // Create quiz session
        const { data, error } = await supabase
          .from('quiz_sessions')
          .insert({
            user_id: user.id,
            skill_name: skillName,
            diagnosis_method: 'quiz',
            quiz_type: 'comprehensive',
          })
          .select()
          .single()

        if (error) throw error
        setQuizSessionId(data.id)
      } catch (err) {
        console.error('[v0] Quiz initialization error:', err)
        router.push('/assessment')
      } finally {
        setIsLoading(false)
      }
    }

    initializeQuiz()
  }, [skillName, router])

  if (isLoading) {
    return (
      <div className="min-h-svh bg-gray-50">
        <DashboardHeader />
        <main className="flex items-center justify-center py-12">
          <p className="text-gray-600">Initializing quiz...</p>
        </main>
      </div>
    )
  }

  if (!quizSessionId) {
    return null
  }

  if (quizResult) {
    return (
      <div className="min-h-svh bg-gray-50">
        <DashboardHeader />
        <main>
          <QuizResultsScreen
            {...quizResult}
            skillName={skillName || ''}
            onCreatePath={() => {
              router.push(
                `/learning-path/${encodeURIComponent(skillName || '')}?quiz=${quizSessionId}`
              )
            }}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-gray-50">
      <DashboardHeader />
      <main>
        <QuizFlow
          skillName={skillName || ''}
          quizSessionId={quizSessionId}
          onComplete={async () => {
            // Fetch the quiz result
            const supabase = createClient()
            const { data } = await supabase
              .from('quiz_sessions')
              .select('*')
              .eq('id', quizSessionId)
              .single()

            if (data) {
              const { data: gaps } = await supabase
                .from('quiz_gaps')
                .select('*')
                .eq('quiz_session_id', quizSessionId)

              setQuizResult({
                score: data.score,
                correctAnswers: data.correct_answers,
                totalQuestions: data.total_questions,
                overallAssessment: data.overall_assessment,
                gaps: gaps || [],
                gapChain: data.gap_chain || '',
                recommendations: [],
              })
            }
          }}
        />
      </main>
    </div>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12">Loading...</div>}>
      <QuizPageContent />
    </Suspense>
  )
}
