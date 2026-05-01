# Verification Checklist: Switching to Free AI

Use this checklist to verify you've done everything correctly.

## Before Setup

- [ ] You've read one of the guides:
  - [ ] `SWITCH_TO_FREE_AI.md` (quickest)
  - [ ] `FREE_AI_OPTIONS_GUIDE.md` (most comprehensive)
  - [ ] `CAN_I_USE_MY_OWN_API_KEY.md` (best overview)

- [ ] You've decided which provider to use:
  - [ ] Groq (recommended - free)
  - [ ] OpenAI (if you already pay)
  - [ ] Gemini (free alternative)
  - [ ] Claude (premium free)
  - [ ] Ollama (local)

## Getting API Key (Provider-Specific)

### If Using Groq:
- [ ] Visited: https://console.groq.com
- [ ] Created account
- [ ] Generated API key
- [ ] Copied the key (starts with `gsk_`)
- [ ] Saved it somewhere safe

### If Using OpenAI:
- [ ] You already have OPENAI_API_KEY in v0 Settings → Vars

### If Using Gemini:
- [ ] Visited: https://ai.google.dev
- [ ] Clicked "Get API Key"
- [ ] Created new project
- [ ] Generated API key
- [ ] Copied the key

### If Using Claude:
- [ ] Visited: https://console.anthropic.com
- [ ] Created account
- [ ] Generated API key
- [ ] Copied the key (starts with `sk-ant-`)

## Adding to v0

- [ ] Opened v0 Settings (top right gear icon)
- [ ] Clicked on "Vars" tab
- [ ] Clicked "Add Variable"
- [ ] Entered correct environment variable name:
  - [ ] `GROQ_API_KEY` (if Groq)
  - [ ] `OPENAI_API_KEY` (if OpenAI)
  - [ ] `GOOGLE_GENERATIVE_AI_API_KEY` (if Gemini)
  - [ ] `ANTHROPIC_API_KEY` (if Claude)
- [ ] Pasted the API key value
- [ ] Clicked "Save"
- [ ] Waited 10-15 seconds for it to take effect

## Installing Packages

- [ ] Opened terminal in `/vercel/share/v0-project`
- [ ] Ran the install command:
  - [ ] `pnpm add @ai-sdk/groq` (if Groq)
  - [ ] `pnpm add @ai-sdk/openai` (if OpenAI)
  - [ ] `pnpm add @ai-sdk/google` (if Gemini)
  - [ ] `pnpm add @ai-sdk/anthropic` (if Claude)
  - [ ] `pnpm add @ai-sdk/ollama` (if Ollama)
- [ ] Command completed successfully (no errors)

## Code Changes

### Quiz API (`/app/api/quiz/generate/route.ts`)

- [ ] Added import statement:
  - [ ] `import { groq } from '@ai-sdk/groq'` (if Groq)
  - [ ] `import { openai } from '@ai-sdk/openai'` (if OpenAI)
  - [ ] `import { google } from '@ai-sdk/google'` (if Gemini)
  - [ ] `import { anthropic } from '@ai-sdk/anthropic'` (if Claude)

- [ ] Found line 43: `const { text } = await generateText({`

- [ ] Changed the model:
  - FROM: `model: 'openai/gpt-4-turbo',`
  - TO: 
    - [ ] `model: groq('mixtral-8x7b-32768'),` (if Groq)
    - [ ] `model: openai('gpt-4-turbo'),` (if OpenAI)
    - [ ] `model: google('gemini-1.5-flash'),` (if Gemini)
    - [ ] `model: anthropic('claude-3-haiku-20240307'),` (if Claude)

### Learning Path API (`/app/api/learning-path/route.ts`)

- [ ] Added import statement (same as quiz API above)

- [ ] Found line ~62: `const result = await generateText({`

- [ ] Changed the model:
  - FROM: `model: 'openai/gpt-4-turbo',`
  - TO: (same as quiz API above)

## Build & Test

- [ ] Ran: `pnpm build`
  - [ ] No TypeScript errors
  - [ ] Build completed successfully
  - [ ] Deployment preview shows "✓"

- [ ] Restarted dev server:
  - [ ] Ran: `pkill -f "pnpm dev" && cd /vercel/share/v0-project && pnpm dev`
  - [ ] Dev server started (watch for "ready")
  - [ ] Browser opens automatically

## Testing the Feature

- [ ] Opened app in browser
- [ ] Navigated to: Assessment → Start Quiz
- [ ] Selected a skill (e.g., "JavaScript")
- [ ] **Critical**: Check browser console (F12 → Console):
  - [ ] You should see: `[v0] Starting quiz generation for skill: JavaScript`
  - [ ] Wait 5-10 seconds
  - [ ] Should NOT see: 500 or 403 errors
  - [ ] Should see: `[v0] Quiz data received`

- [ ] If you see the 5 questions loading:
  - [ ] Answer all 5 questions
  - [ ] Click "Submit Answers"
  - [ ] Wait for analysis (5-10 seconds)
  - [ ] Check console: `[v0] Quiz analysis complete`
  - [ ] See the results: "Quiz Results" card with score
  - [ ] Click "Generate Learning Path"
  - [ ] See 4-week learning roadmap appear
  - [ ] ✅ SUCCESS! Everything works!

## Troubleshooting If Something Failed

### "Module not found: @ai-sdk/groq"
- [ ] Confirm: `pnpm add @ai-sdk/groq` completed
- [ ] Confirm: No errors in terminal
- [ ] Confirm: `node_modules/@ai-sdk/groq` exists
- [ ] Run: `pnpm install` again
- [ ] Restart dev server

### "Error: GROQ_API_KEY is not defined"
- [ ] Check: v0 Settings → Vars
- [ ] Confirm: GROQ_API_KEY is listed
- [ ] Confirm: Value starts with `gsk_`
- [ ] Wait: 30 seconds (it takes time to sync)
- [ ] Refresh: Browser page
- [ ] Try again

### Still seeing 500 error
- [ ] Check: Browser console (F12 → Console)
- [ ] Look for: Exact error message
- [ ] Check: Server logs in terminal
- [ ] Try: Different provider (Gemini as backup)
- [ ] Restart: Dev server completely

### App won't start
- [ ] Check: Terminal for error messages
- [ ] Run: `pnpm install` again
- [ ] Run: `pnpm build` to check for issues
- [ ] Check: Did you change the right lines of code?
- [ ] Undo: Any accidental changes

## Final Verification

Once everything works, verify:

- [ ] Quiz generation: Takes 5-10 seconds ✅
- [ ] Questions are generated: 5 multiple choice ✅
- [ ] Answers can be submitted: No errors ✅
- [ ] Learning path generates: Beautiful 4-week roadmap ✅
- [ ] No 500 errors: Console shows success messages ✅
- [ ] No costs: Check Groq/Google/etc dashboard (should be $0) ✅

## Success!

If all items are checked, you're done! Your app now:
- ✅ Uses free AI (no Vercel billing required)
- ✅ Generates excellent quiz questions
- ✅ Creates personalized learning paths
- ✅ Works perfectly with zero payment risk

---

## Still Having Issues?

Check these files in order:
1. `SWITCH_TO_FREE_AI.md` - Is this what you followed?
2. `FREE_AI_OPTIONS_GUIDE.md` - Did you miss a step?
3. `ERROR_CODE_REFERENCE.md` - What do the error messages mean?
4. `VERCEL_ZERO_CONFIG_EXPLANATION.md` - Understanding the whole picture

Or check the console logs to see the exact error message and Google it for solutions.

Good luck! You've got this! 🚀
