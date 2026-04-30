'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        // Check if Supabase is configured by looking for the environment variables
        const isSupabaseConfigured =
          typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined' &&
          process.env.NEXT_PUBLIC_SUPABASE_URL !== '' &&
          typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'undefined' &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== ''

        setIsConfigured(isSupabaseConfigured)

        if (isSupabaseConfigured && user) {
          router.push('/dashboard')
        } else if (isSupabaseConfigured) {
          router.push('/auth/login')
        }
      } catch (err) {
        console.error('[v0] Error checking auth:', err)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!isConfigured) {
    return (
      <div className="min-h-svh bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center justify-center min-h-svh px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Welcome to SkillDebt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-center">
                <p className="text-gray-600">
                  Master your learning gaps with AI-powered skill assessment and personalized learning paths.
                </p>
                <p className="text-sm text-gray-500">
                  To get started, you need to configure your Supabase database connection.
                </p>
              </div>

              <div className="space-y-3 rounded-lg bg-blue-50 p-4">
                <h3 className="font-semibold text-sm text-blue-900">Setup Instructions:</h3>
                <ol className="text-sm text-blue-800 space-y-2 ml-4 list-decimal">
                  <li>Click the Settings button (gear icon) in the top right</li>
                  <li>Go to the "Vars" section</li>
                  <li>Add your Supabase credentials:
                    <ul className="ml-4 mt-1 space-y-1 list-disc">
                      <li>NEXT_PUBLIC_SUPABASE_URL</li>
                      <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                    </ul>
                  </li>
                  <li>Refresh the page</li>
                </ol>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 text-center">
                  Don&apos;t have Supabase credentials? Visit{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    supabase.com
                  </a>{' '}
                  to create a free project.
                </p>
              </div>

              <Button onClick={() => location.reload()} className="w-full">
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <p className="text-gray-600">Loading...</p>
    </div>
  )
}
