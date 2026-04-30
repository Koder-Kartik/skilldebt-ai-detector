import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { skillName, gapDescription, priority = 'medium' } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { data, error } = await supabase.from('learning_gaps').insert([
      {
        user_id: user.id,
        skill_name: skillName,
        gap_description: gapDescription,
        priority,
        status: 'open',
      },
    ])

    if (error) throw error

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('Gap creation error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
