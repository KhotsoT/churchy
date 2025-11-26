// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImage?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  PASTOR = 'pastor',
  STAFF = 'staff',
  LEADER = 'leader',
  MEMBER = 'member',
  GUEST = 'guest',
}

// Member Types
export interface Member {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: Address;
  profileImage?: string;
  membershipStatus: MembershipStatus;
  joinDate?: Date;
  familyId?: string;
  familyRole?: FamilyRole;
  customFields?: Record<string, any>;
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum MembershipStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  VISITOR = 'visitor',
  MEMBER = 'member',
}

export enum FamilyRole {
  HEAD = 'head',
  SPOUSE = 'spouse',
  CHILD = 'child',
  OTHER = 'other',
}

export interface Family {
  id: string;
  name: string;
  members: string[]; // Member IDs
  address?: Address;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

// Attendance Types
export interface Attendance {
  id: string;
  memberId: string | { id: string; firstName: string; lastName: string };
  eventId: string | { id: string; title: string };
  date: Date;
  status: AttendanceStatus;
  notes?: string;
  checkedInAt?: Date;
  checkedOutAt?: Date;
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  startDate: Date;
  endDate?: Date;
  location?: string;
  organizerId: string | { id: string; firstName: string; lastName: string };
  attendees?: string[]; // Member IDs
  capacity?: number;
  registrationRequired: boolean;
  imageUrl?: string;
  recurring?: RecurringPattern;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum EventType {
  SERVICE = 'service',
  MEETING = 'meeting',
  CLASS = 'class',
  SOCIAL = 'social',
  OUTREACH = 'outreach',
  OTHER = 'other',
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
}

// Donation Types
export interface Donation {
  id: string;
  donorId: string | { id: string; firstName: string; lastName: string };
  amount: number;
  currency: string;
  date: Date;
  type: DonationType;
  method: PaymentMethod;
  fund?: string;
  notes?: string;
  receiptSent: boolean;
  transactionId?: string;
  createdAt: Date;
}

export enum DonationType {
  TITHE = 'tithe',
  OFFERING = 'offering',
  BUILDING = 'building',
  MISSION = 'mission',
  OTHER = 'other',
}

export enum PaymentMethod {
  CASH = 'cash',
  CHECK = 'check',
  CARD = 'card',
  ONLINE = 'online',
  BANK_TRANSFER = 'bank_transfer',
}

// Group Types
export interface Group {
  id: string;
  name: string;
  description?: string;
  type: GroupType;
  leaderId: string | { id: string; firstName: string; lastName: string };
  members: (string | { id: string; firstName: string; lastName: string })[];
  meetingSchedule?: string;
  location?: string;
  imageUrl?: string;
  isActive: boolean;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum GroupType {
  SMALL_GROUP = 'small_group',
  MINISTRY = 'ministry',
  COMMITTEE = 'committee',
  CLASS = 'class',
  OTHER = 'other',
}

// Communication Types
export interface Message {
  id: string;
  senderId: string;
  recipientIds: string[];
  subject: string;
  body: string;
  type: MessageType;
  attachments?: string[];
  readBy?: string[]; // User IDs
  createdAt: Date;
}

export enum MessageType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  targetAudience?: UserRole[];
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
  imageUrl?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Prayer Request Types
export interface PrayerRequest {
  id: string;
  requesterId: string | { id: string; firstName: string; lastName: string };
  title: string;
  description: string;
  category?: string;
  isPublic: boolean;
  status: PrayerStatus;
  prayedBy?: string[]; // User IDs
  createdAt: Date;
  updatedAt: Date;
}

export enum PrayerStatus {
  ACTIVE = 'active',
  ANSWERED = 'answered',
  ARCHIVED = 'archived',
}

// Alias for backwards compatibility
export const PrayerRequestStatus = PrayerStatus;
export type PrayerRequestStatus = PrayerStatus;

// Volunteer Types
export interface Volunteer {
  id: string;
  memberId: string | { id: string; firstName: string; lastName: string };
  role: string;
  ministryId?: string | { id: string; name: string };
  startDate: Date;
  endDate?: Date;
  status: VolunteerStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum VolunteerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
}

// Service Planning Types
export interface ServicePlan {
  id: string;
  serviceDate: Date;
  serviceType: string;
  title?: string;
  orderOfService: ServiceItem[];
  assignedRoles: ServiceRole[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceItem {
  id: string;
  type: ServiceItemType;
  title: string;
  description?: string;
  duration?: number;
  order: number;
  assignedTo?: string[]; // Member IDs
  resources?: string[];
}

export enum ServiceItemType {
  SONG = 'song',
  PRAYER = 'prayer',
  SCRIPTURE = 'scripture',
  SERMON = 'sermon',
  ANNOUNCEMENT = 'announcement',
  OFFERING = 'offering',
  OTHER = 'other',
}

export interface ServiceRole {
  role: string;
  memberId: string;
  notes?: string;
}

// Report Types
export interface Report {
  id: string;
  name: string;
  type: ReportType;
  parameters: Record<string, any>;
  generatedAt: Date;
  generatedBy: string;
  data: any;
}

export enum ReportType {
  ATTENDANCE = 'attendance',
  DONATIONS = 'donations',
  MEMBERSHIP = 'membership',
  EVENTS = 'events',
  CUSTOM = 'custom',
}

// Settings Types
export interface ChurchSettings {
  id: string;
  churchName: string;
  address?: Address;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  customFields?: CustomField[];
  features: FeatureFlags;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  entity: 'member' | 'event' | 'group' | 'donation';
  required: boolean;
  options?: string[];
  defaultValue?: any;
}

export interface FeatureFlags {
  donations: boolean;
  events: boolean;
  groups: boolean;
  messaging: boolean;
  prayerRequests: boolean;
  volunteers: boolean;
  servicePlanning: boolean;
  reports: boolean;
  [key: string]: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Fix for populated fields
export type Populated<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] extends string ? T[P] | { id: string; [key: string]: any } : T[P];
};

