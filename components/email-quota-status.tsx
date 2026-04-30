'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface QuotaStatus {
  email: string
  quotaPerHour: number
  quotaRemaining: number
  quotaUsed: number
  isRateLimited: boolean
  approachingLimit: boolean
  resetTime: string
  message: string
}

export function EmailQuotaStatus({ email }: { email: string }) {
  const [quota, setQuota] = useState<QuotaStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const response = await fetch(
          `/api/email-quota/status?email=${encodeURIComponent(email)}`
        )
        if (!response.ok) throw new Error('Failed to fetch quota')
        const data = await response.json()
        setQuota(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading quota')
      } finally {
        setLoading(false)
      }
    }

    fetchQuota()
    // Poll every 30 seconds
    const interval = setInterval(fetchQuota, 30000)
    return () => clearInterval(interval)
  }, [email])

  if (loading) return <div className="text-sm text-gray-600">Loading quota status...</div>
  if (error) return <div className="text-sm text-red-600">Error: {error}</div>
  if (!quota) return null

  const usagePercent = (quota.quotaUsed / quota.quotaPerHour) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Email Quota Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Used</span>
            <span className="font-medium">
              {quota.quotaUsed} / {quota.quotaPerHour}
            </span>
          </div>
          <Progress value={usagePercent} className="h-2" />
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            {quota.isRateLimited ? (
              <span className="font-medium text-red-600">❌ Rate Limited</span>
            ) : quota.approachingLimit ? (
              <span className="font-medium text-yellow-600">⚠️ Approaching Limit</span>
            ) : (
              <span className="font-medium text-green-600">✅ Available</span>
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Resets</span>
            <span>{new Date(quota.resetTime).toLocaleTimeString()}</span>
          </div>
        </div>

        <p className="rounded-md bg-blue-50 p-2 text-xs text-blue-800">
          {quota.message}
        </p>
      </CardContent>
    </Card>
  )
}
