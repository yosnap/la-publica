import { Request } from 'express';

/**
 * Define la estructura del payload decodificado de un JSON Web Token.
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin' | 'colaborador' | 'editor';
  iat: number;
  exp: number;
}

/**
 * Extiende la interfaz de Request de Express para incluir
 * el payload del usuario autenticado.
 */
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Tipos globales para La Pública Backend

export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  profile: UserProfile;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  location?: {
    city: string;
    country: string;
    coordinates?: [number, number];
  };
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  preferences: {
    notifications: NotificationPreferences;
    privacy: PrivacySettings;
  };
}

export enum UserRole {
  USER = 'user',
  COMPANY = 'company',
  COLABORADOR = 'colaborador',
  EDITOR = 'editor',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

export interface NotificationPreferences {
  email: {
    newMessages: boolean;
    groupActivity: boolean;
    offers: boolean;
    marketing: boolean;
  };
  push: {
    newMessages: boolean;
    mentions: boolean;
    groupActivity: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showLocation: boolean;
  allowMessages: 'everyone' | 'friends' | 'none';
}

export interface Company {
  _id: string;
  owner: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  category: string;
  size: CompanySize;
  website?: string;
  email: string;
  phone?: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: [number, number];
  };
  verified: {
    status: VerificationStatus;
    verifiedAt?: Date;
    documents?: string[];
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  stats: {
    employees?: number;
    founded?: number;
    revenue?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export enum CompanySize {
  STARTUP = 'startup',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise'
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export interface UserOffer {
  _id: string;
  seller: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price: {
    amount: number;
    currency: string;
    type: PriceType;
  };
  images?: string[];
  location?: {
    city: string;
    country: string;
    allowRemote: boolean;
  };
  availability: {
    status: OfferStatus;
    startDate?: Date;
    endDate?: Date;
  };
  delivery: {
    type: DeliveryType;
    timeframe: string;
  };
  requirements?: string[];
  tags?: string[];
  stats: {
    views: number;
    interests: string[];
    contacts: number;
  };
  reviews: OfferReview[];
  createdAt: Date;
  updatedAt: Date;
}

export enum PriceType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  DAILY = 'daily',
  PROJECT = 'project',
  NEGOTIABLE = 'negotiable'
}

export enum OfferStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CLOSED = 'closed',
  EXPIRED = 'expired'
}

export enum DeliveryType {
  DIGITAL = 'digital',
  PHYSICAL = 'physical',
  SERVICE = 'service',
  HYBRID = 'hybrid'
}

export interface OfferReview {
  _id: string;
  reviewer: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface Advertisement {
  _id: string;
  advertiser: string;
  title: string;
  description: string;
  category: string;
  type: AdType;
  content: {
    images?: string[];
    video?: string;
    cta: {
      text: string;
      url?: string;
      action: CTAAction;
    };
  };
  targeting: {
    location?: {
      cities: string[];
      countries: string[];
    };
    demographics?: {
      ageRange?: [number, number];
      interests?: string[];
    };
    budget: {
      total: number;
      daily: number;
      bidType: BidType;
    };
  };
  campaign: {
    startDate: Date;
    endDate: Date;
    status: CampaignStatus;
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    spent: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export enum AdType {
  OFFER = 'offer',
  DEMAND = 'demand'
}

export enum CTAAction {
  VISIT_WEBSITE = 'visit_website',
  CONTACT = 'contact',
  LEARN_MORE = 'learn_more',
  SIGN_UP = 'sign_up',
  DOWNLOAD = 'download'
}

export enum BidType {
  CPM = 'cpm',
  CPC = 'cpc',
  CPA = 'cpa'
}

export enum CampaignStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Consultation {
  _id: string;
  consultant: string;
  client?: string;
  title: string;
  description: string;
  category: string;
  pricing: {
    hourlyRate: number;
    currency: string;
    sessionDuration: number;
  };
  availability: {
    schedule: ScheduleSlot[];
    timezone: string;
  };
  session?: {
    scheduledDate: Date;
    duration: number;
    meetingUrl?: string;
    status: SessionStatus;
    recording?: string;
    notes?: string;
  };
  payment?: {
    amount: number;
    status: PaymentStatus;
    stripeSessionId?: string;
    paidAt?: Date;
  };
  reviews: ConsultationReview[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  available: boolean;
}

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface ConsultationReview {
  _id: string;
  reviewer: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// Respuestas de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
