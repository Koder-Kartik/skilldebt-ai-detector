import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { taskId } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Update task as completed
    const { error: taskError } = await supabase
      .from('daily_tasks')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (taskError) throw taskError

    // Update streak
    const today = new Date().toISOString().split('T')[0]
    const { data: streakData, error: streakFetchError } = await supabase
      .from('daily_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (streakFetchError && streakFetchError.code !== 'PGRST116') throw streakFetchError

    let newStreak = 1
    let longestStreak = 1

    if (streakData) {
      const lastActivityDate = streakData.last_activity_date
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (lastActivityDate === yesterdayStr) {
        newStreak = streakData.current_streak + 1
      } else if (lastActivityDate !== today) {
        newStreak = 1
      } else {
        newStreak = streakData.current_streak
      }

      longestStreak = Math.max(newStreak, streakData.longest_streak)

      const { error: updateError } = await supabase
        .from('daily_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError
    }

    return Response.json({
      success: true,
      streak: newStreak,
      longest_streak: longestStreak,
    })
  } catch (error) {
    console.error('Task completion error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
