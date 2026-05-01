/**
 * Authentication Validation Utilities
 * Provides client-side validation for email, password, and registration
 */

export interface PasswordValidationResult {
  isValid: boolean
  strength: 'weak' | 'fair' | 'good' | 'strong'
  errors: string[]
  suggestions: string[]
}

export interface EmailValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates password strength and returns detailed feedback
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  const suggestions: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
    suggestions.push('Add an uppercase letter (A-Z)')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
    suggestions.push('Add a lowercase letter (a-z)')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
    suggestions.push('Add a number (0-9)')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
    suggestions.push('Add a special character (!@#$%^&*)')
  }

  // Determine strength
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  const isSufficientLength = password.length >= 8

  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak'

  if (isSufficientLength && hasUppercase && hasLowercase && hasNumber && hasSpecial) {
    strength = 'strong'
  } else if (isSufficientLength && hasUppercase && hasLowercase && (hasNumber || hasSpecial)) {
    strength = 'good'
  } else if (isSufficientLength && (hasUppercase || hasLowercase) && hasNumber) {
    strength = 'fair'
  }

  return {
    isValid: errors.length === 0,
    strength,
    errors,
    suggestions: suggestions.slice(0, 2), // Show max 2 suggestions
  }
}

/**
 * Validates email format using RFC 5322 simplified pattern
 */
export function validateEmail(email: string): EmailValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email) {
    return {
      isValid: false,
      error: 'Email is required',
    }
  }

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    }
  }

  if (email.length > 254) {
    return {
      isValid: false,
      error: 'Email address is too long',
    }
  }

  return { isValid: true }
}

/**
 * Validates that password and confirmation match
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Passwords do not match',
    }
  }

  return { isValid: true }
}

/**
 * Comprehensive signup form validation
 */
export function validateSignupForm(
  email: string,
  password: string,
  confirmPassword: string
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  // Validate email
  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error || 'Invalid email'
  }

  // Validate password strength
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0] || 'Password does not meet requirements'
  }

  // Validate password match
  const matchValidation = validatePasswordMatch(password, confirmPassword)
  if (!matchValidation.isValid) {
    errors.confirmPassword = matchValidation.error || 'Passwords do not match'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Get password strength color for UI display
 */
export function getPasswordStrengthColor(
  strength: 'weak' | 'fair' | 'good' | 'strong'
): string {
  const colors = {
    weak: 'bg-red-500',
    fair: 'bg-yellow-500',
    good: 'bg-blue-500',
    strong: 'bg-green-500',
  }
  return colors[strength]
}

/**
 * Get password strength percentage for progress bar
 */
export function getPasswordStrengthPercentage(
  strength: 'weak' | 'fair' | 'good' | 'strong'
): number {
  const percentages = {
    weak: 25,
    fair: 50,
    good: 75,
    strong: 100,
  }
  return percentages[strength]
}
