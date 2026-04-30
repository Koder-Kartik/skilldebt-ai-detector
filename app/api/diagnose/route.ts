import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { skill, level, experience, goals } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const prompt = `You are an expert learning coach analyzing a person's skill level and creating a detailed diagnosis of their knowledge gaps.

User's Skill: ${skill}
Current Level: ${level}
Years of Experience: ${experience || 'Not specified'}
Learning Goals: ${goals || 'General improvement'}

Based on this information, provide a detailed diagnosis that includes:

1. **Current Proficiency Assessment**: A brief evaluation of their current level and what that likely means in practical terms.

2. **Key Knowledge Gaps**: 5-7 specific areas where they likely have gaps based on their level. Format each gap as:
   - Gap title (2-3 words)
   - Brief description (1-2 sentences)
   - Priority: High/Medium/Low (based on impact on their goals)

3. **Recommended Learning Path**: A personalized path with 4-6 phases, each including:
   - Phase name and duration
   - Key topics to cover
   - Practical exercises to complete
   - Expected outcome

4. **Resources Recommendation**: Suggest 3-5 types of learning resources (books, courses, projects, communities) that would be most effective.

5. **Mastery Timeline**: An estimate of how long it would take to reach the next level with consistent effort (2-3 hours per week).

Format your response clearly with headers and bullet points for easy reading.`

    const result = streamText({
      model: 'openai/gpt-4-turbo',
      system:
        'You are a skilled learning coach who provides detailed, actionable skill assessments and learning recommendations. Be specific and practical in your suggestions.',
      prompt,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Diagnosis error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
