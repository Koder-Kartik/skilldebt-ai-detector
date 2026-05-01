'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface QuizErrorScreenProps {
  error: string
  onRetry?: () => void
  showRetry?: boolean
}

export function QuizErrorScreen({
  error,
  onRetry,
  showRetry = true,
}: QuizErrorScreenProps) {
  const router = useRouter()

  // Map error types to user-friendly messages
  const getErrorDisplay = (errorMsg: string) => {
    const lowerError = errorMsg.toLowerCase()

    if (lowerError.includes('api key') || lowerError.includes('unauthorized') || lowerError.includes('401')) {
      return {
        title: 'Configuration Issue',
        description: 'The AI service is not properly configured.',
        details:
          'Your administrator needs to set up API credentials for the AI-powered question generation. Please contact support if this persists.',
        icon: '⚙️',
      }
    }

    if (lowerError.includes('rate limit') || lowerError.includes('429')) {
      return {
        title: 'Service Temporarily Busy',
        description: 'Too many requests are being processed.',
        details:
          'The AI service is experiencing high demand. Please wait a moment and try again.',
        icon: '⏳',
      }
    }

    if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('timeout')) {
      return {
        title: 'Connection Problem',
        description: 'Unable to reach the question generation service.',
        details:
          'This might be a temporary network issue. Please check your internet connection and try again.',
        icon: '🌐',
      }
    }

    if (lowerError.includes('invalid question') || lowerError.includes('parse') || lowerError.includes('json')) {
      return {
        title: 'Service Error',
        description: 'The question generation service returned an unexpected response.',
        details:
          'This is a temporary backend issue. Please try again, or contact support if the problem continues.',
        icon: '⚡',
      }
    }

    // Default generic error
    return {
      title: 'Quiz Generation Failed',
      description: 'We encountered an issue while generating your assessment questions.',
      details:
        'This might be due to a temporary service issue, network problem, or backend error. Please try again, and if the problem persists, contact our support team.',
      icon: '❌',
    }
  }

  const errorDisplay = getErrorDisplay(error)

  return (
    <div className="min-h-svh bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{errorDisplay.icon}</span>
            <div>
              <CardTitle className="text-red-900">{errorDisplay.title}</CardTitle>
            </div>
          </div>
          <CardDescription className="text-red-700">{errorDisplay.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <p className="text-sm text-red-800">{errorDisplay.details}</p>
          </div>

          <div className="space-y-3">
            {showRetry && onRetry && (
              <Button onClick={onRetry} className="w-full bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            )}
            <Button variant="outline" onClick={() => router.back()} className="w-full">
              Go Back
            </Button>
          </div>

          <div className="text-xs text-gray-600 text-center">
            <p>If this issue continues, please contact support@skilldebai.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
