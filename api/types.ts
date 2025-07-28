// API types for pallenote

import type { User } from "./backendTypes"

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  // Add more fields as needed
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  // Add more fields as needed
}

export interface Notebook {
  id: string;
  title: string;
  // Add more fields as needed
}

export interface Note {
  id: string;
  title: string;
  content: string;
  notebookId: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  // Add more fields as needed
}

export interface Recording {
  id: string;
  title: string;
  duration: string;
  date: string;
  size: string;
  // Add more fields as needed
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  // Add more fields as needed
}

// Auth-related types
export interface OtpRequest {
  email: string;
  otp: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface OtpResponse {
  message: string;
} 