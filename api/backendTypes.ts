// Types generated to match backend entity structure

// User
export interface User {
  id?: string; // or number, if you want to keep it as long
  fullName?: string;
  email: string;
  username?: string | null;
  password?: string; // usually not sent to frontend!
  profile?: any; // URL or null
  isVerified?: boolean;
  is2faOn?: boolean;
  twoFA?: boolean; // API response uses this field
}

// Otp
export interface Otp {
  userId: string;
  code: number;
}

// Notebook
export interface Notebook {
  id: string;
  title: string;
  ownerId: string;
  isDefault: boolean;
  createdAt: string; // date only string
  updatedAt?: string;
}

// Note
export interface Note {
  id: string;
  title: string;
  content: string;
  notebookId: string;
  date: string;
  createdAt: string; // date only string
  updatedAt?: string;
}

// SharedNote
export type AccessType = "viewer" | "editor";
export interface SharedNote {
  recipientId: string;
  notebookId: string;
  accessType: AccessType;
  allowedNotes: string[]; // array of note ids
}

// NoteReference
export type FileType = "audio" | "pdf" | "img";
export interface NoteReference {
  id: string;
  noteId: string;
  link: string;
  fileType: FileType;
}

// Event
export type EventType = "task" | "goal";
export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  userId: string;
  createdAt: string; // date only string
}

// Reminder
export interface Reminder {
  eventId: string;
  repeat: any; // JSON, can be typed more strictly if you know the structure
}

// CompletedEvent
export interface CompletedEvent {
  eventId: string;
  completionDate: string; // date only
}

// Notification
export interface Notification {
  id: string;
  message: string;
  userId: string;
  isRead: boolean;
  createdAt: string; // date only string
}

// SubscriptionPlan
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  paymentGatewayProductId: string;
  paymentGatewayPriceId: string;
}

// Subscription
export type SubscriptionStatus = "paid" | "unpaid" | "cancel" | "pending";
export interface Subscription {
  subId: string;
  planId: string;
  userId: string;
  status: SubscriptionStatus;
}

// Checkout
export interface Checkout {
  sessionId: string;
  planId: string;
  userId: string;
} 