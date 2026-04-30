import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { quizSessionId, answers, skillName } = await req.json()

    if (!quizSessionId || !answers) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
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

    // Verify quiz session belongs to user
    const { data: quizSession } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('id', quizSessionId)
      .eq('user_id', user.id)
      .single()

    if (!quizSession) {
      return new Response(JSON.stringify({ error: 'Quiz session not found' }), {
        status: 404,
      })
    }

    // Calculate score and analyze gaps
    let correctCount = 0
    const analysisSummary = []

    for (const answer of answers) {
      if (answer.isCorrect) {
        correctCount++
      }
      analysisSummary.push({
        questionNumber: answer.questionNumber,
        isCorrect: answer.isCorrect,
        topic: answer.topic,
      })
    }

    const score = (correctCount / answers.length) * 100
    const overallAssessment =
      score >= 80
        ? 'advanced'
        : score >= 60
          ? 'intermediate'
          : score >= 40
            ? 'beginner'
            : 'novice'

    // Use AI to identify gaps based on answers
    const gapAnalysis = await generateText({
      model: 'openai/gpt-4o-mini',
      system: `You are an expert learning analyst. Based on quiz performance, identify specific learning gaps.
      
Return a JSON object with this structure:
{
  "gaps": [
    {
      "description": "specific gap description",
      "category": "foundational|intermediate|advanced",
      "severity": "low|medium|high",
      "relatedQuestions": [1, 3]
    }
  ],
  "gapChain": "description of how gaps connect and compound",
  "recommendations": ["recommendation 1", "recommendation 2"]
}

Return ONLY valid JSON.`,
      prompt: `User scored ${score}% on ${skillName} assessment. 
Answer analysis: ${JSON.stringify(analysisSummary)}

Identify gaps and how they relate to each other.`,
    })

    let gapData
    try {
      gapData = JSON.parse(gapAnalysis.text)
    } catch {
      gapData = {
        gaps: [
          {
            description: 'Foundation building needed',
            category: 'foundational',
            severity: 'high',
            relatedQuestions: [],
          },
        ],
        gapChain: 'Core concepts need reinforcement',
        recommendations: ['Review fundamentals', 'Practice basic exercises'],
      }
    }

    // Update quiz session with results
    const { error: updateError } = await supabase
      .from('quiz_sessions')
      .update({
        correct_answers: correctCount,
        score: score,
        overall_assessment: overallAssessment,
        gap_chain: gapData.gapChain,
        difficulty_distribution: {
          easy: answers.filter((a) => a.difficulty === 'easy').length,
          medium: answers.filter((a) => a.difficulty === 'medium').length,
          hard: answers.filter((a) => a.difficulty === 'hard').length,
        },
      })
      .eq('id', quizSessionId)

    if (updateError) {
      throw updateError
    }

    // Save identified gaps
    for (const gap of gapData.gaps || []) {
      await supabase.from('quiz_gaps').insert({
        quiz_session_id: quizSessionId,
        gap_description: gap.description,
        gap_category: gap.category,
        severity: gap.severity,
        related_questions: gap.relatedQuestions,
        learning_resources: [],
      })
    }

    return new Response(
      JSON.stringify({
        score: score,
        correctAnswers: correctCount,
        totalQuestions: answers.length,
        overallAssessment: overallAssessment,
        gaps: gapData.gaps,
        gapChain: gapData.gapChain,
        recommendations: gapData.recommendations,
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Quiz analysis error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to analyze quiz' }),
      { status: 500 }
    )
  }
}
