/**
 * Stripe Payment Adapter
 * Implementación para integración con Stripe
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

export class StripePaymentAdapter implements IPaymentAdapter {
  private providerName = 'Stripe';
  private stripe: any = null;
  private configured: boolean = false;

  constructor() {
    // Intentar inicializar Stripe si las keys están configuradas
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey) {
      try {
        // Importación dinámica para evitar errores si el paquete no está instalado
        // Cuando se implemente, instalar: npm install stripe
        // this.stripe = require('stripe')(secretKey);
        this.configured = true;
        console.log('[StripeAdapter] Configurado correctamente');
      } catch (error) {
        console.warn('[StripeAdapter] Error al inicializar:', error);
        this.configured = false;
      }
    } else {
      console.warn('[StripeAdapter] STRIPE_SECRET_KEY no configurada. Usando modo stub.');
      this.configured = false;
    }
  }

  isConfigured(): boolean {
    return this.configured && !!process.env.STRIPE_SECRET_KEY;
  }

  getProviderName(): string {
    return this.providerName;
  }

  async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
    if (!this.isConfigured()) {
      throw new Error('Stripe no está configurado. Configure STRIPE_SECRET_KEY en las variables de entorno.');
    }

    // TODO: Implementar cuando se instale el paquete de Stripe
    // const intent = await this.stripe.paymentIntents.create({
    //   amount: Math.round(params.amount * 100), // Stripe usa centavos
    //   currency: params.currency.toLowerCase(),
    //   metadata: {
    //     reservationId: params.reservationId.toString(),
    //     userId: params.userId.toString(),
    //     ...params.metadata
    //   }
    // });

    // Por ahora, retornar un stub
    return {
      id: `stripe_intent_${Date.now()}`,
      clientSecret: 'stub_client_secret',
      amount: params.amount,
      currency: params.currency,
      status: 'pending',
      metadata: params.metadata,
      paymentMethod: params.paymentMethod,
      provider: PaymentProvider.STRIPE
    };
  }

  async confirmPayment(params: ConfirmPaymentParams): Promise<PaymentResult> {
    if (!this.isConfigured()) {
      throw new Error('Stripe no está configurado.');
    }

    // TODO: Implementar cuando se instale el paquete de Stripe
    // const intent = await this.stripe.paymentIntents.retrieve(params.paymentIntentId);
    // if (intent.status === 'succeeded') {
    //   return {
    //     success: true,
    //     paymentId: intent.id,
    //     transactionId: intent.id,
    //     status: 'succeeded',
    //     metadata: intent.metadata
    //   };
    // }

    // Stub por ahora
    return {
      success: false,
      paymentId: params.paymentId,
      status: 'pending',
      message: 'Stripe adapter no implementado completamente. Configure las API keys e instale el paquete stripe.'
    };
  }

  async refundPayment(params: RefundPaymentParams): Promise<RefundResult> {
    if (!this.isConfigured()) {
      throw new Error('Stripe no está configurado.');
    }

    // TODO: Implementar cuando se instale el paquete de Stripe
    // const refund = await this.stripe.refunds.create({
    //   payment_intent: params.paymentId,
    //   amount: params.amount ? Math.round(params.amount * 100) : undefined,
    //   reason: params.reason
    // });

    // Stub por ahora
    return {
      success: false,
      amount: params.amount || 0,
      status: 'pending',
      message: 'Stripe adapter no implementado completamente.'
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    if (!this.isConfigured()) {
      throw new Error('Stripe no está configurado.');
    }

    // TODO: Implementar cuando se instale el paquete de Stripe
    // const intent = await this.stripe.paymentIntents.retrieve(paymentId);
    // return {
    //   paymentId: intent.id,
    //   status: this.mapStripeStatus(intent.status),
    //   amount: intent.amount / 100,
    //   currency: intent.currency.toUpperCase(),
    //   paidAt: intent.status === 'succeeded' ? new Date(intent.created * 1000) : undefined,
    //   metadata: intent.metadata
    // };

    // Stub por ahora
    return {
      paymentId,
      status: 'pending',
      amount: 0,
      currency: 'PEN'
    };
  }

  // Helper para mapear estados de Stripe
  private mapStripeStatus(stripeStatus: string): 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded' {
    const statusMap: Record<string, 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded'> = {
      'requires_payment_method': 'pending',
      'requires_confirmation': 'pending',
      'requires_action': 'pending',
      'processing': 'pending',
      'succeeded': 'succeeded',
      'canceled': 'canceled',
      'requires_capture': 'pending'
    };
    return statusMap[stripeStatus] || 'pending';
  }
}

