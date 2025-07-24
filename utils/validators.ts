// Enhanced validation utilities for Pallenote

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim())
}

export const validateNoteTitle = (title: string): boolean => {
  return title.trim().length > 0 && title.trim().length <= 100
}

export const validateNoteContent = (content: string): boolean => {
  return content.trim().length > 0
}

export const validateTaskTitle = (title: string): boolean => {
  return title.trim().length > 0 && title.trim().length <= 200
}

export const validateNotebookTitle = (title: string): boolean => {
  return title.trim().length > 0 && title.trim().length <= 50
}

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/
  return phoneRegex.test(phone.trim())
}

// Form validation helper
export const validateForm = (
  fields: Record<string, any>,
  rules: Record<string, (value: any) => boolean | { isValid: boolean; errors: string[] }>,
): { isValid: boolean; errors: Record<string, string[]> } => {
  const errors: Record<string, string[]> = {}
  let isValid = true

  Object.keys(rules).forEach((field) => {
    const value = fields[field]
    const rule = rules[field]
    const result = rule(value)

    if (typeof result === "boolean") {
      if (!result) {
        errors[field] = [`Invalid ${field}`]
        isValid = false
      }
    } else {
      if (!result.isValid) {
        errors[field] = result.errors
        isValid = false
      }
    }
  })

  return { isValid, errors }
}
