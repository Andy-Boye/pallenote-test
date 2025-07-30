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
  deletedAt?: string; // when notebook was moved to recycle bin
}

// Note
export interface Note {
  id: string;
  title: string;
  content: string;
  notebookId: string;
  date: string;
  userId?: string; // User who owns the note
  createdAt: string; // date only string
  updatedAt?: string;
  deletedAt?: string; // when note was moved to recycle bin
}

// SharedNote
export type AccessType = "Viewer" | "Editor";
export interface SharedNote {
  id: string;
  noteId: string;
  noteTitle: string;
  ownerId: string;
  ownerEmail: string;
  recipientEmail: string;
  accessType: AccessType;
  shareUrl: string;
  shareId: string;
  sharedAt: string;
  isActive: boolean;
}

// Sharing History Record
export interface SharingRecord {
  id: string;
  noteId: string;
  noteTitle: string;
  senderId: string;
  senderEmail: string;
  recipientEmail: string;
  accessType: AccessType;
  shareUrl: string;
  shareId: string;
  sharedAt: string;
  status: 'sent' | 'received';
  isActive: boolean;
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