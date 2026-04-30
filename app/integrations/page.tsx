'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Integration {
  id: string
  integration_type: string
  is_active: boolean
}

export default function IntegrationsPage() {
  const router = useRouter()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadIntegrations = async () => {
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
          .from('calendar_integrations')
          .select('*')

        if (error) throw error
        setIntegrations(data || [])
      } catch (error) {
        console.error('Error loading integrations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadIntegrations()
  }, [router])

  const handleConnectGoogle = async (type: 'google_calendar' | 'google_drive') => {
    // For now, show a message that OAuth setup is needed
    alert(
      `To connect ${type === 'google_calendar' ? 'Google Calendar' : 'Google Drive'}, you would need to set up OAuth credentials. In a production app, this would redirect to Google\'s authentication flow.`
    )
  }

  const handleDisconnect = async (integrationId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('calendar_integrations')
        .delete()
        .eq('id', integrationId)

      if (error) throw error

      setIntegrations((prev) => prev.filter((i) => i.id !== integrationId))
    } catch (error) {
      console.error('Error disconnecting:', error)
    }
  }

  return (
    <div className="min-h-svh bg-gray-50">
      <DashboardHeader />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Integrations</h1>

        <div className="space-y-6">
          {/* Google Calendar Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Google Calendar</CardTitle>
                  <p className="mt-2 text-sm text-gray-600">
                    Sync your learning schedule with Google Calendar
                  </p>
                </div>
                {integrations.some((i) => i.integration_type === 'google_calendar' && i.is_active) ? (
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">Not Connected</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Automatically create calendar events for your learning tasks and get reminders.
              </p>
              {integrations.some((i) => i.integration_type === 'google_calendar' && i.is_active) ? (
                <Button
                  onClick={() => {
                    const id = integrations.find(
                      (i) => i.integration_type === 'google_calendar'
                    )?.id
                    if (id) handleDisconnect(id)
                  }}
                  variant="destructive"
                >
                  Disconnect
                </Button>
              ) : (
                <Button onClick={() => handleConnectGoogle('google_calendar')}>
                  Connect Google Calendar
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Google Drive Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Google Drive</CardTitle>
                  <p className="mt-2 text-sm text-gray-600">
                    Save your learning paths and progress reports
                  </p>
                </div>
                {integrations.some((i) => i.integration_type === 'google_drive' && i.is_active) ? (
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">Not Connected</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Export your learning resources and progress reports to Google Drive for easy access and sharing.
              </p>
              {integrations.some((i) => i.integration_type === 'google_drive' && i.is_active) ? (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      const id = integrations.find(
                        (i) => i.integration_type === 'google_drive'
                      )?.id
                      if (id) handleDisconnect(id)
                    }}
                    variant="destructive"
                  >
                    Disconnect
                  </Button>
                  <Button variant="outline" className="w-full">
                    Export Current Path
                  </Button>
                </div>
              ) : (
                <Button onClick={() => handleConnectGoogle('google_drive')}>
                  Connect Google Drive
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Info Section */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base">About Integrations</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              <ul className="list-inside list-disc space-y-2">
                <li>
                  <strong>Google Calendar:</strong> Your daily learning tasks will be automatically synced
                </li>
                <li>
                  <strong>Google Drive:</strong> Export progress reports and learning materials for offline access
                </li>
                <li>Your data is encrypted and shared securely with Google services</li>
                <li>You can disconnect integrations at any time from this page</li>
              </ul>
            </CardContent>
          </Card>
        </div>

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
