# Free AI Options for SkillDebt - Complete Guide

## Quick Answer: YES! You Have Multiple Free Options

You do NOT need to pay Vercel or use their AI Gateway. You can use your own API keys from several providers, some of which are completely free.

---

## Option Comparison

| Provider | Cost | Setup | Speed | Quality | Free? |
|----------|------|-------|-------|---------|-------|
| **OpenAI (Your Key)** | $5/month | 5 min | Fast | Excellent | No |
| **Groq** | FREE | 5 min | Very Fast | Good | YES ✅ |
| **Google Gemini** | FREE | 5 min | Fast | Good | YES ✅ |
| **Anthropic Claude** | FREE | 5 min | Medium | Excellent | YES ✅ |
| **Vercel AI Gateway** | $0 (billing required) | 2 min | Medium | Varies | Technically |
| **Ollama Local** | FREE | 30 min | Slow | Variable | YES ✅ |

---

## Option 1: Use Your OpenAI API Key (Not Free But Cheap)

### Why Choose This?
- You already have the key
- Excellent quality
- You control your costs
- ~$0.05-0.20 per quiz generation
- ~$0.10-0.30 per learning path

### How to Use It

#### Step 1: Get Your API Key
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (looks like: `sk-proj-xxxxx...`)
4. **Keep it secret!** Don't commit to GitHub

#### Step 2: Add to Environment Variables
In v0 Settings → Vars, add:
```
Key: OPENAI_API_KEY
Value: sk-proj-xxxxx...
```

#### Step 3: Update Quiz API

Replace this:
```typescript
const { text } = await generateText({
  model: 'openai/gpt-4-turbo',
  // ...
})
```

With this:
```typescript
import { openai } from '@ai-sdk/openai'

const { text } = await generateText({
  model: openai('gpt-4-turbo'),
  // ...
})
```

#### Step 4: Install Package
```bash
pnpm add @ai-sdk/openai
```

---

## Option 2: Use Groq (Completely Free!)

### Why Choose This?
- **100% FREE** - No credit card needed
- Very fast inference
- Good quality responses
- Perfect for learning apps
- No usage limits for free tier

### Setup (5 Minutes)

#### Step 1: Get API Key
1. Go to: https://console.groq.com
2. Sign up (free)
3. Create API key
4. Copy the key

#### Step 2: Add Environment Variable
In v0 Settings → Vars:
```
Key: GROQ_API_KEY
Value: gsk_xxxxx...
```

#### Step 3: Install Package
```bash
pnpm add @ai-sdk/groq
```

#### Step 4: Update Code

**For Quiz Generation:**
```typescript
import { groq } from '@ai-sdk/groq'

const { text } = await generateText({
  model: groq('mixtral-8x7b-32768'), // Free model
  system: `You are an expert assessment specialist...`,
  prompt: `Generate 5 assessment questions for: ${skillName}`,
  temperature: 0.7,
})
```

**For Learning Path:**
```typescript
import { groq } from '@ai-sdk/groq'

const result = await generateText({
  model: groq('mixtral-8x7b-32768'),
  system: 'You are an expert curriculum designer...',
  prompt: prompt,
})
```

### Available Groq Models
- `mixtral-8x7b-32768` - Best free option (45k context)
- `gemma-7b-it` - Lightweight option
- `llama2-70b-4096` - Good quality

**All are completely free!**

---

## Option 3: Use Google Gemini (Free with Generous Limits)

### Why Choose This?
- Free tier: 60 requests/minute
- High quality responses
- No credit card required
- Google-backed service

### Setup (5 Minutes)

#### Step 1: Get API Key
1. Go to: https://ai.google.dev
2. Click "Get API Key"
3. Create new project
4. Copy the key

#### Step 2: Add Environment Variable
```
Key: GOOGLE_GENERATIVE_AI_API_KEY
Value: AIzaSy_xxxxx...
```

#### Step 3: Install Package
```bash
pnpm add @ai-sdk/google
```

#### Step 4: Update Code
```typescript
import { google } from '@ai-sdk/google'

const { text } = await generateText({
  model: google('gemini-1.5-flash'), // Free model, very fast
  system: `You are an expert assessment specialist...`,
  prompt: `Generate 5 assessment questions for: ${skillName}`,
})
```

---

## Option 4: Use Anthropic Claude (Free with API Key)

### Why Choose This?
- Excellent quality responses
- Free tier available (100k tokens)
- Requires credit card but won't charge

### Setup

#### Step 1: Get API Key
1. Go to: https://console.anthropic.com
2. Sign up
3. Go to API keys
4. Create new key

#### Step 2: Add Environment Variable
```
Key: ANTHROPIC_API_KEY
Value: sk-ant-xxxxx...
```

#### Step 3: Install Package
```bash
pnpm add @ai-sdk/anthropic
```

#### Step 4: Update Code
```typescript
import { anthropic } from '@ai-sdk/anthropic'

const { text } = await generateText({
  model: anthropic('claude-3-haiku-20240307'), // Free model
  system: `You are an expert assessment specialist...`,
  prompt: `Generate 5 assessment questions for: ${skillName}`,
})
```

