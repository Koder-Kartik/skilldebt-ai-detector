# API Key Configuration Guide

## Overview

SkillDebt uses AI-powered question generation for assessments. To enable this feature, you need to configure API keys for the AI model provider.

## Quick Answer: Do I Need to Give an API Key?

**YES** - If you want the quiz feature to work, you need to set up API credentials. There are two options:

### Option 1: Vercel AI Gateway (Recommended - Zero Config)
Vercel provides several models with zero configuration needed:
- OpenAI (gpt-4o-mini, gpt-4o)
- Anthropic (claude-opus-4.6, claude-3.5-sonnet)
- Google Vertex (gemini-3-flash)

These are pre-configured and require no additional API keys in most cases.

### Option 2: External API Keys
If using providers that require authentication:
- OpenAI API key
- Anthropic API key
- Groq API key
- Other supported providers

---

## Step-by-Step Setup

### For Vercel Deployment (Recommended)

1. **Deploy to Vercel**
   - Push your code to GitHub
   - Connect your GitHub repo to Vercel
   - Vercel automatically provides Vercel AI Gateway access

2. **Verify AI Gateway is Available**
   - The default configuration in `/app/api/quiz/generate/route.ts` uses:
     ```typescript
     model: 'openai/gpt-4o-mini'
     ```
   - Vercel AI Gateway automatically routes this through your Vercel project
   - No additional configuration needed

3. **No API Key Required**
   - Vercel handles the authentication behind the scenes
   - Your app can immediately use AI features

### For Development Locally

If you want to test locally with your own API key:

1. **Get an OpenAI API Key**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key

2. **Add to Environment Variables**
   - In v0 dashboard, click Settings (gear icon)
   - Go to "Vars" section
   - Add:
     ```
     OPENAI_API_KEY=sk-proj-xxxxx...
     ```

3. **Update Configuration** (if needed)
   - The API automatically uses Vercel AI Gateway when deployed
   - Locally, it might use environment variables

---

## What Happens If API Key is Missing?

If the API key is not configured, you'll see error messages like:

- **"Configuration Issue: The AI service is not properly configured"**
  - Means API credentials are missing
  - Solution: Set up environment variables or deploy to Vercel

- **"API Key Configuration Error"**
  - 401/403 authentication error
  - The API key is invalid or expired
  - Solution: Verify your API key in settings

---

## Current Configuration

### Default Model: `openai/gpt-4o-mini`

The quiz feature uses OpenAI's GPT-4o mini model because it:
- Generates high-quality questions
- Fast response time
- Cost-effective
- Good balance of capability and speed

### Location: `/app/api/quiz/generate/route.ts`

```typescript
const { text } = await generateText({
  model: 'openai/gpt-4o-mini',  // Uses Vercel AI Gateway by default
  system: 'You are an expert...',
  prompt: `Generate 5 assessment questions for: ${skillName}`,
  temperature: 0.7,
})
```

---

## Switching AI Models

If you want to use a different model:

1. **Edit the generate route**
   - Open `/app/api/quiz/generate/route.ts`
   - Change the `model` parameter

2. **Available Models via Vercel AI Gateway**
   - `openai/gpt-5-mini` - Latest OpenAI model
   - `anthropic/claude-opus-4.6` - Advanced reasoning
   - `google/gemini-3-flash` - Multi-modal capable
   - `groq/mixtral-8x7b-32768` - Fast inference

3. **Required Environment Variables** (for non-Vercel models)
   - `ANTHROPIC_API_KEY` for Claude models
   - `GROQ_API_KEY` for Groq models
   - Model-specific keys for other providers

---

## Troubleshooting

### "Failed to generate questions"

**Cause**: API key missing or invalid

**Fix**:
1. Check your environment variables are set
2. Verify the API key is correct and not expired
3. If deploying to Vercel, ensure the project is deployed with proper secrets

### "Configuration Issue" Error

**Cause**: Vercel AI Gateway not accessible or API key not configured

**Fix**:
1. Deploy to Vercel (no key needed)
2. OR set environment variables locally
3. Check browser console for detailed error messages

### "Service Error" or "Rate Limited"

**Cause**: API is experiencing issues or you've exceeded rate limits

**Fix**:
1. Wait a few minutes and try again
2. Check your API usage on the provider's dashboard
3. Consider upgrading your API plan if hitting limits

---

## Monitoring API Usage

### For Vercel AI Gateway
- No direct monitoring (handled by Vercel)
- Check your Vercel dashboard for usage logs

### For External APIs
- **OpenAI**: [Usage Dashboard](https://platform.openai.com/usage)
- **Anthropic**: [Console Dashboard](https://console.anthropic.com/)
- **Groq**: [Console Dashboard](https://console.groq.com/)

---

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate keys regularly** for security
4. **Monitor usage** to detect unauthorized access
5. **Use Vercel's built-in secrets management** for deployments

---

## FAQ

**Q: Will I be charged for using the quiz feature?**
- If using Vercel AI Gateway (deployed on Vercel): Minimal/included costs
- If using external APIs: Yes, based on your API provider's pricing

**Q: Can I use multiple AI providers?**
- Yes, you can modify `/app/api/quiz/generate/route.ts` to switch providers
- Each provider requires different environment variables

**Q: What if I don't want to use AI-generated questions?**
- You would need to modify the system to use pre-written questions
- Store them in the database instead of generating them on-the-fly

---

## Getting Help

If you encounter issues:
1. Check the browser console (F12 → Console tab)
2. Review `/docs/QUIZ_TROUBLESHOOTING.md` for detailed debugging steps
3. Check `/vercel/share/.env.project` for configured environment variables
4. Contact support with the error message and browser console output

