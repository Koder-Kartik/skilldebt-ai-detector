'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PastQuizzesTab } from '@/components/quiz/past-quizzes-tab'

function DiagnosisPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [diagnosis, setDiagnosis] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const skill = searchParams.get('skill') || ''
  const level = searchParams.get('level') || ''
  const experience = searchParams.get('experience') || ''
  const goals = searchParams.get('goals') || ''
  const method = searchParams.get('method') || 'quiz'

  useEffect(() => {
    const fetchDiagnosis = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skill, level, experience, goals }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate diagnosis')
        }

        if (!response.body) {
          throw new Error('No response body')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullText += chunk
          setDiagnosis(fullText)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    if (skill) {
      fetchDiagnosis()
    }
  }, [skill, level, experience, goals])

  return (
    <div className="min-h-svh bg-gray-50">
      <DashboardHeader />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Your {skill} Skill Diagnosis</CardTitle>
            <p className="mt-2 text-sm text-gray-600">
              {method === 'quiz' ? 'Based on your quiz performance' : `Based on your current level (${level}) and experience`}
            </p>
          </CardHeader>
          <CardContent>
            {method === 'manual' ? (
              <>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12">
                    <Spinner className="h-8 w-8" />
                    <p className="text-gray-600">Analyzing your skills and creating a personalized diagnosis...</p>
                  </div>
                ) : error ? (
                  <div className="space-y-4">
                    <p className="text-sm text-red-600">{error}</p>
                    <Button onClick={() => router.push('/assessment')} variant="outline">
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Tabs defaultValue="diagnosis" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                        <TabsTrigger value="history">Quiz History</TabsTrigger>
                      </TabsList>
                      <TabsContent value="diagnosis" className="space-y-6">
                        <div className="prose max-w-none">
                          {diagnosis.split('\n').map((line, i) => {
                            if (line.startsWith('##')) {
                              return (
                                <h3 key={i} className="mt-6 text-lg font-semibold text-gray-900">
                                  {line.replace(/^##\s*/, '')}
                                </h3>
                              )
                            }
                            if (line.startsWith('#')) {
                              return (
                                <h2 key={i} className="mt-8 text-xl font-bold text-gray-900">
                                  {line.replace(/^#\s*/, '')}
                                </h2>
                              )
                            }
                            if (line.startsWith('- ')) {
                              return (
                                <li key={i} className="ml-6 list-disc text-gray-700">
                                  {line.replace(/^- /, '')}
                                </li>
                              )
                            }
                            if (line.trim() === '') {
                              return <div key={i} className="h-2" />
                            }
                            return (
                              <p key={i} className="text-gray-700">
                                {line}
                              </p>
                            )
                          })}
                        </div>

                        <div className="space-y-3 border-t border-gray-200 pt-6">
                          <Button
                            onClick={() =>
                              router.push(`/learning-path/${encodeURIComponent(skill)}`)
                            }
                            className="w-full"
                          >
                            Create Learning Path
                          </Button>
                          <Button
                            onClick={() => router.push('/dashboard')}
                            variant="outline"
                            className="w-full"
                          >
                            Back to Dashboard
                          </Button>
                        </div>
                      </TabsContent>
                      <TabsContent value="history">
                        <PastQuizzesTab skillName={skill} />
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <Tabs defaultValue="history" className="w-full">
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="history">Quiz History</TabsTrigger>
                  </TabsList>
                  <TabsContent value="history">
                    <PastQuizzesTab skillName={skill} />
                  </TabsContent>
                </Tabs>
                <div className="space-y-3 border-t border-gray-200 pt-6">
                  <Button
                    onClick={() =>
                      router.push(`/learning-path/${encodeURIComponent(skill)}`)
                    }
                    className="w-full"
                  >
                    Create Learning Path
                  </Button>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function DiagnosisPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12">Loading...</div>}>
      <DiagnosisPageContent />
    </Suspense>
  )
}
