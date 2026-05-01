# Quiz Feature - Complete Troubleshooting & Debugging Guide

## Issue Summary: JSON Parse Error

**Error**: "Unexpected end of JSON input"  
**Root Cause**: The API was returning a streamed text response, but the frontend was trying to parse it as complete JSON

---

## Root Cause Analysis

### The Problem
The original implementation had a critical flaw in data handling:

```typescript
// ❌ BROKEN: Using streamText()
const result = await streamText({ ... })
return result.toTextStreamResponse()

// Frontend receives chunks, tries to parse as complete JSON
const text = await response.text()
const questionsData = JSON.parse(text) // FAILS: incomplete JSON
```

**Why it failed:**
- `streamText()` returns data in chunks for streaming responses
- `response.text()` on a streaming response returns incomplete partial data
- `JSON.parse()` expects complete, valid JSON - partial strings fail

---

## Solutions Implemented

### 1. API-Level Changes (generate/route.ts)

**Changed from streaming to complete response:**
```typescript
// ✅ FIXED: Using generateText()
const { text } = await generateText({ ... })

// Parse the complete response
let questions = JSON.parse(text)

// Validate structure
if (!Array.isArray(questions) || questions.length !== 5) {
  throw new Error('Expected exactly 5 questions')
}

// Return complete JSON response
return new Response(JSON.stringify({
  quizSessionId: quizSession.id,
  questions: questions,
}), { status: 200 })
```

**Key improvements:**
- Uses `generateText()` instead of `streamText()` for complete responses
- Validates JSON structure before returning
- Stores questions in database for persistence
- Returns both `quizSessionId` and `questions` as complete JSON

### 2. Frontend Component Updates (quiz-flow.tsx)

**Fixed data parsing:**
```typescript
// ✅ FIXED: Proper JSON parsing
const data = await response.json()
setQuizSessionId(data.quizSessionId)
setQuestions(data.questions)
```

**Added error handling:**
```typescript
if (!response.ok) {
  const errorData = await response.text()
  console.error('[v0] API error:', response.status, errorData)
  throw new Error(`Failed to generate questions: ${response.statusText}`)
}
```

**Added comprehensive logging:**
```typescript
console.log('[v0] Quiz data received:', { 
  sessionId: data.quizSessionId, 
  questionCount: data.questions?.length 
})
```

### 3. Quiz Page Integration (page.tsx)

**Simplified architecture:**
- Removed duplicate quiz session creation
- Let API handle session creation
- Properly pass session ID from component callback

---

## Data Flow Verification

### Quiz Generation Flow
```
1. User initiates quiz → /assessment/quiz?skill=JavaScript
2. QuizFlow component mounts
3. useEffect calls POST /api/quiz/generate
   ├─ Generate 5 questions with AI
   ├─ Create quiz_session in database
   ├─ Store questions in quiz_questions table
   ├─ Return complete JSON response
4. Frontend receives: { quizSessionId, questions[] }
5. Component renders questions
```

### Answer Submission Flow
```
1. User selects answers for all 5 questions
2. Clicks "Submit Quiz"
3. POST /api/quiz/analyze with:
   ├─ quizSessionId (from generation)
   ├─ answers[] (user responses)
   ├─ skillName (for gap analysis)
4. Server processes:
   ├─ Calculate score and correctness
   ├─ AI analyzes learning gaps
   ├─ Update quiz_sessions table with results
   ├─ Insert gaps into quiz_gaps table
5. Return results to frontend
6. Display quiz results screen
```

---

## Debugging Checklist

### Browser Console Logs
Enable browser DevTools and check for these logs:

```
[v0] Starting quiz generation for skill: JavaScript
[v0] Quiz data received: { sessionId: ..., questionCount: 5 }
[v0] Submitting quiz answers for session: ...
[v0] Quiz analysis complete
```

### Network Tab
Check the `/api/quiz/generate` request:
- **Status**: Should be 200
- **Response Type**: application/json
- **Response Body**: Complete JSON with `quizSessionId` and `questions` array
- **Time**: Usually 2-5 seconds (AI generation time)

### Server Console Logs
```
[v0] Starting quiz generation for skill: JavaScript
[v0] Quiz data received: { sessionId: ..., questionCount: 5 }
[v0] Analyzing quiz submission: { sessionId: ..., answerCount: 5 }
[v0] Updating quiz session with results: { score: 80, ... }
[v0] Quiz analysis complete, returning results
```

---

## Common Issues & Solutions

### Issue 1: "Unexpected end of JSON input"
**Cause**: Old streaming code still active  
**Solution**: 
1. Restart dev server: `pkill -f "pnpm dev" && pnpm dev`
2. Clear browser cache: Cmd+Shift+Delete (Chrome)
3. Check API response in Network tab is complete JSON

### Issue 2: "Quiz session not found"
**Cause**: API didn't create session or wrong ID passed  
**Solution**:
1. Check API logs for session creation error
2. Verify Supabase quiz_sessions table exists
3. Check RLS policies allow inserts

