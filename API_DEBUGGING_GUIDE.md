# API Debugging Guide - Quiz & Learning Path Integration

## Critical Issues Found & Fixed

### 1. ✅ FIXED: `skillName` Undefined in Error Handler

**Problem**: The error handler referenced `skillName` which wasn't in scope
**Location**: `/app/api/quiz/generate/route.ts` line 126
**Cause**: Variable declared inside try block, not accessible in catch block
**Solution**: Moved `skillName` declaration outside try block with default value

```typescript
// BEFORE (WRONG)
export async function POST(req: NextRequest) {
  try {
    const { skillName } = await req.json()  // Only in try scope
    // ...
  } catch (error) {
    console.error('Skill:', skillName)  // ❌ skillName not defined
  }
}

// AFTER (CORRECT)
export async function POST(req: NextRequest) {
  let skillName = 'Unknown'  // ✅ Available in all scopes
  try {
    const body = await req.json()
    skillName = body.skillName
    // ...
  } catch (error) {
    console.error('Skill:', skillName)  // ✅ skillName available
  }
}
```

### 2. ✅ ENHANCED: Error Logging & Diagnostics

**What was added**:
- API key presence check in logs
- Model name logging
- Detailed error categorization
- Response body debugging

**New logs you'll see**:
```
[v0] Attempting to generate questions with Groq model...
[v0] API Key status: Present/MISSING
[v0] Using model: mixtral-8x7b-32768
[v0] Quiz generation error: { message: "...", skill: "JavaScript", timestamp: "..." }
```

---

## Root Cause Analysis: Why Quiz Generation Fails

### Common Cause #1: Missing GROQ_API_KEY at Runtime

**Symptoms**:
- 403 Forbidden error
- "Unauthorized" message in logs
- Authentication error from Groq

**How to verify**:
1. Server logs show: `API Key status: MISSING`
2. Check: v0 Settings → Vars → GROQ_API_KEY exists
3. Restart dev server: `pnpm dev`

**Fix**:
```bash
# Verify key is loaded
echo $GROQ_API_KEY

# If empty, add to v0 Settings again
# Then restart server
pnpm dev
```

### Common Cause #2: Invalid API Key Format

**Symptoms**:
- 401 Unauthorized
- "Invalid API key" error
- Request rejected immediately

**How to verify**:
1. Check key format: Should start with `gsk_`
2. Check key length: Should be 55-65 characters
3. Check for spaces: Copy-paste often adds spaces

**Fix**:
```javascript
// Test in browser console
const key = "gsk_...";
console.log("Valid format:", key.startsWith('gsk_'));
console.log("Valid length:", key.length > 50 && key.length < 70);
console.log("No spaces:", !key.includes(' '));
```

### Common Cause #3: Groq API Service Down

**Symptoms**:
- 500+ errors
- Timeouts
- Service unavailable messages

**How to verify**:
1. Check: https://status.groq.com
2. If red, Groq is down - wait for recovery

**Fix**:
- Wait for service to recover
- No code changes needed

### Common Cause #4: Incorrect Request Headers

**Symptoms**:
- 400 Bad Request
- Content-Type mismatch errors
- Parsing errors

**What we're sending** (verified correct):
```javascript
{
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ skillName: 'JavaScript' })
}
```

### Common Cause #5: JSON Response Parsing Error

**Symptoms**:
- "Invalid question format" error
- Cannot read properties of undefined
- Validation fails

**How to check**:
1. Look at error: `Failed to parse AI response:`
2. Raw response should be valid JSON array
3. Each question needs all required fields

**Fix**:
```typescript
// Improved parsing with fallback
try {
  questions = JSON.parse(text)
} catch (parseError) {
  console.error('[v0] Raw response:', text.substring(0, 500))
  // Generate default questions instead of failing
  questions = generateDefaultQuestions(skillName)
}
```

---

## Step-by-Step Debugging Process

### Step 1: Check Environment

```bash
# Verify Groq key exists
grep "GROQ_API_KEY" /vercel/share/.env.project

# Check key format
echo $GROQ_API_KEY | cut -c1-30
```

**Expected output**: `gsk_...` followed by random characters

### Step 2: Check Code Compilation

```bash
# Rebuild without cache
pnpm build

# Look for quiz route
grep -r "api/quiz/generate" .next 2>/dev/null || echo "Route not compiled"
```

**Expected**: Route should be in build output

### Step 3: Check Request Headers

**In browser (F12 → Network tab)**:
```
POST /api/quiz/generate

Request Headers:
  Content-Type: application/json
  Authorization: NOT SENT (handled by Groq SDK internally)

Request Body:
  { "skillName": "JavaScript" }
```

