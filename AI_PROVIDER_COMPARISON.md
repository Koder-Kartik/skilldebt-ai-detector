# AI Provider Comparison for SkillDebt

## At a Glance

| Feature | Groq | Gemini | Claude | OpenAI | Ollama |
|---------|------|--------|--------|--------|--------|
| **Cost** | FREE | FREE | FREE | $5/mo | FREE |
| **Credit Card** | No | No | Yes | No | No |
| **Speed** | ⚡⚡⚡ Fast | ⚡⚡ Medium | ⚡⚡ Medium | ⚡⚡⚡ Fast | 🐢 Slow |
| **Quality** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Setup Time** | 5 min | 5 min | 5 min | 5 min | 30 min |
| **For Quizzes** | ✅ Perfect | ✅ Perfect | ✅ Overkill | ✅ Perfect | ✅ Works |
| **For Roadmaps** | ✅ Perfect | ✅ Perfect | ✅ Perfect | ✅ Perfect | ⚠️ Slow |
| **Rate Limits** | Generous | 60/min free | 100k tokens | Usage-based | None |
| **Context Window** | 45k | 1M | 200k | 128k | Varies |
| **Downtime Risk** | Low | Very Low | Low | Very Low | None |

---

## Detailed Comparison

### Groq - RECOMMENDED FOR FREE
**Best for:** Completely free, no setup hassle

**Pros:**
- 100% FREE, no credit card
- Very fast responses (excellent for UX)
- Generous free tier limits
- No usage surprises
- Good quality for learning apps

**Cons:**
- Slightly lower quality than OpenAI/Claude
- Can have occasional outages
- Smaller company (newer)

**Setup:**
```bash
# 1. Visit https://console.groq.com
# 2. Get API key
# 3. Add GROQ_API_KEY to v0 Vars
# 4. pnpm add @ai-sdk/groq
# 5. Change model to: groq('mixtral-8x7b-32768')
```

**Cost:** $0/month

---

### Google Gemini - GOOD FREE ALTERNATIVE
**Best for:** Free alternative if Groq is down

**Pros:**
- Completely FREE
- No credit card needed
- Backed by Google
- Very fast
- High quality

**Cons:**
- Rate limits (60 req/min)
- Newer models may have quirks
- Less tested for this use case

**Setup:**
```bash
# 1. Visit https://ai.google.dev
# 2. Click "Get API Key"
# 3. Add GOOGLE_GENERATIVE_AI_API_KEY to v0 Vars
# 4. pnpm add @ai-sdk/google
# 5. Change model to: google('gemini-1.5-flash')
```

**Cost:** $0/month (free tier)

---

### Anthropic Claude - PREMIUM FREE
**Best for:** Best quality, but requires credit card

**Pros:**
- Exceptional quality responses
- Free $5/month credit
- Excellent for complex tasks
- Smart context understanding

**Cons:**
- Requires credit card (even for free tier)
- Slower responses than Groq
- Could incur charges if heavily used

**Setup:**
```bash
# 1. Visit https://console.anthropic.com
# 2. Sign up (needs credit card)
# 3. Create API key
# 4. Add ANTHROPIC_API_KEY to v0 Vars
# 5. pnpm add @ai-sdk/anthropic
# 6. Change model to: anthropic('claude-3-haiku-20240307')
```

**Cost:** Free tier ($5 credit), then ~$0.25/month usage

---

### OpenAI - MOST RELIABLE (PAID)
**Best for:** Production apps where quality matters most

**Pros:**
- Industry standard
- Highest quality responses
- You already have the API key
- Very reliable
- Excellent documentation

**Cons:**
- Costs money (~$5-10/month typical)
- Slower than Groq
- Requires credit card and payment method

**Setup:**
```bash
# Already have key configured!
# Just need to:
# 1. Make sure OPENAI_API_KEY is in v0 Vars
# 2. pnpm add @ai-sdk/openai
# 3. Change model to: openai('gpt-4-turbo')
```

**Cost:** $5-20/month (your usage)

---

### Ollama - LOCAL & FREE
**Best for:** Maximum privacy, development, completely offline

**Pros:**
- 100% FREE
- Data never leaves your computer
- Works offline
- No API calls
- Perfect for privacy

**Cons:**
- Slow (needs powerful computer)
- Difficult setup
- Local-only (can't deploy to Vercel)
- Need to manage updates

**Setup:**
```bash
# 1. Install Ollama from https://ollama.ai
# 2. ollama pull mistral
# 3. ollama serve
# 4. pnpm add @ai-sdk/ollama
# 5. Change model to: ollama('mistral')
```

**Cost:** $0/month (only electricity)

---

## Decision Tree: Which Should You Use?

```
START
│
├─ Want absolutely FREE + easy? 
│  └─ YES → Use GROQ ⭐ RECOMMENDED
│
├─ Want best quality + willing to pay?
│  └─ YES → Use OPENAI (you have key already)
│
├─ Want premium free (need credit card)?
│  └─ YES → Use CLAUDE
│
├─ Want free backup if Groq down?
│  └─ YES → Use GEMINI
│
└─ Want maximum privacy + don't care about speed?
   └─ YES → Use OLLAMA (local)
```

---

## My Strong Recommendation

### Use Groq

Here's why:

1. **It's FREE** - No credit card, no surprises
2. **It's FAST** - Better UX for users
3. **Quality is GREAT** - Mixtral 8x7b produces excellent quizzes and learning paths
4. **Setup is EASY** - Just get API key, add to v0, change 2 lines of code
5. **No Risk** - If you don't like it, switch to another in 2 minutes

You'll have a working, completely free AI-powered learning app in less than 10 minutes.

---

## Cost Breakdown Example

### Using Groq (FREE)
```
Monthly costs:
  Quiz generation:        $0
  Learning paths:         $0
  Daily tasks:            $0
  ─────────────────────────
  TOTAL:                  $0 ✅
```

### Using OpenAI (PAID)
```
Monthly costs (typical usage):
  Quiz generation:        $2-3
  Learning paths:         $3-5
  Daily tasks:            $1-2
  ─────────────────────────
  TOTAL:                  $5-10 💰
```

### Using Claude (FREE TIER)
```
Monthly costs:
  Free tier credit:       $5
  Typical usage:          $0-2
  ─────────────────────────
  TOTAL:                  $0-3 ✅
```

---

## Quick Setup Times

| Provider | Time | Difficulty |
|----------|------|-----------|
| Groq | 5 min | Easy |
| Gemini | 5 min | Easy |
| Claude | 5 min | Easy |
| OpenAI | 2 min | Trivial (key already set up) |
| Ollama | 30+ min | Hard (local setup) |

---

## Reliability Comparison

| Provider | Uptime | SLA | Backup Recommended |
|----------|--------|-----|-------------------|
| OpenAI | 99.9% | Yes | No |
| Google | 99.99% | Yes | No |
| Claude | 99.95% | No | Maybe |
| Groq | ~99.5% | No | YES ✅ |
| Ollama | N/A | N/A | No |

---

## TL;DR

**For you RIGHT NOW:**
- Use **GROQ** - It's free, fast, and works great
- 10-minute setup
- No credit card
- Excellent quality
- You'll never look back

Go to: `SWITCH_TO_FREE_AI.md` for exact steps.
