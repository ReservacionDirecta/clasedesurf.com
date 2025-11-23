/**
 * Payment Service Types
 * Definiciones de tipos para el sistema de pagos modular
 */

export enum PaymentProvider {
  MANUAL = 'MANUAL',
  STRIPE = 'STRIPE',
  MERCADOPAGO = 'MERCADOPAGO',
  CULQI = 'CULQI',
  IZIPAY = 'IZIPAY',
  NIUBIZ = 'NIUBIZ',
  YAPE = 'YAPE',
  PLIN = 'PLIN'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  YAPE = 'YAPE',
  PLIN = 'PLIN',
  QR_CODE = 'QR_CODE',
  PAYPAL = 'PAYPAL',
  MERCADOPAGO = 'MERCADOPAGO'
}

export interface PaymentIntent {
  id: string;
  clientSecret?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  metadata?: Record<string, any>;
  paymentMethod?: PaymentMethod;
  provider: PaymentProvider;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  transactionId?: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  message?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount: number;
  status: 'succeeded' | 'failed' | 'pending';
  message?: string;
  error?: string;
}

export interface PaymentStatus {
  paymentId: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  amount: number;
  currency: string;
  paidAt?: Date;
  metadata?: Record<string, any>;
}

export interface PaymentConfig {
  provider: PaymentProvider;
  enabled: boolean;
  apiKey?: string;
  secretKey?: string;
  publicKey?: string;
  webhookSecret?: string;
  testMode?: boolean;
  [key: string]: any; // Para configuraciones específicas de cada proveedor
}

export interface CreatePaymentParams {
  amount: number;
  currency: string;
  reservationId: number;
  userId: number;
  paymentMethod: PaymentMethod;
  metadata?: Record<string, any>;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface ConfirmPaymentParams {
  paymentId: string;
  paymentIntentId?: string;
  metadata?: Record<string, any>;
}

export interface RefundPaymentParams {
  paymentId: string;
  amount?: number;
  reason?: string;
}

