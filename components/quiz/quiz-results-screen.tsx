'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Gap {
  description: string
  category: 'foundational' | 'intermediate' | 'advanced'
  severity: 'low' | 'medium' | 'high'
  relatedQuestions: number[]
}

interface QuizResultsScreenProps {
  score: number
  correctAnswers: number
  totalQuestions: number
  overallAssessment: string
  gaps: Gap[]
  gapChain: string
  recommendations: string[]
  skillName: string
  onCreatePath: () => void
}

const severityColors = {
  low: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
}

const categoryColors = {
  foundational: 'bg-blue-100 text-blue-800',
  intermediate: 'bg-purple-100 text-purple-800',
  advanced: 'bg-indigo-100 text-indigo-800',
}

export function QuizResultsScreen({
  score,
  correctAnswers,
  totalQuestions,
  overallAssessment,
  gaps,
  gapChain,
  recommendations,
  skillName,
  onCreatePath,
}: QuizResultsScreenProps) {
  const assessmentColor =
    overallAssessment === 'expert'
      ? 'text-green-600'
      : overallAssessment === 'advanced'
        ? 'text-blue-600'
        : overallAssessment === 'intermediate'
          ? 'text-yellow-600'
          : 'text-red-600'

  const chartData = [
    { name: 'Correct', value: correctAnswers },
    { name: 'Incorrect', value: totalQuestions - correctAnswers },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
      {/* Score Card */}
      <Card className="border-0 bg-gradient-to-br from-white to-gray-50 p-8 text-center shadow-lg">
        <h2 className="mb-4 text-3xl font-bold text-gray-900">Quiz Complete!</h2>
        
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Your Score</p>
            <p className="text-4xl font-bold text-blue-600">{score.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Correct Answers</p>
            <p className="text-4xl font-bold text-green-600">{correctAnswers}/{totalQuestions}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Assessment</p>
            <p className={`text-3xl font-bold capitalize ${assessmentColor}`}>
              {overallAssessment}
            </p>
          </div>
        </div>

        <div className="mb-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className={`text-lg font-medium ${assessmentColor}`}>
          You&apos;re at an {overallAssessment} level in {skillName}
        </p>
      </Card>

      {/* Gap Chain */}
      <Card className="border-l-4 border-orange-500 bg-orange-50 p-6">
        <h3 className="mb-3 font-semibold text-gray-900">How Your Gaps Connect</h3>
        <p className="text-gray-700">{gapChain}</p>
      </Card>

      {/* Identified Gaps */}
      <div>
        <h3 className="mb-4 text-2xl font-bold text-gray-900">Identified Gaps</h3>
        <div className="space-y-4">
          {gaps.map((gap, idx) => (
            <Card key={idx} className="border-l-4 border-orange-400 p-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge className={categoryColors[gap.category]}>
                  {gap.category}
                </Badge>
                <Badge className={severityColors[gap.severity]}>
                  {gap.severity} severity
                </Badge>
              </div>
              <p className="text-gray-800">{gap.description}</p>
              {gap.relatedQuestions.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  Related to questions: {gap.relatedQuestions.join(', ')}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h3 className="mb-4 text-2xl font-bold text-gray-900">Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {idx + 1}
                </span>
                <p className="text-gray-800">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="text-center">
        <Button
          onClick={onCreatePath}
          className="bg-blue-600 px-8 py-6 text-lg hover:bg-blue-700"
        >
          Create Personalized Learning Path
        </Button>
      </div>
    </div>
  )
}