### Issue 3: Empty questions array
**Cause**: AI response wasn't valid JSON or parsing failed  
**Solution**:
1. Check server logs for "Failed to parse AI response"
2. Verify AI prompt returns valid JSON
3. Check AI model response in API logs

### Issue 4: Scores not saving
**Cause**: quiz_sessions table update failed  
**Solution**:
1. Check Supabase RLS policy allows updates
2. Verify all required columns exist:
   - `total_questions`
   - `correct_answers`
   - `score`
   - `overall_assessment`
   - `gap_chain`
3. Check database for errors in server logs

---

## Testing Procedure

### Manual Testing Steps
1. **Sign in** to the application
2. **Go to Dashboard** → Assessment/Diagnosis section
3. **Select "Quiz Method"** and choose a skill
4. **Watch browser console** for logs
5. **Answer all 5 questions**
6. **Click Submit**
7. **Check results page** loads with score and gaps

### Verifying Data Persistence
```sql
-- Check quiz session created
SELECT id, user_id, skill_name, score FROM quiz_sessions 
WHERE created_at > NOW() - INTERVAL '5 minutes';

-- Check questions stored
SELECT quiz_session_id, question_number, question_text 
FROM quiz_questions 
WHERE quiz_session_id = '<session-id>';

-- Check gaps identified
SELECT * FROM quiz_gaps 
WHERE quiz_session_id = '<session-id>';
```

---

## API Response Validation

### Generate API Response Format
```json
{
  "quizSessionId": "uuid",
  "questions": [
    {
      "number": 1,
      "question": "What is...?",
      "type": "multiple_choice",
      "difficulty": "easy",
      "topic": "Fundamentals",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "B",
      "explanation": "Because..."
    }
    // 4 more questions...
  ]
}
```

### Analyze API Request Format
```json
{
  "quizSessionId": "uuid",
  "answers": [
    {
      "questionNumber": 1,
      "topic": "Fundamentals",
      "difficulty": "easy",
      "isCorrect": true
    }
    // 4 more answers...
  ],
  "skillName": "JavaScript"
}
```

### Analyze API Response Format
```json
{
  "score": 80,
  "correctAnswers": 4,
  "totalQuestions": 5,
  "overallAssessment": "advanced",
  "gaps": [
    {
      "description": "...",
      "category": "foundational",
      "severity": "medium",
      "relatedQuestions": [2]
    }
  ],
  "gapChain": "...",
  "recommendations": ["..."]
}
```

---

## Database Schema Requirements

### Required Tables

**quiz_sessions**
```sql
id (UUID, primary key)
user_id (UUID, foreign key)
skill_name (text)
diagnosis_method (text)
quiz_type (text)
score (float)
correct_answers (int)
total_questions (int)
overall_assessment (text)
gap_chain (text)
difficulty_distribution (jsonb)
created_at (timestamp)
updated_at (timestamp)
```

**quiz_questions**
```sql
id (UUID, primary key)
quiz_session_id (UUID, foreign key)
question_number (int)
question_text (text)
question_type (text)
difficulty (text)
topic (text)
correct_answer (text)
explanation (text)
resources (jsonb)
created_at (timestamp)
```

**quiz_gaps**
```sql
id (UUID, primary key)
quiz_session_id (UUID, foreign key)
gap_description (text)
gap_category (text)
severity (text)
related_questions (int array)
learning_resources (jsonb)
created_at (timestamp)
```

---

## Performance Considerations

### Generation Time
- Average: 3-5 seconds
- Max: 10 seconds (under heavy AI load)
- Causes: AI model generation latency

### Optimization Tips
1. Cache questions for repeated skills (Redis)
2. Pre-generate questions in background job
3. Use faster AI models (gpt-4o-mini is already optimized)
4. Add progress indicator UX during generation

---

## Monitoring & Alerts

### Key Metrics to Monitor
```javascript
// Quiz generation latency
(quiz_api_response_time_ms)

// Question quality score
(average_generation_attempts_per_quiz)

// User completion rate
(quizzes_submitted / quizzes_started)

// Analysis accuracy
(gap_identification_accuracy)
```

### Error Tracking
All errors are logged with `[v0]` prefix:
```javascript
[v0] Starting quiz generation for skill: ...
[v0] Failed to parse AI response: ...
[v0] Quiz analysis error: ...
```

Search your logs for `[v0] error\|[v0] Error` to find issues.

---

## Next Steps for Improvement

1. **Implement quiz caching** - Store generated questions for repeated skills
2. **Add retry logic** - Automatically retry failed API calls
3. **Stream results progressively** - Show results as gaps are identified
4. **Add quiz difficulty adaptation** - Adjust difficulty based on answers
5. **Implement spaced repetition** - Recommend review timing for gaps
6. **Add peer comparison** - Show how user scores vs others

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `pnpm build` | Verify code compiles |
| `pnpm dev` | Start dev server |
| `grep '[v0]' server_logs.txt` | Find debug logs |
| `curl -X POST http://localhost:3000/api/quiz/generate` | Test API manually |

