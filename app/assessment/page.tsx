'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { DiagnosisEntry } from '@/components/quiz/diagnosis-entry'

const skillSuggestions = [
  'React',
  'TypeScript',
  'Python',
  'Machine Learning',
  'Data Analysis',
  'Cloud Architecture',
  'DevOps',
  'Project Management',
  'Leadership',
  'Communication',
]

export default function AssessmentPage() {
  const router = useRouter()
  const [skillName, setSkillName] = useState('')
  const [level, setLevel] = useState('beginner')
  const [experience, setExperience] = useState('')
  const [goals, setGoals] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showDiagnosisChoice, setShowDiagnosisChoice] = useState(false)
  const [selectedDiagnosisMethod, setSelectedDiagnosisMethod] = useState<'quiz' | 'manual' | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowDiagnosisChoice(true)
  }

  const handleDiagnosisStart = async (method: 'quiz' | 'manual') => {
    setSelectedDiagnosisMethod(method)
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Save the assessed skill
      const { error: skillError } = await supabase.from('assessed_skills').upsert(
        [
          {
            user_id: user.id,
            skill_name: skillName,
            current_level: level,
            assessment_date: new Date().toISOString(),
          },
        ],
        { onConflict: 'user_id,skill_name' }
      )

      if (skillError) throw skillError

      // Initialize progress record
      const { error: progressError } = await supabase.from('progress').upsert(
        [
          {
            user_id: user.id,
            skill_name: skillName,
            mastery_score: getLevelScore(level),
          },
        ],
        { onConflict: 'user_id,skill_name' }
      )

      if (progressError) throw progressError

      // Redirect to appropriate diagnosis page
      if (method === 'quiz') {
        router.push(`/assessment/quiz?skill=${encodeURIComponent(skillName)}`)
      } else {
        router.push(
          `/diagnosis?skill=${encodeURIComponent(skillName)}&level=${level}&experience=${encodeURIComponent(experience)}&goals=${encodeURIComponent(goals)}&method=manual`
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
      setShowDiagnosisChoice(false)
    }
  }

  const getLevelScore = (lvl: string) => {
    const scores = { beginner: 20, intermediate: 50, advanced: 75, expert: 95 }
    return scores[lvl as keyof typeof scores] || 0
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSkillName(suggestion)
    setShowSuggestions(false)
  }

  if (showDiagnosisChoice && !isLoading) {
    return (
      <div className="min-h-svh bg-gray-50">
        <DashboardHeader />
        <main>
          <DiagnosisEntry
            skillName={skillName}
            onQuizStart={() => handleDiagnosisStart('quiz')}
            onManualStart={() => handleDiagnosisStart('manual')}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-gray-50">
      <DashboardHeader />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Assess Your Skill</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Skill Name */}
              <div className="space-y-2">
                <Label htmlFor="skill">Skill Name *</Label>
                <div className="relative">
                  <Input
                    id="skill"
                    type="text"
                    placeholder="e.g., React, Python, Leadership"
                    value={skillName}
                    onChange={(e) => {
                      setSkillName(e.target.value)
                      setShowSuggestions(e.target.value.length > 0)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                    required
                  />
                  {showSuggestions && skillName && (
                    <div className="absolute top-full z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                      {skillSuggestions
                        .filter((s) => s.toLowerCase().includes(skillName.toLowerCase()))
                        .map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Current Level */}
              <div className="space-y-2">
                <Label htmlFor="level">Current Level *</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger id="level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  placeholder="e.g., 2"
                  min="0"
                  step="0.5"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>

              {/* Goals */}
              <div className="space-y-2">
                <Label htmlFor="goals">Learning Goals (optional)</Label>
                <textarea
                  id="goals"
                  placeholder="What do you want to achieve with this skill? E.g., Build production React apps, Lead a team, etc."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Setting Up Assessment...
                  </>
                ) : (
                  'Choose Diagnosis Method'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
