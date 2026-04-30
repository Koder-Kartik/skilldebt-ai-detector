'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard-header'
import { SkillCard } from '@/components/skill-card'
import { StreakCard } from '@/components/streak-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Skill {
  id: string
  skill_name: string
  current_level: string
  gap_count: number
  mastery_score: number
}

interface Streak {
  current_streak: number
  longest_streak: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [skills, setSkills] = useState<Skill[]>([])
  const [streak, setStreak] = useState<Streak>({ current_streak: 0, longest_streak: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      await loadData()
    }

    checkAuth()
  }, [router])

  const loadData = async () => {
    try {
      const supabase = createClient()

      // Load assessed skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('assessed_skills')
        .select('*')

      if (skillsError) throw skillsError

      // Load progress and gaps data
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('*')

      if (progressError) throw progressError

      const { data: gapsData, error: gapsError } = await supabase
        .from('learning_gaps')
        .select('skill_name')

      if (gapsError) throw gapsError

      // Load streak
      const { data: streakData, error: streakError } = await supabase
        .from('daily_streaks')
        .select('current_streak, longest_streak')
        .single()

      if (streakError && streakError.code !== 'PGRST116') throw streakError

      // Combine data
      const skillsWithProgress = (skillsData || []).map((skill) => {
        const progress = progressData?.find((p) => p.skill_name === skill.skill_name)
        const gapCount = (gapsData || []).filter((g) => g.skill_name === skill.skill_name).length

        return {
          id: skill.id,
          skill_name: skill.skill_name,
          current_level: skill.current_level,
          gap_count: gapCount,
          mastery_score: progress?.mastery_score || 0,
        }
      })

      setSkills(skillsWithProgress)
      if (streakData) {
        setStreak({
          current_streak: streakData.current_streak || 0,
          longest_streak: streakData.longest_streak || 0,
        })
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartAssessment = () => {
    router.push('/assessment')
  }

  const handleExploreSkill = (skillName: string) => {
    router.push(`/learning-path/${encodeURIComponent(skillName)}`)
  }

  return (
    <div className="min-h-svh bg-gray-50">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        ) : (
          <>
            {/* Welcome Section */}
            {skills.length === 0 ? (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Welcome to SkillDebt</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-6 text-gray-600">
                    Discover the gaps in your skills and create a personalized learning path to close them. Start by assessing your current skills.
                  </p>
                  <Button onClick={handleStartAssessment} size="lg">
                    Start Skill Assessment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Streak and Stats */}
                <div className="mb-8 grid gap-6 md:grid-cols-2">
                  <StreakCard
                    currentStreak={streak.current_streak}
                    longestStreak={streak.longest_streak}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills Tracked</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-4xl font-bold text-blue-600">{skills.length}</p>
                        <p className="text-sm text-gray-600">Active skill assessments</p>
                        <Button onClick={handleStartAssessment} className="mt-4 w-full" variant="outline">
                          Add Another Skill
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Skills Grid */}
                <div>
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">Your Skills</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {skills.map((skill) => (
                      <SkillCard
                        key={skill.id}
                        skillName={skill.skill_name}
                        currentLevel={skill.current_level}
                        gapCount={skill.gap_count}
                        masteryScore={skill.mastery_score}
                        onExplore={() => handleExploreSkill(skill.skill_name)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
