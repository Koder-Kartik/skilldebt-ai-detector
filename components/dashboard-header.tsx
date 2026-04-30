'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export function DashboardHeader() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SkillDebt</h1>
            <p className="text-sm text-gray-600">Master your learning gaps</p>
          </div>
          <Button
            onClick={handleLogout}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? 'Logging out...' : 'Log Out'}
          </Button>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex gap-4 text-sm">
          <Link href="/dashboard" className="font-medium text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
          <Link href="/daily-tasks" className="font-medium text-gray-600 hover:text-gray-900">
            Daily Tasks
          </Link>
          <Link href="/progress" className="font-medium text-gray-600 hover:text-gray-900">
            Progress
          </Link>
          <Link href="/integrations" className="font-medium text-gray-600 hover:text-gray-900">
            Integrations
          </Link>
        </nav>
      </div>
    </header>
  )
}
