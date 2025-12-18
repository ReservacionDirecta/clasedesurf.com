// types/index.ts
export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  age?: number;
  weight?: number;
  height?: number;
  canSwim: boolean;
  injuries?: string;
  phone?: string;
}

export interface BulkClassOccurrence {
  date: string;
  time: string;
}

export interface BulkClassBaseData {
  title: string;
  description?: string;
  duration: number;
  capacity: number;
  price: number;
  level: ClassLevel;
  instructor?: string;
  studentDetails?: string;
}

export interface BulkClassRequest {
  baseData: BulkClassBaseData;
  occurrences: BulkClassOccurrence[];
  schoolId?: number;
}
export interface Class {
  id: number;
  title: string;
  description?: string;
  date: string | Date;
  duration: number;
  capacity: number;
  price: number;
  level: ClassLevel;
  instructor?: string;
  schoolId: number;
  school?: School;
  availableSpots?: number;
  images?: string[];
  paymentInfo?: {
    totalReservations: number;
    paidReservations: number;
    totalRevenue: number;
    occupancyRate: number;
  };
  beach?: Beach;
  beachId?: number;
  reservations?: any[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  isRecurring?: boolean;
  recurrencePattern?: {
    days: number[];
    times: string[];
  };
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface Beach {
  id: number;
  name: string;
  location?: string;
}
export interface Reservation {
  id: number;
  userId: number;
  classId: number;
  user?: User;
  class?: Class;
  status: ReservationStatus;
  specialRequest?: string;
  payment?: Payment;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
export interface CreateReservationData {
  classId: number;
  specialRequest?: string;
}
export interface UpdateProfileData {
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  canSwim?: boolean;
  injuries?: string;
  phone?: string;
}
export type UserRole = 'STUDENT' | 'ADMIN' | 'SCHOOL_ADMIN' | 'INSTRUCTOR';
export type ClassLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELED' | 'COMPLETED';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';
export interface School {
  id: number;
  name: string;
  location: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  address?: string;
  logo?: string;
  coverImage?: string;
  ownerId?: number;
  classes?: Class[];
  instructors?: any[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  rating?: number;
  totalReviews?: number;
  foundedYear?: number;
}

export interface Payment {
  id: number;
  reservationId: number;
  reservation?: Reservation;
  amount: number;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentProvider?: PaymentProvider;
  transactionId?: string;
  externalTransactionId?: string;
  voucherImage?: string;
  voucherNotes?: string;
  bankAccount?: string;
  referenceNumber?: string;
  qrCode?: string;
  paymentInstructions?: string;
  paidAt?: string | Date;
  expiresAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'YAPE'
  | 'PLIN'
  | 'QR_CODE'
  | 'PAYPAL'
  | 'STRIPE'
  | 'MERCADOPAGO'
  | 'CULQI'
  | 'IZIPAY'
  | 'NIUBIZ'
  | 'PAYU';

export type PaymentProvider =
  | 'STRIPE'
  | 'PAYPAL'
  | 'MERCADOPAGO'
  | 'PAYU'
  | 'CULQI'
  | 'IZIPAY'
  | 'NIUBIZ'
  | 'YAPE'
  | 'PLIN'
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'MANUAL';

export interface PaymentConfig {
  id: number;
  provider: PaymentProvider;
  isActive: boolean;
  config: Record<string, any>;
  displayName: string;
  description?: string;
  logo?: string;
  supportedMethods: PaymentMethod[];
  fees: {
    percentage?: number;
    fixed?: number;
    currency: string;
  };
  minimumAmount?: number;
  maximumAmount?: number;
  processingTime?: string;
  instructions?: string;
}

export interface Instructor {
  id: number;
  userId: number;
  schoolId: number;
  user?: User;
  school?: School;
  bio?: string;
  yearsExperience: number;
  specialties: string[];
  certifications: string[];
  rating: number;
  totalReviews: number;
  profileImage?: string;
  instructorRole?: 'INSTRUCTOR' | 'HEAD_COACH';
  isActive: boolean;
  reviews?: InstructorReview[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface InstructorReview {
  id: number;
  instructorId: number;
  instructor?: Instructor;
  studentName: string;
  rating: number;
  comment?: string;
  createdAt?: string | Date;
}

export interface DiscountCode {
  id: number;
  code: string;
  description?: string;
  discountPercentage: number;
  validFrom: string | Date;
  validTo: string | Date;
  isActive: boolean;
  maxUses?: number;
  usedCount: number;
  schoolId?: number;
  school?: School;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
