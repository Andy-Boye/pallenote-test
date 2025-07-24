// Enhanced date and time utilities for Pallenote

export const formatDate = (dateString: string | Date, format?: "short" | "long" | "medium"): string => {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString

  if (isNaN(date.getTime())) {
    return "Invalid Date"
  }

  switch (format) {
    case "short":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    case "long":
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    case "medium":
    default:
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
  }
}

export const formatTime = (dateString: string | Date): string => {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString

  if (isNaN(date.getTime())) {
    return "Invalid Time"
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export const formatDateTime = (dateString: string | Date): string => {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString

  if (isNaN(date.getTime())) {
    return "Invalid DateTime"
  }

  return `${formatDate(date)} at ${formatTime(date)}`
}

export const getRelativeTime = (dateString: string | Date): string => {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "Just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`
}

export const isToday = (dateString: string | Date): boolean => {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  const today = new Date()

  return date.toDateString() === today.toDateString()
}

export const isYesterday = (dateString: string | Date): boolean => {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  return date.toDateString() === yesterday.toDateString()
}

export const isSameWeek = (date1: string | Date, date2: string | Date): boolean => {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1
  const d2 = typeof date2 === "string" ? new Date(date2) : date2

  const startOfWeek1 = new Date(d1)
  startOfWeek1.setDate(d1.getDate() - d1.getDay())

  const startOfWeek2 = new Date(d2)
  startOfWeek2.setDate(d2.getDate() - d2.getDay())

  return startOfWeek1.toDateString() === startOfWeek2.toDateString()
}

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
  }

  return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

export const startOfDay = (date: Date): Date => {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export const endOfDay = (date: Date): Date => {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}
