import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { skillName } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Fetch learning path
    const { data: pathData, error: pathError } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('user_id', user.id)
      .eq('skill_name', skillName)
      .single()

    if (pathError) throw pathError

    // Fetch progress
    const { data: progressData, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('skill_name', skillName)
      .single()

    if (progressError && progressError.code !== 'PGRST116') throw progressError

    // Generate document content
    const content = {
      title: `${skillName} Learning Path Report`,
      generated_at: new Date().toISOString(),
      skill_name: skillName,
      path: pathData ? JSON.parse(pathData.path_content) : null,
      progress: progressData,
    }

    // In a real implementation, this would:
    // 1. Format the content as PDF or Markdown
    // 2. Call Google Drive API to create the document
    // 3. Return the document URL

    return Response.json({
      success: true,
      content,
      message: 'In production, this would be exported to Google Drive',
    })
  } catch (error) {
    console.error('Export error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
