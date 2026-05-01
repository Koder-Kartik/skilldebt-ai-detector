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
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)

  useEffect(() => {
    if (!skillName) {
      router.push('/assessment')
    }
  }, [skillName, router])

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
          onComplete={async (completedSessionId: string) => {
            console.log('[v0] Quiz completed, fetching results for session:', completedSessionId)
            // Fetch the quiz result
            const supabase = createClient()
            const { data, error } = await supabase
              .from('quiz_sessions')
              .select('*')
              .eq('id', completedSessionId)
              .single()

            if (error) {
              console.error('[v0] Error fetching quiz session:', error)
              return
            }

            if (data) {
              const { data: gaps } = await supabase
                .from('quiz_gaps')
                .select('*')
                .eq('quiz_session_id', completedSessionId)

              console.log('[v0] Quiz results fetched:', { score: data.score, gaps: gaps?.length })
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
