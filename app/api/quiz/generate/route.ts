import { createClient } from '@/lib/supabase/server'
import { streamText } from 'ai'
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
    const result = await streamText({
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

    // Stream the questions back
    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[v0] Quiz generation error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate quiz' }),
      { status: 500 }
    )
  }
}
