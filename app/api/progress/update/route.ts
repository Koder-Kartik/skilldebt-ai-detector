import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { skillName, masteryScore, tasksCompleted } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { error } = await supabase.from('progress').upsert(
      [
        {
          user_id: user.id,
          skill_name: skillName,
          mastery_score: Math.min(100, Math.max(0, masteryScore)),
          tasks_completed: tasksCompleted || 0,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'user_id,skill_name' }
    )

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('Progress update error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
