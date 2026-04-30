import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const pathSchema = z.object({
  skill: z.string(),
  level: z.string(),
  gaps: z.array(z.string()).optional(),
  goals: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { skill, level, gaps, goals } = pathSchema.parse(body)

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const gapsText = gaps && gaps.length > 0 ? gaps.join(', ') : 'general skill improvement'

    const prompt = `Create a detailed 4-week personalized learning path for someone to master the ${skill} skill.

Current Level: ${level}
Key Gaps to Address: ${gapsText}
Goals: ${goals || 'General mastery'}

Structure the response as a JSON object with this schema:
{
  "title": "string",
  "duration_weeks": 4,
  "difficulty": "string",
  "phases": [
    {
      "week": number,
      "title": "string",
      "topics": ["string"],
      "exercises": ["string"],
      "resources": ["string"],
      "time_commitment": "string"
    }
  ],
  "daily_tasks": [
    {
      "day": "string",
      "tasks": ["string"],
      "estimated_time": "string"
    }
  ],
  "success_metrics": ["string"],
  "checkpoint_assessments": ["string"]
}

Provide practical, actionable tasks. Format as valid JSON only.`

    const result = await generateText({
      model: 'openai/gpt-4-turbo',
      system:
        'You are an expert curriculum designer. Create detailed, structured learning paths with practical tasks and exercises. Always respond with valid JSON.',
      prompt,
    })

    if (!result.text) {
      throw new Error('No response from AI')
    }

    // Extract JSON from response
    let pathData
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        pathData = JSON.parse(jsonMatch[0])
      } else {
        pathData = JSON.parse(result.text)
      }
    } catch {
      pathData = {
        title: `${skill} Mastery Path`,
        duration_weeks: 4,
        difficulty: level,
        phases: [],
        daily_tasks: [],
        success_metrics: ['Complete all exercises', 'Build a project', 'Pass assessment'],
        checkpoint_assessments: ['Week 1 Assessment', 'Week 2 Assessment', 'Week 4 Final Project'],
      }
    }

    // Save to database
    const { error: saveError } = await supabase.from('learning_paths').upsert(
      [
        {
          user_id: user.id,
          skill_name: skill,
          path_content: JSON.stringify(pathData),
          duration_weeks: pathData.duration_weeks || 4,
          difficulty: level,
        },
      ],
      { onConflict: 'user_id,skill_name' }
    )

    if (saveError) throw saveError

    return Response.json(pathData)
  } catch (error) {
    console.error('Learning path error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