---

## Option 5: Run AI Locally with Ollama (Completely Free!)

### Why Choose This?
- **100% free** - No API keys needed
- Private - data never leaves your computer
- Works offline
- Perfect for development

### Setup (30 Minutes)

#### Step 1: Install Ollama
- Mac: https://ollama.ai (Download)
- Linux: `curl https://ollama.ai/install.sh | sh`
- Windows: Download from website

#### Step 2: Pull a Model
```bash
ollama pull mistral  # 4.1GB, excellent quality
# or
ollama pull neural-chat  # 4.1GB, conversational
# or
ollama pull llama2  # 3.8GB, good quality
```

#### Step 3: Start Ollama Server
```bash
ollama serve
# Runs on http://localhost:11434
```

#### Step 4: Install Ollama Package
```bash
pnpm add @ai-sdk/ollama
```

#### Step 5: Update Code
```typescript
import { ollama } from '@ai-sdk/ollama'

const { text } = await generateText({
  model: ollama('mistral'), // Or 'neural-chat', 'llama2'
  system: `You are an expert assessment specialist...`,
  prompt: `Generate 5 assessment questions for: ${skillName}`,
})
```

---

## My Recommendation

### For You: **Use Groq (FREE)**

Here's why:
1. **Zero cost** - No credit card, no billing
2. **No setup complexity** - Just get an API key
3. **High quality** - Mixtral 8x7b is excellent
4. **Fast** - Very quick response times
5. **No usage limits** - Free tier unlimited

### For Production: **Use OpenAI**
- Better quality for a few cents
- Pay only for what you use
- Enterprise ready

---

## Complete Setup: Switch to Groq in 3 Steps

### Step 1: Get API Key (1 min)
```
Visit: https://console.groq.com
Sign up with email → Create API key → Copy it
```

### Step 2: Add Environment Variable (2 min)
```
Go to: v0 Settings → Vars
Add:
  Key: GROQ_API_KEY
  Value: gsk_xxxxx...
```

### Step 3: Update Code (5 min)
See detailed code changes in the sections below.

---

## Code Changes Required

### For Quiz Generation API

Change from:
```typescript
import { generateText } from 'ai'

const { text } = await generateText({
  model: 'openai/gpt-4-turbo',
```

To:
```typescript
import { groq } from '@ai-sdk/groq'

const { text } = await generateText({
  model: groq('mixtral-8x7b-32768'),
```

### For Learning Path API

Same change as above - just swap the model provider.

### For Any Other API Endpoints

Use the same pattern:
```typescript
// Choose your provider
import { groq } from '@ai-sdk/groq'        // FREE
// or
import { openai } from '@ai-sdk/openai'     // $
// or
import { google } from '@ai-sdk/google'     // FREE
// or
import { anthropic } from '@ai-sdk/anthropic' // FREE with limits

// Then use it
const { text } = await generateText({
  model: groq('mixtral-8x7b-32768'),
  // ... rest of config
})
```

---

## Cost Comparison

### Monthly Costs (Typical Usage)

| Service | Quiz/Month | Learning Path/Month | Total |
|---------|-----------|-------------------|-------|
| **Groq** | $0 | $0 | **$0** ✅ |
| **Gemini** | $0 | $0 | **$0** ✅ |
| **Claude** | $0 | $0 | **$0** ✅ |
| **OpenAI** | $2 | $3 | **$5** |
| **Local Ollama** | $0 | $0 | **$0** ✅ |

---

## Troubleshooting

### If Groq is Down
- Check status: https://status.groq.com
- Fallback to Gemini or Claude
- Or use local Ollama

### If You Want Multiple Fallbacks
```typescript
import { groq } from '@ai-sdk/groq'
import { google } from '@ai-sdk/google'

async function generateWithFallback(prompt) {
  try {
    // Try Groq first (free and fast)
    return await generateText({
      model: groq('mixtral-8x7b-32768'),
      // ...
    })
  } catch (err) {
    console.log('Groq failed, trying Gemini...')
    // Fallback to Gemini
    return await generateText({
      model: google('gemini-1.5-flash'),
      // ...
    })
  }
}
```

---

## Security Notes

### DO:
- ✅ Store API keys in environment variables
- ✅ Use v0 Settings → Vars for secrets
- ✅ Never commit keys to GitHub
- ✅ Rotate keys regularly

### DON'T:
- ❌ Put API keys in code
- ❌ Share keys via email
- ❌ Commit `.env` files
- ❌ Expose keys in client-side code

---

## Next Steps

1. **Choose your provider** (I recommend Groq)
2. **Get API key** (2 min)
3. **Add to v0 Settings** (1 min)
4. **Update API code** (see examples above)
5. **Test it!** - Generate a quiz

You'll be running completely free, fully functional AI quiz generation within 10 minutes!

---

## Questions?

See detailed docs:
- Quiz Generation: `/app/api/quiz/generate/route.ts`
- Learning Paths: `/app/api/learning-path/route.ts`
- Current Errors: `VERCEL_ZERO_CONFIG_EXPLANATION.md`
