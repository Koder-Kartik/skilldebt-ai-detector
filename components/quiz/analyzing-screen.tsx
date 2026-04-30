'use client'

import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'

const messages = [
  'Analyzing your answers...',
  'Identifying knowledge gaps...',
  'Mapping learning paths...',
  'Preparing your personalized diagnosis...',
]

export function AnalyzingScreen() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <Spinner className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">
          Analyzing Your Assessment
        </h2>
        <p className="min-h-6 text-lg text-gray-600 transition-opacity duration-300">
          {messages[messageIndex]}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              className="h-2 w-2 rounded-full bg-blue-600 opacity-50 transition-all duration-300"
              style={{
                opacity: messageIndex === dot ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
