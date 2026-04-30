import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface SkillCardProps {
  skillName: string
  currentLevel: string
  gapCount: number
  masteryScore: number
  onExplore: () => void
}

const levelColors = {
  beginner: 'bg-blue-100 text-blue-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-green-100 text-green-800',
  expert: 'bg-purple-100 text-purple-800',
}

export function SkillCard({
  skillName,
  currentLevel,
  gapCount,
  masteryScore,
  onExplore,
}: SkillCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{skillName}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Level</span>
          <Badge className={levelColors[currentLevel as keyof typeof levelColors] || 'bg-gray-100 text-gray-800'}>
            {currentLevel}
          </Badge>
        </div>
        
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Mastery</span>
            <span className="text-sm font-semibold text-gray-900">{masteryScore.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${masteryScore}%` }}
            />
          </div>
        </div>

        <div className="pt-2">
          <p className="text-sm text-gray-600">
            {gapCount} {gapCount === 1 ? 'gap' : 'gaps'} identified
          </p>
        </div>

        <Button onClick={onExplore} className="mt-auto w-full">
          Explore Path
        </Button>
      </CardContent>
    </Card>
  )
}
