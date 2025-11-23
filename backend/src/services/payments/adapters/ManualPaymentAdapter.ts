/**
 * Manual Payment Adapter
 * Implementación para pagos manuales (efectivo, transferencia, comprobantes)
 */

import { IPaymentAdapter } from '../PaymentAdapter';
import {
  PaymentIntent,
  PaymentResult,
  RefundResult,
  PaymentStatus,
  CreatePaymentParams,
  ConfirmPaymentParams,
  RefundPaymentParams,
  PaymentProvider
} from '../types';

export class ManualPaymentAdapter implements IPaymentAdapter {
  private providerName = 'Manual Payment';

  isConfigured(): boolean {
    // El sistema manual siempre está disponible
    return true;
  }

  getProviderName(): string {
    return this.providerName;
  }

  async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
    // Para pagos manuales, no creamos un intent real
    // Simplemente retornamos un intent "pendiente" que requiere confirmación manual
    return {
      id: `manual_${Date.now()}_${params.reservationId}`,
      amount: params.amount,
      currency: params.currency,
      status: 'pending',
      metadata: {
        reservationId: params.reservationId,
        userId: params.userId,
        paymentMethod: params.paymentMethod,
        ...params.metadata
      },
      paymentMethod: params.paymentMethod,
      provider: PaymentProvider.MANUAL
    };
  }

  async confirmPayment(params: ConfirmPaymentParams): Promise<PaymentResult> {
    // Para pagos manuales, la confirmación se hace manualmente por el administrador
    // Este método se usa cuando se actualiza el estado desde el dashboard
    return {
      success: true,
      paymentId: params.paymentId,
      status: 'succeeded',
      message: 'Pago confirmado manualmente',
      metadata: params.metadata
    };
  }

  async refundPayment(params: RefundPaymentParams): Promise<RefundResult> {
    // Los reembolsos manuales también se procesan manualmente
    return {
      success: true,
      amount: params.amount || 0,
      status: 'succeeded',
      message: 'Reembolso procesado manualmente'
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    // Para pagos manuales, el estado se obtiene de la base de datos
    // Este método puede ser sobrescrito por el PaymentService
    return {
      paymentId,
      status: 'pending',
      amount: 0,
      currency: 'PEN'
    };
  }
}

