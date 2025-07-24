// Shared TypeScript interfaces for the Pallenote project
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  preview: string
  notebookId?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  audioRecording?: string
}

export interface Notebook {
  id: string
  title: string
  description: string
  color?: string
  noteCount: number
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  dueDate?: string
  priority: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  location?: string
  createdAt: string
  updatedAt: string
}

export interface Recording {
  id: string
  filename: string
  duration: number
  size: number
  transcription?: string
  noteId?: string
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}
