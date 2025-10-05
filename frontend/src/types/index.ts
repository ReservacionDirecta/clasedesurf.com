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
export interface Class {
  id: number;
  title: string;
  description?: string;
  date: Date;
  duration: number;
  capacity: number;
  price: number;
  level: ClassLevel;
  school: School;
  availableSpots: number;
}
export interface Reservation {
  id: number;
  user: User;
  class: Class;
  status: ReservationStatus;
  specialRequest?: string;
  payment?: Payment;
  createdAt: Date;
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
export type UserRole = 'STUDENT' | 'ADMIN' | 'SCHOOL_ADMIN';
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
    classes: Class[];
  }
  
  export interface Payment {
    id: number;
    reservationId: number;
    amount: number;
    status: PaymentStatus;
    paymentMethod?: string;
    transactionId?: string;
    paidAt?: Date;
  }
  