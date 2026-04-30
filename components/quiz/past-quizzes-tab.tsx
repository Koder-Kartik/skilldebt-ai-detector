'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PastQuiz {
  id: string
  skill_name: string
  score: number
  overall_assessment: string
  created_at: string
  correct_answers: number
  total_questions: number
}

export function PastQuizzesTab({ skillName }: { skillName: string }) {
  const [quizzes, setQuizzes] = useState<PastQuiz[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('quiz_sessions')
          .select('*')
          .eq('skill_name', skillName)
          .order('created_at', { ascending: false })
          .limit(10)

        if (!error && data) {
          setQuizzes(data)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuizzes()
  }, [skillName])

  if (isLoading) {
    return <p className="text-gray-600">Loading quiz history...</p>
  }

  if (quizzes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <p className="text-gray-600">No previous quizzes for this skill yet</p>
        <p className="text-sm text-gray-500">Take your first quiz to get started!</p>
      </div>
    )
  }

  const chartData = quizzes
    .sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .map((quiz) => ({
      date: new Date(quiz.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      score: quiz.score,
    }))

  return (
    <div className="space-y-8">
      {/* Progress Chart */}
      {chartData.length > 1 && (
        <Card className="border-0 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg">
          <h3 className="mb-4 font-semibold text-gray-900">Score Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                dot={{ fill: '#3b82f6' }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Quiz List */}
      <div>
        <h3 className="mb-4 font-semibold text-gray-900">Recent Quizzes</h3>
        <div className="space-y-4">
          {quizzes.map((quiz) => {
            const assessmentColor =
              quiz.overall_assessment === 'advanced'
                ? 'bg-green-100 text-green-800'
                : quiz.overall_assessment === 'intermediate'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'

            return (
              <Card key={quiz.id} className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(quiz.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {quiz.correct_answers} of {quiz.total_questions} correct
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {quiz.score.toFixed(0)}%
                      </p>
                      <Badge className={assessmentColor}>
                        {quiz.overall_assessment}
                      </Badge>
                    </div>
                    <Link href={`/diagnosis?quiz=${quiz.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
