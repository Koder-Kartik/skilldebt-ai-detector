'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Phase {
  week: number
  title: string
  topics: string[]
  exercises: string[]
  resources: string[]
  time_commitment: string
}

interface PathData {
  title: string
  duration_weeks: number
  difficulty: string
  phases: Phase[]
  daily_tasks: Array<{ day: string; tasks: string[]; estimated_time: string }>
  success_metrics: string[]
  checkpoint_assessments: string[]
}

export default function LearningPathPage() {
  const router = useRouter()
  const params = useParams()
  const skill = decodeURIComponent(params.skill as string)
  const [pathData, setPathData] = useState<PathData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedWeeks, setCompletedWeeks] = useState(0)

  useEffect(() => {
    const loadPath = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        // Try to load from database first
        const { data: existingPath, error: fetchError } = await supabase
          .from('learning_paths')
          .select('*')
          .eq('user_id', user.id)
          .eq('skill_name', skill)
          .single()

        if (existingPath && !fetchError) {
          setPathData(JSON.parse(existingPath.path_content))
        } else {
          // Generate new path
          const response = await fetch('/api/learning-path', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              skill,
              level: 'intermediate',
              goals: 'Master the skill',
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to generate learning path')
          }

          const data = await response.json()
          setPathData(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    loadPath()
  }, [skill, router])

  if (isLoading) {
    return (
      <div className="min-h-svh bg-gray-50">
        <DashboardHeader />
        <main className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Spinner className="h-8 w-8" />
            <p className="text-gray-600">Creating your personalized learning path...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !pathData) {
    return (
      <div className="min-h-svh bg-gray-50">
        <DashboardHeader />
        <main className="mx-auto max-w-4xl px-6 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4 text-red-600">{error || 'Failed to load learning path'}</p>
              <Button onClick={() => router.push('/dashboard')} variant="outline">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const progressData = [
    { week: 1, completed: 0, remaining: 7 },
    { week: 2, completed: 0, remaining: 7 },
    { week: 3, completed: 0, remaining: 7 },
    { week: 4, completed: 0, remaining: 7 },
  ]

  return (
    <div className="min-h-svh bg-gray-50">
      <DashboardHeader />

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pathData.title}</h1>
              <p className="mt-2 text-gray-600">
                {pathData.duration_weeks}-week journey to mastery
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              {pathData.difficulty}
            </Badge>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                {pathData.duration_weeks}
              </p>
              <p className="text-xs text-gray-500">weeks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Phases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                {pathData.phases.length}
              </p>
              <p className="text-xs text-gray-500">learning phases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Checkpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                {pathData.checkpoint_assessments.length}
              </p>
              <p className="text-xs text-gray-500">assessments</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" label={{ value: 'Week', position: 'insideBottomRight', offset: -5 }} />
                <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#3b82f6" name="Completed" />
                <Bar dataKey="remaining" fill="#e5e7eb" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Phases */}
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Learning Phases</h2>
        <div className="space-y-6">
          {pathData.phases.map((phase) => (
            <Card key={phase.week}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Week {phase.week}: {phase.title}
                    </CardTitle>
                    <p className="mt-1 text-sm text-gray-600">
                      Time commitment: {phase.time_commitment}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Topics</h4>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-gray-700">
                    {phase.topics.map((topic, i) => (
                      <li key={i}>{topic}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">Exercises</h4>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-gray-700">
                    {phase.exercises.map((exercise, i) => (
                      <li key={i}>{exercise}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">Resources</h4>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-gray-700">
                    {phase.resources.map((resource, i) => (
                      <li key={i}>{resource}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Success Metrics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Success Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2 text-gray-700">
              {pathData.success_metrics.map((metric, i) => (
                <li key={i}>{metric}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <Button className="w-full" size="lg">
            Start Learning
          </Button>
          <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  )
}
