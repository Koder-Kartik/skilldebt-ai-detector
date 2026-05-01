# Quick Start: Switch to Free AI (Groq) in 5 Minutes

## The Absolute Fastest Way to Get Working

### Step 1: Get Groq API Key (1 minute)

```
1. Visit: https://console.groq.com
2. Click "Sign Up"
3. Complete email verification
4. Click "API Keys" in sidebar
5. Click "Create API Key"
6. Copy the key (looks like: gsk_xxxxxxxxxxxxxxxxxxxxx)
```

### Step 2: Add to v0 Environment (1 minute)

```
1. In v0, click Settings (top right gear icon)
2. Go to "Vars" tab
3. Click "Add Variable"
4. Paste:
   Name: GROQ_API_KEY
   Value: gsk_xxxxxxxxxxxxxxxxxxxxx
5. Click "Save"
6. Wait 10 seconds for it to take effect
```

### Step 3: Install Groq Package (2 minutes)

Run this command in terminal:
```bash
cd /vercel/share/v0-project
pnpm add @ai-sdk/groq
```

### Step 4: Update Quiz API (1 minute)

Edit: `/app/api/quiz/generate/route.ts`

**Find this line (around line 2):**
```typescript
import { generateText } from 'ai'
```

**Add this line after it:**
```typescript
import { groq } from '@ai-sdk/groq'
```

**Find this line (around line 43):**
```typescript
const { text } = await generateText({
  model: 'openai/gpt-4-turbo',
```

**Replace the model line with:**
```typescript
const { text } = await generateText({
  model: groq('mixtral-8x7b-32768'),
```

### Step 5: Update Learning Path API (1 minute)

Edit: `/app/api/learning-path/route.ts`

**Find this line (around line 1):**
```typescript
import { generateText } from 'ai'
```

**Add this line after it:**
```typescript
import { groq } from '@ai-sdk/groq'
```

**Find this line (around line 62):**
```typescript
const result = await generateText({
  model: 'openai/gpt-4-turbo',
```

**Replace with:**
```typescript
const result = await generateText({
  model: groq('mixtral-8x7b-32768'),
```

### Step 6: Test It!

1. Refresh your browser
2. Go to: Assessment → Start Quiz
3. Select any skill
4. Wait for 5 questions to load (should work now!)
5. Answer questions
6. Click "Submit"
7. See your learning path!

---

## That's It! You're Done

Total time: **5 minutes**  
Cost: **$0**  
Quality: **Excellent**

Your app now uses completely free AI with no billing requirements!

---

## If You Want to Use OpenAI Instead

You already have the key configured, so just:

1. Get your OpenAI API key from https://platform.openai.com/api-keys
2. Add to v0 Vars: `OPENAI_API_KEY`
3. Change the imports from `groq` to `openai`
4. Done!

---

## Troubleshooting

### "Module not found: @ai-sdk/groq"
```
Run: pnpm add @ai-sdk/groq
Then refresh browser
```

### "GROQ_API_KEY is not defined"
```
1. Check v0 Settings → Vars
2. Make sure GROQ_API_KEY is there
3. Wait 30 seconds
4. Refresh browser
```

### "Service unavailable"
```
1. Check: https://status.groq.com
2. If Groq is down, switch to Gemini (see guide)
3. Or use local Ollama
```

---

## Cost Breakdown (Groq)

- Quiz generation: $0
- Learning path: $0
- Daily tasks: $0
- **Monthly total: $0**

No credit card needed. No surprises. Just works.
