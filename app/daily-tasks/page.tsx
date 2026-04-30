'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StreakCard } from '@/components/streak-card'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'

interface Task {
  id: string
  task_title: string
  task_description: string
  completed: boolean
  due_date: string
  skill_name: string
}

interface Streak {
  current_streak: number
  longest_streak: number
}

export default function DailyTasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [streak, setStreak] = useState<Streak>({ current_streak: 0, longest_streak: 0 })
  const [isLoading, setIsLoading] = useState(true)

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

        const today = new Date().toISOString().split('T')[0]

        // Load today's tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('daily_tasks')
          .select('*')
          .eq('due_date', today)

        if (tasksError) throw tasksError
        setTasks(tasksData || [])

        // Load streak
        const { data: streakData, error: streakError } = await supabase
          .from('daily_streaks')
          .select('current_streak, longest_streak')
          .single()

        if (streakError && streakError.code !== 'PGRST116') throw streakError
        if (streakData) {
          setStreak({
            current_streak: streakData.current_streak || 0,
            longest_streak: streakData.longest_streak || 0,
          })
        }
      } catch (error) {
        console.error('Error loading daily tasks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      })

      if (!response.ok) throw new Error('Failed to complete task')

      const result = await response.json()

      // Update local state
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
      )

      setStreak({
        current_streak: result.streak,
        longest_streak: result.longest_streak,
      })
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  return (
    <div className="min-h-svh bg-gray-50">
      <DashboardHeader />

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Streak Card */}
        <div className="mb-8">
          <StreakCard
            currentStreak={streak.current_streak}
            longestStreak={streak.longest_streak}
          />
        </div>

        {/* Tasks Section */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4 text-gray-600">
                No tasks for today! Great work if you have completed everything.
              </p>
              <Button onClick={() => router.push('/learning-path')} variant="outline">
                Browse Learning Paths
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Learning Tasks</CardTitle>
              <p className="mt-2 text-sm text-gray-600">
                {tasks.filter((t) => t.completed).length} of {tasks.length} completed
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleCompleteTask(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h3
                        className={`font-semibold ${
                          task.completed
                            ? 'line-through text-gray-400'
                            : 'text-gray-900'
                        }`}
                      >
                        {task.task_title}
                      </h3>
                      {task.task_description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {task.task_description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        Skill: {task.skill_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