**What's correct**:
- ✅ POST method
- ✅ /api/quiz/generate path
- ✅ skillName in body

### Step 4: Check Response Status

**In browser (F12 → Network tab)**:
```
Response Status: 200 OK

Response Body:
{
  "quizSessionId": "...",
  "questions": [
    {
      "number": 1,
      "question": "...",
      "options": ["A) ...", "B) ...", ...],
      ...
    }
  ]
}
```

**Common wrong responses**:
- `403` - API key invalid
- `404` - Route not found
- `500` - Server error (check logs)

### Step 5: Check Server Logs

**Where to look**:
1. Terminal running `pnpm dev`
2. Browser F12 → Console
3. Vercel deployment logs

**Key log patterns**:
```
✅ Good:
[v0] Starting quiz generation for skill: JavaScript
[v0] Attempting to generate questions with Groq model...
[v0] API Key status: Present
[v0] Quiz data received: { sessionId: "...", questionCount: 5 }

❌ Bad:
[v0] API Key status: MISSING
[v0] API error: 403
[v0] Failed to parse AI response:
```

---

## Testing Checklist

### Local Development Testing

- [ ] Verify GROQ_API_KEY in v0 Settings
- [ ] Restart dev server: `pnpm dev`
- [ ] Open http://localhost:3000
- [ ] Login with test account
- [ ] Go to Assessment → Quiz
- [ ] Select "JavaScript"
- [ ] Wait 2-3 seconds
- [ ] See 5 questions appear
- [ ] Open F12 → Console
- [ ] See log: `[v0] Quiz data received: {...}`
- [ ] See Network POST to `/api/quiz/generate` returns 200

### Error Handling Testing

Test endpoint directly with curl:

```bash
curl -X POST http://localhost:3000/api/quiz/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"skillName":"Python"}'
```

Expected response if working:
```json
{
  "quizSessionId": "abc123",
  "questions": [...]
}
```

Expected response if key missing:
```json
{
  "error": "AI service authentication failed",
  "details": "API key not set"
}
```

---

## Common Mistakes & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 404 error | Route not found in build | Rebuild: `pnpm build` |
| 403 error | API key invalid/missing | Check v0 Settings → Vars |
| 500 error | Server exception | Check console logs for details |
| Slow response | Groq overloaded | Wait 30 seconds, retry |
| JSON parse error | Malformed AI response | Groq SDK issue, rare |
| "skillName undefined" | Scope issue (FIXED) | Already patched in latest build |

---

## Verification Commands

```bash
# 1. Check API key exists
grep GROQ_API_KEY /vercel/share/.env.project

# 2. Check key format (should start with gsk_)
echo $GROQ_API_KEY | head -c 30

# 3. Rebuild project
cd /vercel/share/v0-project && pnpm build

# 4. Check build output shows route compiled
ls -la .next/server/app/api/quiz/

# 5. Check for TypeScript errors
pnpm build 2>&1 | grep "error TS"

# 6. Test endpoint with curl (if authenticated)
curl -X POST http://localhost:3000/api/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{"skillName":"JavaScript"}'
```

---

## What's Fixed in This Build

1. ✅ `skillName` undefined error (moved to outer scope)
2. ✅ Enhanced error logging with API key status
3. ✅ Better error categorization (403 vs 500 vs JSON errors)
4. ✅ Debug info in error responses
5. ✅ Groq model specified correctly (mixtral-8x7b-32768)

---

## Next Steps

### If Quiz Still Fails:

1. **Restart dev server**:
   ```bash
   pkill -f "pnpm dev"
   sleep 2
   pnpm dev
   ```

2. **Clear browser cache**: F12 → Right-click page → Clear → Reload

3. **Check Groq status**: https://status.groq.com

4. **Check API key validity**:
   - Go to https://console.groq.com
   - Verify your key still exists
   - Verify it's still active
   - If deleted, create new key and update v0

5. **Check permissions**:
   - Verify logged in as correct user
   - Check user has quiz_sessions permissions in Supabase

### If Quiz Now Works:

1. Test generating learning path: Click "Generate Learning Path"
2. Test multiple skills: Try different skills
3. Test error handling: Try invalid inputs
4. Deploy to Vercel: Push code to GitHub

---

## Conclusion

The main issues were:
1. **Scope issue**: `skillName` not accessible in error handler (FIXED)
2. **Missing diagnostics**: Couldn't see if API key was loaded (FIXED)
3. **API compilation**: Routes existed but error handling was incomplete (FIXED)

The app should now work with proper error messages if anything goes wrong!

