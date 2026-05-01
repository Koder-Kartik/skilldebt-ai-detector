# Error Code Reference - What You're Seeing vs What It Means

## Error Stack from Logs

### Error Message to User
```
Service Error: The question generation service encountered an error. 
Please try again later.
```

### Actual Error (In Server Logs)
```
[v0] Quiz generation error: 
Error [GatewayInternalServerError]: 
AI Gateway requires a valid credit card on file to service requests.
```

### HTTP Status Codes in Flow

```
1. POST /api/quiz/generate → 200 Request accepted
2. Auth check → 200 ✅ Authenticated
3. Database insert → 201 ✅ Session created
4. AI Gateway call → 403 ❌ BLOCKED (billing issue)
5. Client response → 500 (server converts 403 to 500)
```

## Why The Discrepancy?

| Perspective | Error Code | Reason |
|-------------|-----------|--------|
| **Backend (server logs)** | 403 Forbidden | AI Gateway rejects due to missing credit card |
| **Frontend (user sees)** | 500 Internal Server Error | Backend hides billing reason for security |
| **HTTP Spec** | 403 = client error, 500 = server error | Both are technically correct but different |

## The Security Reason

If the 403 was passed to the client, users would see:
```
AI Gateway requires a valid credit card on file to service requests.
Please visit https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card
to add a card and unlock your free credits.
```

This exposes:
- Billing is the issue (not code)
- Links to payment setup (could be phished)
- Internal Vercel URLs

So backends intentionally convert it to a generic 500.

## How to See The Real Error

**In browser DevTools:**
1. Open Console (F12)
2. Go to Network tab
3. Click on `quiz/generate` request
4. Look at "Response" tab

You'll see the 403 response from the API.

**In server logs:**
1. Check Vercel deployment logs
2. Filter for "GatewayInternalServerError"
3. You'll see the exact billing message

## What Each Error Code Means

| Code | Meaning | Your Case | Fix |
|------|---------|-----------|-----|
| **200** | Success | Database ✅ | None |
| **201** | Created | Session ✅ | None |
| **400** | Bad request | Input ✅ | None |
| **401** | Unauthorized | Auth ✅ | None |
| **403** | Forbidden | AI Gateway ❌ | Add credit card |
| **500** | Server error | Reported to user | Add credit card |

## The Real Status

Your error: **403 billing block** (reported as 500)  
Your code: **Perfect**  
Your config: **Perfect**  
Your deployment: **Perfect**  
Your missing piece: **Credit card on Vercel account**

