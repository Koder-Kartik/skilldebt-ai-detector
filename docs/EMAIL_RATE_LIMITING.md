# Email Rate Limiting & Quota Management

## Overview

SkillDebt implements comprehensive email rate limiting to handle Supabase Auth's email service quotas and prevent service degradation during high traffic periods.

## Rate Limiting Policies

### Supabase Email Service Limits
- **Per-Address Limit**: 4 emails per hour per unique email address
- **Provider**: Supabase uses Auth0's email service for transactional emails
- **Rate Limit Status Code**: HTTP 429 (Too Many Requests)

### Implementation Details

#### 1. Email Quota Tracking (`/lib/email-rate-limit.ts`)

Tracks email attempts per address with hourly windowing:

```typescript
// Track email attempt
const { isLimited } = trackEmailAttempt('user@example.com')

// Check if approaching limit (75% quota consumed)
const approaching = isApproachingQuotaLimit('user@example.com')

// Get reset time
const resetTime = getQuotaResetTime('user@example.com')
```

**Quota States:**
- ✅ **Available**: 0-3 emails sent in current hour
- ⚠️ **Approaching**: 3+ emails sent (75% of quota)
- ❌ **Limited**: 4+ emails sent (quota exceeded)

#### 2. Exponential Backoff Retry Strategy

Implements automatic retry with exponential backoff for rate-limited requests:

```typescript
await retryWithBackoff(
  async () => {
    // API call that might be rate limited
  },
  {
    maxRetries: 3,
    initialDelayMs: 1000,      // 1 second
    maxDelayMs: 30000,         // 30 seconds max
    backoffMultiplier: 2,      // Double delay each retry
  },
  (attempt, error, delay) => {
    console.log(`Retry ${attempt} after ${delay}ms`)
  }
)
```

**Backoff Delays:**
- Attempt 1: ~1 second
- Attempt 2: ~2 seconds  
- Attempt 3: ~4 seconds
- Maximum: 30 seconds

#### 3. Error Messages

Users receive clear, actionable error messages when rate limited:

```
Too many sign-up attempts. Please wait 45 minute(s) before trying again. 
Email quota resets at 3:15 PM.
```

## Application Flow

### Sign-Up Page (`/app/auth/sign-up/page.tsx`)

```
User submits form
    ↓
Check if email approaching quota (75%)
    ↓
Track email attempt
    ↓
If limited → Return error message
    ↓
Attempt sign-up with retry logic
    ↓
On 429 → Wait 1s, retry (up to 3 times)
    ↓
Success → Redirect to confirmation page
```

### Login Page (`/app/auth/login/page.tsx`)

Login also implements retry logic for password reset email flows.

## Monitoring & Debugging

### Email Quota Status API

```bash
GET /api/email-quota/status?email=user@example.com

Response:
{
  "email": "user@example.com",
  "quotaPerHour": 4,
  "quotaRemaining": 2,
  "quotaUsed": 2,
  "isRateLimited": false,
  "approachingLimit": false,
  "resetTime": "2026-04-30T15:30:00.000Z",
  "message": "Email quota available"
}
```

### Browser Console Logs

Enable debugging via browser console:

```javascript
// In sign-up page
[v0] Email rate limited. Retry 1/3 after 1000ms
[v0] Sign-up attempt 1 failed. Retrying in 1000ms... Too many requests
[v0] Sign-up error: Account created successfully
```

### Server Logs

Check application logs for rate limit events:

```
[v0] Email rate limited. Retry 2/3 after 2000ms
[v0] Sign-up attempt 2 failed. Retrying in 2000ms... 429 Too Many Requests
```

## Configuration

### Customizing Rate Limits

Edit `/lib/email-rate-limit.ts` to adjust limits:

```typescript
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRetries: 3,              // Increase for more retry attempts
  initialDelayMs: 1000,       // Adjust initial wait time
  maxDelayMs: 30000,          // Cap on maximum wait time
  backoffMultiplier: 2,       // Steepness of exponential curve
}

const SUPABASE_QUOTA_PER_HOUR = 4  // Change quota threshold
```

### Environment Variables

No additional environment variables required. Configuration is hardcoded based on Supabase's limits.

## Troubleshooting

### Issue: Users Cannot Sign Up

**Symptoms:**
- "Too many sign-up attempts" error
- Multiple failed attempts within an hour

**Solutions:**
1. **User-level**: Wait until quota resets (shown in error message)
2. **Admin-level**: 
   - Check email quota status via API
   - Monitor server logs for rate limit patterns
   - Increase `maxRetries` if experiencing spikes

### Issue: Sign-Up Takes Too Long

**Symptoms:**
- Hanging on "Creating account..." for 10+ seconds
- Multiple retries shown in console

**Solutions:**
1. Check network tab for 429 responses
2. Reduce `initialDelayMs` if delays are too long
3. Consider implementing request queuing for high-traffic scenarios

### Issue: Rate Limit Resets Not Working

**Symptoms:**
- Users still rate limited after 1 hour
- Quota tracker returning stale times

**Solutions:**
1. The in-memory quota tracker resets automatically per-session
2. In production, migrate to Redis-backed tracking for persistence across restarts
3. Add server-side quota persistence to database

## Production Recommendations

### 1. Database-Backed Quota Tracking

Move from in-memory tracking to Supabase:

```sql
CREATE TABLE email_quota_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  attempt_count INTEGER DEFAULT 0,
  window_reset_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Redis Integration

For distributed systems, use Upstash Redis:

```typescript
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

// Store quota state in Redis
await redis.set(`email:${email}:quota`, 1, { ex: 3600 })
```

### 3. Rate Limit Alerts

Implement monitoring for quota exhaustion:

```typescript
if (quotaUsed >= THRESHOLD) {
  // Send alert to admins
  // Log metrics
  // Trigger analytics event
}
```

### 4. Email Service Alternatives

If rate limiting persists, consider alternatives:

- **SendGrid** (higher rate limits)
- **Mailgun** (configurable quotas)
- **AWS SES** (scalable email service)
- **Custom email provider** (dedicated SMTP)

## Testing

### Manual Testing

```bash
# Test quota tracking
curl "http://localhost:3000/api/email-quota/status?email=test@example.com"

# Test sign-up with rate limit
1. Navigate to /auth/sign-up
2. Enter test email
3. Submit form
4. Spam submit button to trigger 429 responses
5. Observe retry behavior in console
```

### Automated Testing

```typescript
import { retryWithBackoff, trackEmailAttempt } from '@/lib/email-rate-limit'

describe('Email Rate Limiting', () => {
  it('should track email attempts', () => {
    const { isLimited } = trackEmailAttempt('test@example.com')
    expect(isLimited).toBe(false)
  })

  it('should retry with exponential backoff', async () => {
    let attempts = 0
    try {
      await retryWithBackoff(
        async () => {
          attempts++
          throw new Error('429 Too Many Requests')
        },
        { maxRetries: 2 }
      )
    } catch (e) {
      expect(attempts).toBe(3) // Initial + 2 retries
    }
  })
})
```

## Related Documentation

- [Supabase Auth Email Configuration](https://supabase.com/docs/guides/auth/auth-email)
- [Rate Limiting Best Practices](https://www.cloudflare.com/learning/bwc/what-is-rate-limiting/)
- [Exponential Backoff Retry Strategies](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)

## Support

For rate limiting issues:

1. Check browser DevTools → Network tab for 429 responses
2. Review server logs for retry patterns
3. Verify Supabase project quota settings in dashboard
4. Contact Supabase support if quotas exceed expected limits
