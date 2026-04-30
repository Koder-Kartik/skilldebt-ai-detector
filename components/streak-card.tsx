import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StreakCardProps {
  currentStreak: number
  longestStreak: number
}

export function StreakCard({ currentStreak, longestStreak }: StreakCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Streak</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Current Streak</p>
            <p className="text-4xl font-bold text-blue-600">{currentStreak}</p>
            <p className="text-xs text-gray-500">days in a row</p>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-600">Longest Streak</p>
            <p className="text-2xl font-bold text-purple-600">{longestStreak}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
