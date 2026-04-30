'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface QuestionCardProps {
  questionNumber: number
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  options: string[]
  selectedAnswer?: string
  onAnswerChange: (answer: string) => void
  isAnswered: boolean
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
}

export function QuestionCard({
  questionNumber,
  question,
  difficulty,
  topic,
  options,
  selectedAnswer,
  onAnswerChange,
  isAnswered,
}: QuestionCardProps) {
  return (
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Question {questionNumber} of 5
          </h3>
          <p className="mt-1 text-sm text-gray-600">{topic}</p>
        </div>
        <Badge className={`${difficultyColors[difficulty]}`}>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </Badge>
      </div>

      <p className="mb-8 text-xl font-medium text-gray-800">{question}</p>

      <RadioGroup value={selectedAnswer || ''} onValueChange={onAnswerChange}>
        <div className="space-y-4">
          {options.map((option, index) => {
            const letter = String.fromCharCode(65 + index)
            return (
              <div key={index} className="flex items-center space-x-3">
                <RadioGroupItem
                  value={letter}
                  id={`option-${letter}`}
                  disabled={isAnswered}
                  className="h-5 w-5"
                />
                <Label
                  htmlFor={`option-${letter}`}
                  className="flex cursor-pointer items-center rounded-lg border-2 border-gray-200 px-4 py-3 hover:border-blue-400 hover:bg-blue-50"
                >
                  <span className="font-semibold text-gray-700">{letter})</span>
                  <span className="ml-3 text-gray-700">{option.substring(3)}</span>
                </Label>
              </div>
            )
          })}
        </div>
      </RadioGroup>
    </Card>
  )
}
