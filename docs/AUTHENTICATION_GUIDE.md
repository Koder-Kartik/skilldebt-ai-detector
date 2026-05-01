# SkillDebt Authentication System Guide

## Overview

SkillDebt implements a production-ready authentication system using Supabase Auth with enhanced client-side validation, security best practices, and comprehensive error handling.

## Architecture

### Components

```
Authentication Flow:
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Sign Up   │  →   │   Validate   │  →   │  Supabase    │
│   Form      │      │   Input      │      │  Auth        │
└─────────────┘      └──────────────┘      └──────────────┘
                            ↓
                     ┌──────────────┐
                     │ Email Verify │
                     │ (Required)   │
                     └──────────────┘
                            ↓
                     ┌──────────────┐
                     │  Dashboard   │
                     │   Access     │
                     └──────────────┘
```

### Stack
- **Frontend**: Next.js 16 with TypeScript
- **Auth Provider**: Supabase Auth
- **Session Management**: Supabase Session (HTTP-only cookies)
- **Validation**: Client-side + Supabase server-side
- **Password Storage**: Bcrypt (handled by Supabase)

## Features

### Sign-Up Process

#### 1. Input Validation
All inputs are validated before submission:

```typescript
Email Validation:
✓ Format check (RFC 5322 simplified)
✓ Maximum length (254 characters)
✓ Non-empty

Password Validation:
✓ Minimum 8 characters
✓ At least one uppercase letter (A-Z)
✓ At least one lowercase letter (a-z)
✓ At least one number (0-9)
✓ At least one special character (!@#$%^&*)

Confirmation:
✓ Passwords must match
✓ Real-time feedback
```

#### 2. Real-Time Feedback
- Password strength indicator (Weak → Fair → Good → Strong)
- Live validation errors for each field
- Helpful suggestions for improving password
- Visual confirmation when passwords match

#### 3. Server-Side Security
After client validation, Supabase provides:
- Password hashing with bcrypt (cost factor 10)
- SQL injection prevention via parameterized queries
- CSRF protection via secure tokens
- Rate limiting (4 emails per hour per address)

#### 4. Email Verification
Requires email confirmation before account activation:
- Confirmation email sent to provided address
- 24-hour link expiration
- Resendable confirmation emails
- User can't log in without confirmed email

### Login Process

#### 1. Credential Verification
- Email format validation
- Password non-empty check
- Automatic retry on transient failures (429 errors)

#### 2. Session Management
- Secure HTTP-only cookies
- Session automatically refreshed
- Middleware validates on every request
- Automatic logout on expiration

#### 3. Error Handling
Clear, user-friendly error messages:
- "Invalid login credentials"
- "Email not confirmed"
- "Too many login attempts"

## Implementation Details

### File Structure

```
app/
├── auth/
│   ├── login/
│   │   └── page.tsx          # Login page with retry logic
│   ├── sign-up/
│   │   └── page.tsx          # Signup with full validation
│   ├── sign-up-success/
│   │   └── page.tsx          # Post-signup confirmation page
│   ├── error/
│   │   └── page.tsx          # Auth error handling
│   └── callback/
│       └── route.ts          # OAuth callback handler

lib/
├── supabase/
│   ├── client.ts             # Browser client setup
│   ├── server.ts             # Server client setup
│   └── proxy.ts              # Session refresh middleware
├── auth-validators.ts         # Validation functions
└── email-rate-limit.ts       # Rate limiting logic

components/
├── password-strength-indicator.tsx  # Real-time feedback
└── email-quota-status.tsx           # Admin quota display

middleware.ts                  # Session validation middleware
```

### Validation Utilities

#### Password Validation
```typescript
import { validatePassword, getPasswordStrengthColor } from '@/lib/auth-validators'

const result = validatePassword('MyPassword123!')
// {
//   isValid: true,
//   strength: 'strong',
//   errors: [],
//   suggestions: []
// }
```

#### Email Validation
```typescript
import { validateEmail } from '@/lib/auth-validators'

const result = validateEmail('user@example.com')
// { isValid: true }
```

#### Form Validation
```typescript
import { validateSignupForm } from '@/lib/auth-validators'

const result = validateSignupForm(email, password, confirmPassword)
// {
//   isValid: false,
//   errors: {
//     password: 'Password must be at least 8 characters long',
//     confirmPassword: 'Passwords do not match'
//   }
// }
```

### Error Handling

#### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid email format | Malformed email | Use correct format: user@domain.com |
| Password too weak | Doesn't meet requirements | Add uppercase, number, special char |
| Passwords don't match | Confirmation mismatch | Ensure both password fields match |
| Email already registered | Account exists | Use login page or password reset |
| Email not confirmed | Confirmation pending | Click link in confirmation email |
| Too many attempts | Rate limit exceeded | Wait 1 hour before trying again |
| Supabase not configured | Missing environment variables | Set NEXT_PUBLIC_SUPABASE_URL and KEY |

## Security Best Practices

### Password Security
- ✅ 8+ character minimum enforced
- ✅ Complexity requirements enforced
- ✅ Never transmitted in plaintext
- ✅ Hashed with bcrypt (cost 10) on server
- ✅ No password recovery by admin (account recovery only)

### Email Security
- ✅ Email verification required before account activation
- ✅ 24-hour expiring verification links
- ✅ Rate limiting on email sends (4 per hour)
- ✅ Secure token generation

### Session Security
- ✅ HTTP-only cookies (JavaScript can't access)
- ✅ Secure flag set (HTTPS only in production)
- ✅ Same-site attribute set (CSRF protection)
- ✅ Automatic expiration (24 hours)
- ✅ Automatic refresh on activity

### Network Security
- ✅ HTTPS enforced in production
- ✅ Credentials via POST only (never GET)
- ✅ CORS properly configured
- ✅ CSP headers for XSS protection

## Testing

### Manual Testing Checklist

```
Sign-Up:
☐ Invalid email rejected
☐ Weak password rejected with suggestions
☐ Password mismatch detected
☐ Successful signup redirects to confirmation
☐ Email verification required
☐ Confirmation email received
☐ Confirmation link works
☐ Rate limiting triggered after 4 attempts

Login:
☐ Correct credentials accepted
☐ Wrong password rejected
☐ Non-existent account rejected
☐ Unconfirmed email rejected
☐ Session persists on page reload
☐ Logout clears session
☐ Protected pages require auth
☐ Redirect to login when expired

Edge Cases:
☐ Copy email from form
☐ Paste password
☐ Browser back button after logout
☐ Multiple tabs with different sessions
☐ Concurrent signup attempts
☐ Very long passwords (1000+ chars)
```

### Automated Testing Example

```typescript
import { validatePassword, validateEmail, validateSignupForm } from '@/lib/auth-validators'

describe('Authentication Validators', () => {
  it('accepts valid passwords', () => {
    const result = validatePassword('MyPassword123!')
    expect(result.isValid).toBe(true)
    expect(result.strength).toBe('strong')
  })

  it('rejects weak passwords', () => {
    const result = validatePassword('weak')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Password must be at least 8 characters long')
  })

  it('validates email format', () => {
    expect(validateEmail('user@example.com').isValid).toBe(true)
    expect(validateEmail('invalid-email').isValid).toBe(false)
  })

  it('validates complete signup form', () => {
    const result = validateSignupForm(
      'user@example.com',
      'MyPassword123!',
      'MyPassword123!'
    )
    expect(result.isValid).toBe(true)
  })
})
```

## Configuration

### Environment Variables

Required for authentication:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

### Supabase Configuration

Email provider settings (in Supabase dashboard):
- Authentication → Providers → Email
- SMTP configured for production
- Rate limits: 4 emails/hour/address (default)
- Expiry: 24 hours for verification links

## Troubleshooting

### "Supabase not configured" Error

**Cause**: Environment variables not set

**Solution**:
1. Go to Settings (top right)
2. Select "Vars" tab
3. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Refresh page

### Email Not Arriving

**Cause**: Spam folder, rate limited, or disabled

**Solution**:
1. Check spam/junk folder
2. Wait if rate limited (4/hour per address)
3. Verify email address is correct
4. Check Supabase dashboard for send logs

### "Email already registered"

**Cause**: Account exists with that email

**Solution**:
1. Use login page
2. Click "Forgot password" for password reset
3. Use different email for new account

### Session Lost on Refresh

**Cause**: Cookies not being stored properly

**Solution**:
1. Check if cookies enabled in browser
2. Verify HTTPS in production
3. Check browser console for errors
4. Try incognito/private mode

## Production Checklist

- [ ] Email provider configured (SendGrid, Mailgun, etc.)
- [ ] HTTPS enforced
- [ ] CSP headers configured
- [ ] Rate limiting increased for production traffic
- [ ] Backup email provider configured
- [ ] Monitoring alerts set up
- [ ] Password reset flow tested
- [ ] Account recovery documented
- [ ] GDPR compliance verified
- [ ] Terms of service updated

## References

- [Supabase Authentication Docs](https://supabase.com/docs/guides/auth)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [RFC 5322 - Email Format](https://tools.ietf.org/html/rfc5322)
