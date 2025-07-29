// API types for pallenote


export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface AuthResponse {
  authToken: string;
  email: string;
  username: string;
  profile: any;
  twoFA: boolean;
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
  deletedAt?: string; // when notebook was moved to recycle bin
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
  deletedAt?: string; // when note was moved to recycle bin
  // Add more fields as needed
}

export interface Recording {
  id: string;
  title: string;
  duration: string;
  date: string;
  size: string;
  deletedAt?: string; // when recording was moved to recycle bin
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
  deletedAt?: string; // when task was moved to recycle bin
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