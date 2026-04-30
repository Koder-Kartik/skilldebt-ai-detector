'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface DiagnosisEntryProps {
  skillName: string
  onQuizStart: () => void
  onManualStart: () => void
}

export function DiagnosisEntry({
  skillName,
  onQuizStart,
  onManualStart,
}: DiagnosisEntryProps) {
  const [selectedMethod, setSelectedMethod] = useState<'quiz' | 'manual' | null>(
    null
  )

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">
          How should we assess <span className="text-blue-600">{skillName}</span>?
        </h2>
        <p className="text-gray-600">
          Choose your preferred method for skill diagnosis
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quiz Option */}
        <Card
          className={`cursor-pointer border-2 p-8 transition-all duration-150 ${
            selectedMethod === 'quiz'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
          }`}
          onClick={() => setSelectedMethod('quiz')}
        >
          <div className="mb-4 flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-900">AI Quiz</h3>
            <Badge className="bg-blue-100 text-blue-800">Recommended</Badge>
          </div>
          <p className="mb-6 text-gray-600">
            Take a 5-question adaptive quiz covering different difficulty levels.
            Get AI-powered analysis of knowledge gaps and learning paths.
          </p>
          <div className="mb-6 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">✓</span> 5-10 minutes
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">✓</span> Adaptive difficulty
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">✓</span> Instant feedback
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">✓</span> Gap identification
            </div>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onQuizStart()
            }}
            className={`w-full ${
              selectedMethod === 'quiz'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            disabled={selectedMethod !== 'quiz'}
          >
            Start Quiz
          </Button>
        </Card>

        {/* Manual Option */}
        <Card
          className={`cursor-pointer border-2 p-8 transition-all duration-150 ${
            selectedMethod === 'manual'
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onClick={() => setSelectedMethod('manual')}
        >
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Manual Input
            </h3>
          </div>
          <p className="mb-6 text-gray-600">
            Describe your skill level and learning goals directly. Get a
            personalized diagnosis based on your input.
          </p>
          <div className="mb-6 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">✓</span> 2-3 minutes
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">✓</span> Self-assessment
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">✓</span> Conversation-based
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">✓</span> Personalized output
            </div>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onManualStart()
            }}
            variant={selectedMethod === 'manual' ? 'default' : 'outline'}
            className="w-full"
            disabled={selectedMethod !== 'manual'}
          >
            Self-Assess
          </Button>
        </Card>
      </div>
    </div>
  )
}
