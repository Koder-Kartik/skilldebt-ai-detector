/**
 * Email Rate Limit Handler
 * Manages Supabase email quotas and implements retry logic with exponential backoff
 */

interface RateLimitConfig {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
}

interface EmailQuotaTracker {
  lastAttemptTime: number
  attemptCount: number
  windowResetTime: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRetries: 3,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 30000, // 30 seconds
  backoffMultiplier: 2,
}

// Track email attempts in-memory (in production, use Redis or database)
const emailQuotaMap = new Map<string, EmailQuotaTracker>()

// Supabase rate limit: 4 emails per hour per address
const SUPABASE_QUOTA_PER_HOUR = 4

/**
 * Calculate delay for exponential backoff
 */
export function getBackoffDelay(attempt: number, config: RateLimitConfig): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt)
  return Math.min(delay, config.maxDelayMs)
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Check if email is approaching quota limit
 */
export function isApproachingQuotaLimit(email: string): boolean {
  const now = Date.now()
  const tracker = emailQuotaMap.get(email)

  if (!tracker) return false

  // Reset if window has passed (hourly window)
  if (now > tracker.windowResetTime) {
    emailQuotaMap.delete(email)
    return false
  }

  // Alert if 75% of quota is consumed (3 out of 4 emails)
  return tracker.attemptCount >= Math.ceil(SUPABASE_QUOTA_PER_HOUR * 0.75)
}

/**
 * Track email attempt and check if rate limited
 */
export function trackEmailAttempt(email: string): { isLimited: boolean; remaining: number } {
  const now = Date.now()
  const hourInMs = 60 * 60 * 1000
  const tracker = emailQuotaMap.get(email)

  if (!tracker || now > tracker.windowResetTime) {
    // New window
    emailQuotaMap.set(email, {
      lastAttemptTime: now,
      attemptCount: 1,
      windowResetTime: now + hourInMs,
    })
    return { isLimited: false, remaining: SUPABASE_QUOTA_PER_HOUR - 1 }
  }

  // Within existing window
  tracker.attemptCount++
  tracker.lastAttemptTime = now

  const remaining = Math.max(0, SUPABASE_QUOTA_PER_HOUR - tracker.attemptCount)
  const isLimited = tracker.attemptCount > SUPABASE_QUOTA_PER_HOUR

  return { isLimited, remaining }
}

/**
 * Get human-readable reset time
 */
export function getQuotaResetTime(email: string): Date | null {
  const tracker = emailQuotaMap.get(email)
  return tracker ? new Date(tracker.windowResetTime) : null
}

/**
 * Retry async function with exponential backoff
 * Use for API calls that may be rate limited
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RateLimitConfig> = {},
  onRetry?: (attempt: number, error: Error, delay: number) => void
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const isRateLimited =
        error instanceof Error &&
        (error.message.includes('429') ||
          error.message.includes('rate limit') ||
          error.message.toLowerCase().includes('too many'))

      if (!isRateLimited || attempt === finalConfig.maxRetries) {
        throw error
      }

      const delay = getBackoffDelay(attempt, finalConfig)
      onRetry?.(attempt + 1, error as Error, delay)

      console.log(
        `[v0] Email rate limited. Retry ${attempt + 1}/${finalConfig.maxRetries} after ${delay}ms`
      )

      await sleep(delay)
    }
  }

  throw new Error('Max retries exceeded')
}

/**
 * Generate rate limit error message with retry guidance
 */
export function generateRateLimitErrorMessage(email: string): string {
  const resetTime = getQuotaResetTime(email)
  const timeUntilReset = resetTime ? Math.ceil((resetTime.getTime() - Date.now()) / 1000) : 0
  const minutesUntilReset = Math.ceil(timeUntilReset / 60)

  return `Too many sign-up attempts. Please wait ${minutesUntilReset} minute(s) before trying again. Email quota resets at ${resetTime?.toLocaleTimeString()}.`
}
