import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { skillName } = await req.json()
    
    if (!skillName) {
      return new Response(JSON.stringify({ error: 'Skill name required' }), {
        status: 400,
      })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    // Create quiz session
    const { data: quizSession, error: sessionError } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: user.id,
        skill_name: skillName,
        diagnosis_method: 'quiz',
        quiz_type: 'comprehensive',
      })
      .select()
      .single()

    if (sessionError) {
      throw sessionError
    }

    // Generate questions using AI
    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      system: `You are an expert assessment specialist. Generate exactly 5 multiple-choice questions to assess someone's understanding of ${skillName}. 
      
Return a JSON array with exactly this structure for each question:
[
  {
    "number": 1,
    "question": "question text",
    "type": "multiple_choice",
    "difficulty": "easy|medium|hard",
    "topic": "specific topic",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correctAnswer": "B",
    "explanation": "why this is correct"
  }
]

Ensure:
- 2 easy, 2 medium, 1 hard difficulty
- Questions test foundational knowledge, practical application, and edge cases
- Return ONLY valid JSON, no markdown or extra text`,
      prompt: `Generate 5 assessment questions for: ${skillName}`,
      temperature: 0.7,
    })

    // Parse the generated questions
    let questions
    try {
      questions = JSON.parse(text)
    } catch (parseError) {
      console.error('[v0] Failed to parse AI response:', text)
      throw new Error('Invalid question format from AI')
    }

    // Validate questions structure
    if (!Array.isArray(questions) || questions.length !== 5) {
      throw new Error('Expected exactly 5 questions')
    }

    // Store questions in quiz session
    const questionsWithSessionId = questions.map((q: any, idx: number) => ({
      quiz_session_id: quizSession.id,
      question_number: idx + 1,
      question_text: q.question,
      question_type: q.type || 'multiple_choice',
      difficulty: q.difficulty,
      topic: q.topic,
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
      resources: null,
    }))

    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(questionsWithSessionId)

    if (questionsError) {
      throw questionsError
    }

    // Return the questions and session ID as JSON
    return new Response(
      JSON.stringify({
        quizSessionId: quizSession.id,
        questions: questions.map((q: any, idx: number) => ({
          number: idx + 1,
          question: q.question,
          type: q.type || 'multiple_choice',
          difficulty: q.difficulty,
          topic: q.topic,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[v0] Quiz generation error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate quiz' }),
      { status: 500 }
    )
  }
}
