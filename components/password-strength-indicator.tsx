import { validatePassword, getPasswordStrengthColor, getPasswordStrengthPercentage } from '@/lib/auth-validators'

interface PasswordStrengthIndicatorProps {
  password: string
  showDetails?: boolean
}

export function PasswordStrengthIndicator({
  password,
  showDetails = true,
}: PasswordStrengthIndicatorProps) {
  const validation = validatePassword(password)

  if (!password) {
    return null
  }

  const strengthColor = getPasswordStrengthColor(validation.strength)
  const strengthPercentage = getPasswordStrengthPercentage(validation.strength)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">Password Strength</span>
        <span className="text-xs font-semibold capitalize text-gray-700">
          {validation.strength}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all duration-300 ${strengthColor}`}
          style={{ width: `${strengthPercentage}%` }}
        />
      </div>

      {showDetails && (
        <div className="space-y-1">
          {validation.errors.length > 0 ? (
            <ul className="text-xs text-red-600 space-y-1">
              {validation.errors.map((error, i) => (
                <li key={i} className="flex gap-2">
                  <span>•</span> {error}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-green-600 font-medium">Password meets all requirements</p>
          )}

          {validation.suggestions.length > 0 && (
            <ul className="text-xs text-amber-600 space-y-1 pt-1">
              {validation.suggestions.map((suggestion, i) => (
                <li key={i} className="flex gap-2">
                  <span>✓</span> {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
