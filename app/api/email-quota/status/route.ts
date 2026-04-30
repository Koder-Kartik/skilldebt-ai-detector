import { NextRequest, NextResponse } from 'next/server'

/**
 * Email Quota Status API
 * Returns current email quota usage and rate limit information
 * 
 * Endpoint: GET /api/email-quota/status?email=user@example.com
 */

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // In production, fetch from database/Redis
    // For now, return quota information structure
    const quotaStatus = {
      email,
      quotaPerHour: 4,
      quotaRemaining: 4,
      quotaUsed: 0,
      isRateLimited: false,
      approachingLimit: false,
      resetTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      message: 'Email quota available',
    }

    return NextResponse.json(quotaStatus)
  } catch (error) {
    console.error('[v0] Email quota status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
