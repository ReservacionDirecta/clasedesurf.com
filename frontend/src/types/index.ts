// Core type definitions for the SurfSchool Booking Platform
// These types extend and complement the Prisma-generated types

import type {
  User as PrismaUser,
  School as PrismaSchool,
  Class as PrismaClass,
  Reservation as PrismaReservation,
  Payment as PrismaPayment,
  Review as PrismaReview,
  Equipment as PrismaEquipment,
  Role,
  SchoolRole,
  Level,
  SwimmingLevel,
  ClassType,
  ReservationStatus,
  PaymentStatus,
  PaymentMethod,
  EquipmentType,
  EquipmentCondition
} from '@prisma/client'

// ============================================================================
// EXTENDED USER TYPES
// ============================================================================

export interface UserProfile extends PrismaUser {
  _count?: {
    reservations: number
    reviews: number
  }
}

export interface UserWithReservations extends PrismaUser {
  reservations: ReservationWithClass[]
}

// ============================================================================
// SCHOOL TYPES
// ============================================================================

export interface SchoolWithStats extends PrismaSchool {
  _count?: {
    classes: number
    members: number
    reviews: number
  }
  averageRating?: number
}

export interface SchoolMember {
  id: string
  schoolId: string
  userId: string
  role: SchoolRole
  isActive: boolean
  joinedAt: Date
  user: PrismaUser
}

// ============================================================================
// CLASS TYPES
// ============================================================================

export interface ClassWithDetails extends PrismaClass {
  school: PrismaSchool
  _count?: {
    reservations: number
  }
  availableSpots?: number
}

export interface ClassWithReservations extends PrismaClass {
  school: PrismaSchool
  reservations: ReservationWithUser[]
}

// ============================================================================
// RESERVATION TYPES
// ============================================================================

export interface ReservationWithClass extends PrismaReservation {
  class: ClassWithDetails
  payments: PrismaPayment[]
}

export interface ReservationWithUser extends PrismaReservation {
  user: PrismaUser
  payments: PrismaPayment[]
}

export interface ReservationWithDetails extends PrismaReservation {
  user: PrismaUser
  class: ClassWithDetails
  payments: PrismaPayment[]
  reviews: PrismaReview[]
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface PaymentWithDetails extends PrismaPayment {
  reservation: ReservationWithClass
  user: PrismaUser
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface ReviewWithDetails extends PrismaReview {
  user: Pick<PrismaUser, 'id' | 'name' | 'image'>
  reservation: {
    class: Pick<PrismaClass, 'id' | 'title' | 'date'>
  }
}

// ============================================================================
// EQUIPMENT TYPES
// ============================================================================

export interface EquipmentWithSchool extends PrismaEquipment {
  school: Pick<PrismaSchool, 'id' | 'name'>
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface UserRegistrationForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface UserLoginForm {
  email: string
  password: string
}

export interface UserProfileForm {
  name: string
  age?: number
  weight?: number
  height?: number
  canSwim: boolean
  swimmingLevel: SwimmingLevel
  injuries?: string
  emergencyContact?: string
  emergencyPhone?: string
}

export interface ClassForm {
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  capacity: number
  price: number
  level: Level
  type: ClassType
  location?: string
  instructorName?: string
  includesBoard: boolean
  includesWetsuit: boolean
  includesInsurance: boolean
  minWaveHeight?: number
  maxWaveHeight?: number
}

export interface ReservationForm {
  classId: string
  participants: number
  specialRequest?: string
}

export interface PaymentForm {
  reservationId: string
  amount: number
  paymentMethod: PaymentMethod
  transactionId?: string
}

export interface ReviewForm {
  reservationId: string
  rating: number
  title?: string
  comment?: string
  instructorRating?: number
  equipmentRating?: number
  locationRating?: number
  valueRating?: number
}

// ============================================================================
// FILTER AND SEARCH TYPES
// ============================================================================

export interface ClassFilters {
  schoolId?: string
  level?: Level
  type?: ClassType
  dateFrom?: Date
  dateTo?: Date
  priceMin?: number
  priceMax?: number
  location?: string
  availableOnly?: boolean
}

export interface ReservationFilters {
  userId?: string
  schoolId?: string
  status?: ReservationStatus
  dateFrom?: Date
  dateTo?: Date
}

export interface PaymentFilters {
  userId?: string
  schoolId?: string
  status?: PaymentStatus
  method?: PaymentMethod
  dateFrom?: Date
  dateTo?: Date
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface StudentDashboardData {
  user: UserProfile
  upcomingReservations: ReservationWithClass[]
  recentReservations: ReservationWithClass[]
  stats: {
    totalReservations: number
    completedClasses: number
    pendingPayments: number
  }
}

export interface AdminDashboardData {
  school: SchoolWithStats
  todayClasses: ClassWithReservations[]
  recentReservations: ReservationWithDetails[]
  stats: {
    totalRevenue: number
    totalReservations: number
    averageRating: number
    occupancyRate: number
  }
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface RevenueAnalytics {
  period: string
  totalRevenue: number
  totalReservations: number
  averageReservationValue: number
  paymentMethods: Record<PaymentMethod, number>
}

export interface ClassAnalytics {
  classId: string
  className: string
  totalReservations: number
  occupancyRate: number
  revenue: number
  averageRating: number
}

export interface SchoolAnalytics {
  schoolId: string
  schoolName: string
  totalClasses: number
  totalReservations: number
  totalRevenue: number
  averageRating: number
  topInstructors: string[]
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SortOrder = 'asc' | 'desc'

export interface SortOptions {
  field: string
  order: SortOrder
}

export interface PaginationOptions {
  page: number
  limit: number
}

// Re-export Prisma enums for convenience
export {
  Role,
  SchoolRole,
  Level,
  SwimmingLevel,
  ClassType,
  ReservationStatus,
  PaymentStatus,
  PaymentMethod,
  EquipmentType,
  EquipmentCondition
}