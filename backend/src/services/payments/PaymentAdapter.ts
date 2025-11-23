/**
 * Payment Adapter Interface
 * Define la interfaz que todos los adapters de pago deben implementar
 */

import {
  PaymentIntent,
  PaymentResult,
  RefundResult,
  PaymentStatus,
  CreatePaymentParams,
  ConfirmPaymentParams,
  RefundPaymentParams
} from './types';

export interface IPaymentAdapter {
  /**
   * Crea un intent de pago (para pagos online)
   */
  createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent>;

  /**
   * Confirma un pago pendiente
   */
  confirmPayment(params: ConfirmPaymentParams): Promise<PaymentResult>;

  /**
   * Reembolsa un pago
   */
  refundPayment(params: RefundPaymentParams): Promise<RefundResult>;

  /**
   * Obtiene el estado actual de un pago
   */
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;

  /**
   * Verifica si el adapter está configurado y disponible
   */
  isConfigured(): boolean;

  /**
   * Obtiene el nombre del proveedor
   */
  getProviderName(): string;
}

