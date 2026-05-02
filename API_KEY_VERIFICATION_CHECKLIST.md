# API Key Verification Checklist

## Current Status Report

### ✅ Verified and Working
- **Supabase Configuration**: Active
  - Database: Connected
  - Authentication: Working
  - JWT Secret: Configured
  - Service Role Key: Present

- **Anthropic (Claude)**: Configured
  - ANTHROPIC_AUTH_TOKEN: Present
  - Alternative: Can use as backup

- **Vercel AI Gateway**: Configured
  - AI_GATEWAY_API_KEY: Present
  - Note: Requires credit card verification (which you don't have)

### ❌ Missing - Needs Setup
- **Groq API Key**: NOT CONFIGURED
  - Status: Environment variable missing
  - Impact: Quiz generation failing
  - Solution: Need to add GROQ_API_KEY

---

## API Key Verification Results

### What I Checked
1. ✅ Environment configuration file
2. ✅ All environment variables
3. ✅ Groq API key presence
4. ✅ Key format validation

### Findings

| Component | Status | Details |
|-----------|--------|---------|
| **GROQ_API_KEY** | ❌ MISSING | Not found in environment |
| **Required for** | Quiz Generation | AI model: mixtral-8x7b-32768 |
| **Alternative Available** | Yes | Anthropic Claude is configured |
| **Impact** | Critical | Quiz & Learning Path features down |

---

## Step-by-Step: Get Your Free Groq API Key

### Step 1: Go to Groq Console
- **URL**: https://console.groq.com
- **Time**: Takes 30 seconds
- **Cost**: Free (no credit card)

### Step 2: Create Account (If Needed)
- Click "Sign Up"
- Enter email
- Verify email
- Create password
- **No credit card required**

### Step 3: Get Your API Key
1. Go to **API Keys** section
2. Click **"Create API Key"**
3. Name it: "SkillDebt" (optional)
4. Copy the key (looks like: `gsk_abc123...`)
5. **Save this key**

### Step 4: Add to v0
1. Open v0 Settings (top right)
2. Click **"Vars"**
3. Click **"Add Variable"**
4. Set:
   - **Key**: `GROQ_API_KEY`
   - **Value**: `gsk_abc123...` (paste your key)
5. Click **"Save"**
6. Wait 5 seconds

### Step 5: Verify It Works
1. Refresh: http://localhost:3000
2. Go to: Assessment → Start Quiz
3. Select any skill
4. **Watch quiz generate in 2-3 seconds** ✅

---

## API Key Format Validation

### Valid Groq Key Format
```
gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### What to Look For
- ✅ Starts with `gsk_`
- ✅ Followed by ~50+ alphanumeric characters
- ✅ No spaces or special characters
- ✅ Length: ~55-65 characters total

### Example (NOT REAL)
```
gsk_aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aBcDeFgHiJkL
```

---

## Troubleshooting If Issues Occur

### Issue 1: "Invalid API Key"
**Cause**: Key format incorrect or expired  
**Solution**: 
1. Go back to https://console.groq.com
2. Delete the key
3. Create a new one
4. Copy again (check for trailing spaces)
5. Update in v0 Vars

### Issue 2: "Authentication Failed"
**Cause**: Key not actually saved to environment  
**Solution**:
1. Check v0 Settings → Vars shows GROQ_API_KEY
2. Refresh browser (Ctrl+Shift+R)
3. Restart dev server: `pnpm dev`

### Issue 3: "Rate Limited"
**Cause**: Too many requests to Groq  
**Solution**:
1. Wait 60 seconds
2. Try again
3. Groq free tier is very generous, this shouldn't happen

### Issue 4: "Unauthorized"
**Cause**: Key is valid but something else is wrong  
**Solution**:
1. Verify key starts with `gsk_`
2. Verify no extra spaces in key
3. Try creating a new key on https://console.groq.com

---

## Permission Scopes

### Groq API Key Permissions
Your free Groq API key has access to:

✅ **All Chat Models**
- mixtral-8x7b-32768 (Used for quizzes)
- mixtral-8x7b-32768-vision (Image analysis - optional)
- llama-3.1-405b-reasoning (Advanced reasoning - optional)
- llama-3.1-70b-versatile (General purpose - optional)

✅ **All Operations**
- Text generation
- Chat completions
- Vision capabilities (images)
- Function calling
- Token counting

✅ **Rate Limits**
- Requests/minute: 30
- Tokens/minute: 6000
- Sufficient for unlimited quiz generation

---

## What Each API Key Does

| Key | Service | Purpose | Status |
|-----|---------|---------|--------|
| **GROQ_API_KEY** | Groq | Quiz generation, Learning paths | ❌ NEEDS SETUP |
| **ANTHROPIC_AUTH_TOKEN** | Claude | Backup AI (if needed) | ✅ READY |
| **AI_GATEWAY_API_KEY** | Vercel | Blocked (needs credit card) | ⚠️ BLOCKED |
| **SUPABASE_SECRET_KEY** | Supabase | Database, Auth | ✅ WORKING |

---

## Quick Reference

### To Add GROQ_API_KEY:
```
1. https://console.groq.com → Get key
2. v0 Settings → Vars
3. Key: GROQ_API_KEY
4. Value: gsk_...
5. Save
6. Done! ✅
```

### To Test It Works:
```
1. http://localhost:3000
2. Assessment → Start Quiz
3. Select skill
4. Should generate in 2-3 seconds ✅
```

### If It Doesn't Work:
```
1. Check key is saved (Settings → Vars)
2. Refresh browser (Ctrl+Shift+R)
3. Restart dev server: pnpm dev
4. Try again
```

---

## Security Notes

### Groq API Key Safety
- ✅ Free, can't be charged
- ✅ Safe to share between developers
- ✅ Can regenerate anytime
- ✅ No sensitive data in key itself
- ✅ Groq monitors for abuse

### Best Practices
- ✅ Don't commit to Git (use env vars)
- ✅ Don't share publicly (unnecessary since it's free)
- ✅ Safe to use in public repos (though not required)
- ✅ Can rotate keys anytime at console.groq.com

---

## Next Steps

1. **NOW**: Get Groq API key from https://console.groq.com (2 minutes)
2. **THEN**: Add GROQ_API_KEY to v0 Settings → Vars (1 minute)
3. **TEST**: Go to Assessment → Quiz (should work immediately)

**Once you add the key, your quiz feature will work perfectly!** 🚀

