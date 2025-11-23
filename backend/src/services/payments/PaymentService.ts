/**
 * Payment Service
 * Servicio centralizado para gestionar pagos usando el factory pattern
 */

import prisma from '../../prisma';
import { PaymentFactory } from './PaymentFactory';
import {
  CreatePaymentParams,
  ConfirmPaymentParams,
  RefundPaymentParams,
  PaymentProvider,
  PaymentMethod,
  PaymentResult
} from './types';

export class PaymentService {
  /**
   * Crea un intent de pago
   */
  static async createPaymentIntent(
    params: CreatePaymentParams,
    provider?: PaymentProvider
  ) {
    const adapter = PaymentFactory.getAdapter(params.paymentMethod, provider);
    return await adapter.createPaymentIntent(params);
  }

  /**
   * Confirma un pago
   */
  static async confirmPayment(
    params: ConfirmPaymentParams,
    provider?: PaymentProvider
  ): Promise<PaymentResult> {
    // Obtener el pago de la base de datos para determinar el proveedor
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(params.paymentId) },
      include: { reservation: true }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Determinar proveedor desde el paymentMethod o metadata
    const paymentMethod = payment.paymentMethod as PaymentMethod;
    const adapter = PaymentFactory.getAdapter(paymentMethod, provider);

    // Confirmar pago con el adapter
    const result = await adapter.confirmPayment(params);

    // Si el pago fue exitoso, actualizar en la base de datos
    if (result.success && result.status === 'succeeded') {
      await prisma.payment.update({
        where: { id: parseInt(params.paymentId) },
        data: {
          status: 'PAID',
          transactionId: result.transactionId || payment.transactionId,
          paidAt: new Date()
        }
      });

      // Actualizar estado de la reserva
      await prisma.reservation.update({
        where: { id: payment.reservationId },
        data: { status: 'PAID' }
      });
    }

    return result;
  }

  /**
   * Procesa un reembolso
   */
  static async refundPayment(
    params: RefundPaymentParams,
    provider?: PaymentProvider
  ) {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(params.paymentId) }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    const paymentMethod = payment.paymentMethod as PaymentMethod;
    const adapter = PaymentFactory.getAdapter(paymentMethod, provider);

    const result = await adapter.refundPayment({
      ...params,
      amount: params.amount || payment.amount
    });

    // Si el reembolso fue exitoso, actualizar en la base de datos
    if (result.success) {
      await prisma.payment.update({
        where: { id: parseInt(params.paymentId) },
        data: { status: 'REFUNDED' }
      });

      // Actualizar estado de la reserva
      await prisma.reservation.update({
        where: { id: payment.reservationId },
        data: { status: 'CANCELED' }
      });
    }

    return result;
  }

  /**
   * Obtiene el estado de un pago
   */
  static async getPaymentStatus(paymentId: string, provider?: PaymentProvider) {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(paymentId) }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Si es un pago manual, obtener estado de la BD
    if (payment.paymentMethod === 'CASH' || payment.paymentMethod === 'BANK_TRANSFER') {
      return {
        paymentId: payment.id.toString(),
        status: payment.status.toLowerCase() as any,
        amount: payment.amount,
        currency: 'PEN',
        paidAt: payment.paidAt || undefined
      };
    }

    // Para pagos online, consultar con el adapter
    const paymentMethod = payment.paymentMethod as PaymentMethod;
    const adapter = PaymentFactory.getAdapter(paymentMethod, provider);

    if (adapter.isConfigured() && payment.transactionId) {
      return await adapter.getPaymentStatus(payment.transactionId);
    }

    // Fallback a estado de BD
    return {
      paymentId: payment.id.toString(),
      status: payment.status.toLowerCase() as any,
      amount: payment.amount,
      currency: 'PEN',
      paidAt: payment.paidAt || undefined
    };
  }

  /**
   * Lista proveedores disponibles
   */
  static getAvailableProviders() {
    return PaymentFactory.getAvailableProviders();
  }
}

