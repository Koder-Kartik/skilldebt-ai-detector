'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface ProgressData {
  skill_name: string
  mastery_score: number
  tasks_completed: number
  created_at: string
}

export default function ProgressPage() {
  const router = useRouter()
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data, error } = await supabase
          .from('progress')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        setProgressData(data || [])

        // Prepare chart data
        const skillChartData = (data || []).map((item) => ({
          skill: item.skill_name,
          mastery: item.mastery_score,
          tasks: item.tasks_completed,
        }))

        setChartData(skillChartData)
      } catch (error) {
        console.error('Error loading progress data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-svh bg-gray-50">
        <DashboardHeader />
        <main className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-gray-50">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Your Learning Progress</h1>

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            {/* Mastery Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Mastery Scores by Skill</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="mastery" fill="#3b82f6" name="Mastery Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tasks Completed Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tasks Completed by Skill</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#8b5cf6" name="Tasks Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {progressData.length === 0 ? (
              <p className="text-gray-600">No progress data yet. Start a learning path to track your progress.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Skill</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Mastery Score</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Tasks Completed</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressData.map((item) => (
                      <tr key={item.skill_name} className="border-b border-gray-100">
                        <td className="px-4 py-4 text-gray-900">{item.skill_name}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-gray-200">
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${item.mastery_score}%` }}
                              />
                            </div>
                            <span className="text-gray-900">
                              {item.mastery_score.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-900">{item.tasks_completed}</td>
                        <td className="px-4 py-4 text-gray-600">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8">
          <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  )
}
