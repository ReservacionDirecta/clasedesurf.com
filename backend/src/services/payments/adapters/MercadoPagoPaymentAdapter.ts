/**
 * MercadoPago Payment Adapter
 * Implementación para integración con MercadoPago
 * NOTA: Requiere configuración de API keys para funcionar
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

export class MercadoPagoPaymentAdapter implements IPaymentAdapter {
  private providerName = 'MercadoPago';
  private mercadopago: any = null;
  private configured: boolean = false;

  constructor() {
    // Intentar inicializar MercadoPago si las keys están configuradas
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (accessToken) {
      try {
        // Importación dinámica para evitar errores si el paquete no está instalado
        // Cuando se implemente, instalar: npm install mercadopago
        // const { MercadoPagoConfig, Preference } = require('mercadopago');
        // const client = new MercadoPagoConfig({ accessToken });
        // this.mercadopago = { Preference: new Preference(client) };
        this.configured = true;
        console.log('[MercadoPagoAdapter] Configurado correctamente');
      } catch (error) {
        console.warn('[MercadoPagoAdapter] Error al inicializar:', error);
        this.configured = false;
      }
    } else {
      console.warn('[MercadoPagoAdapter] MERCADOPAGO_ACCESS_TOKEN no configurada. Usando modo stub.');
      this.configured = false;
    }
  }

  isConfigured(): boolean {
    return this.configured && !!process.env.MERCADOPAGO_ACCESS_TOKEN;
  }

  getProviderName(): string {
    return this.providerName;
  }

  async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
    if (!this.isConfigured()) {
      throw new Error('MercadoPago no está configurado. Configure MERCADOPAGO_ACCESS_TOKEN en las variables de entorno.');
    }

    // TODO: Implementar cuando se instale el paquete de MercadoPago
    // const preference = await this.mercadopago.Preference.create({
    //   body: {
    //     items: [{
    //       title: `Reserva #${params.reservationId}`,
    //       quantity: 1,
    //       unit_price: params.amount
    //     }],
    //     back_urls: {
    //       success: params.returnUrl || `${process.env.FRONTEND_URL}/reservations/confirmation?success=true`,
    //       failure: params.cancelUrl || `${process.env.FRONTEND_URL}/reservations/confirmation?success=false`,
    //       pending: params.returnUrl || `${process.env.FRONTEND_URL}/reservations/confirmation?success=pending`
    //     },
    //     metadata: {
    //       reservation_id: params.reservationId.toString(),
    //       user_id: params.userId.toString()
    //     }
    //   }
    // });

    // Por ahora, retornar un stub
    return {
      id: `mp_preference_${Date.now()}`,
      clientSecret: 'stub_preference_id',
      amount: params.amount,
      currency: params.currency,
      status: 'pending',
      metadata: {
        ...params.metadata,
        init_point: 'stub_init_point_url'
      },
      paymentMethod: params.paymentMethod,
      provider: PaymentProvider.MERCADOPAGO
    };
  }

  async confirmPayment(params: ConfirmPaymentParams): Promise<PaymentResult> {
    if (!this.isConfigured()) {
      throw new Error('MercadoPago no está configurado.');
    }

    // TODO: Implementar cuando se instale el paquete de MercadoPago
    // const payment = await this.mercadopago.Payment.get({ id: params.paymentId });
    // if (payment.status === 'approved') {
    //   return {
    //     success: true,
    //     paymentId: payment.id.toString(),
    //     transactionId: payment.transaction_amount?.toString(),
    //     status: 'succeeded',
    //     metadata: payment.metadata
    //   };
    // }

    // Stub por ahora
    return {
      success: false,
      paymentId: params.paymentId,
      status: 'pending',
      message: 'MercadoPago adapter no implementado completamente. Configure las API keys e instale el paquete mercadopago.'
    };
  }

  async refundPayment(params: RefundPaymentParams): Promise<RefundResult> {
    if (!this.isConfigured()) {
      throw new Error('MercadoPago no está configurado.');
    }

    // TODO: Implementar cuando se instale el paquete de MercadoPago
    // const refund = await this.mercadopago.Refund.create({
    //   payment_id: params.paymentId,
    //   amount: params.amount
    // });

    // Stub por ahora
    return {
      success: false,
      amount: params.amount || 0,
      status: 'pending',
      message: 'MercadoPago adapter no implementado completamente.'
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    if (!this.isConfigured()) {
      throw new Error('MercadoPago no está configurado.');
    }

    // TODO: Implementar cuando se instale el paquete de MercadoPago
    // const payment = await this.mercadopago.Payment.get({ id: paymentId });
    // return {
    //   paymentId: payment.id.toString(),
    //   status: this.mapMercadoPagoStatus(payment.status),
    //   amount: payment.transaction_amount || 0,
    //   currency: payment.currency_id?.toUpperCase() || 'PEN',
    //   paidAt: payment.date_approved ? new Date(payment.date_approved) : undefined,
    //   metadata: payment.metadata
    // };

    // Stub por ahora
    return {
      paymentId,
      status: 'pending',
      amount: 0,
      currency: 'PEN'
    };
  }

  // Helper para mapear estados de MercadoPago
  private mapMercadoPagoStatus(mpStatus: string): 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded' {
    const statusMap: Record<string, 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded'> = {
      'pending': 'pending',
      'approved': 'succeeded',
      'authorized': 'pending',
      'in_process': 'pending',
      'in_mediation': 'pending',
      'rejected': 'failed',
      'cancelled': 'canceled',
      'refunded': 'refunded',
      'charged_back': 'refunded'
    };
    return statusMap[mpStatus] || 'pending';
  }
}

