/**
 * Payment Factory
 * Factory pattern para crear y gestionar adapters de pago
 */

import { IPaymentAdapter } from './PaymentAdapter';
import { PaymentProvider, PaymentMethod } from './types';
import { ManualPaymentAdapter } from './adapters/ManualPaymentAdapter';
import { StripePaymentAdapter } from './adapters/StripePaymentAdapter';
import { MercadoPagoPaymentAdapter } from './adapters/MercadoPagoPaymentAdapter';

export class PaymentFactory {
  private static adapters: Map<PaymentProvider, IPaymentAdapter> = new Map();

  /**
   * Obtiene el adapter apropiado según el método de pago
   */
  static getAdapter(paymentMethod: PaymentMethod, provider?: PaymentProvider): IPaymentAdapter {
    // Si se especifica un proveedor, intentar usarlo
    if (provider && provider !== PaymentProvider.MANUAL) {
      const adapter = this.getAdapterByProvider(provider);
      if (adapter && adapter.isConfigured()) {
        return adapter;
      }
      // Si el proveedor no está configurado, hacer fallback a manual
      console.warn(`[PaymentFactory] Provider ${provider} no está configurado. Usando manual.`);
    }

    // Determinar proveedor según método de pago
    const suggestedProvider = this.suggestProvider(paymentMethod);
    if (suggestedProvider) {
      const adapter = this.getAdapterByProvider(suggestedProvider);
      if (adapter && adapter.isConfigured()) {
        return adapter;
      }
    }

    // Fallback a manual siempre disponible
    return this.getAdapterByProvider(PaymentProvider.MANUAL);
  }

  /**
   * Obtiene un adapter específico por proveedor
   */
  static getAdapterByProvider(provider: PaymentProvider): IPaymentAdapter {
    // Usar cache si existe
    if (this.adapters.has(provider)) {
      return this.adapters.get(provider)!;
    }

    // Crear nuevo adapter
    let adapter: IPaymentAdapter;

    switch (provider) {
      case PaymentProvider.STRIPE:
        adapter = new StripePaymentAdapter();
        break;
      case PaymentProvider.MERCADOPAGO:
        adapter = new MercadoPagoPaymentAdapter();
        break;
      case PaymentProvider.MANUAL:
      default:
        adapter = new ManualPaymentAdapter();
        break;
    }

    // Cachear el adapter
    this.adapters.set(provider, adapter);
    return adapter;
  }

  /**
   * Sugiere un proveedor según el método de pago
   */
  private static suggestProvider(paymentMethod: PaymentMethod): PaymentProvider | null {
    switch (paymentMethod) {
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.DEBIT_CARD:
        // Priorizar Stripe, luego MercadoPago
        if (this.getAdapterByProvider(PaymentProvider.STRIPE).isConfigured()) {
          return PaymentProvider.STRIPE;
        }
        if (this.getAdapterByProvider(PaymentProvider.MERCADOPAGO).isConfigured()) {
          return PaymentProvider.MERCADOPAGO;
        }
        return null;
      case PaymentMethod.MERCADOPAGO:
        return PaymentProvider.MERCADOPAGO;
      case PaymentMethod.CASH:
      case PaymentMethod.BANK_TRANSFER:
      case PaymentMethod.YAPE:
      case PaymentMethod.PLIN:
      default:
        return PaymentProvider.MANUAL;
    }
  }

  /**
   * Lista todos los proveedores disponibles y configurados
   */
  static getAvailableProviders(): Array<{ provider: PaymentProvider; name: string; configured: boolean }> {
    const providers: PaymentProvider[] = [
      PaymentProvider.MANUAL,
      PaymentProvider.STRIPE,
      PaymentProvider.MERCADOPAGO,
      PaymentProvider.CULQI,
      PaymentProvider.IZIPAY,
      PaymentProvider.NIUBIZ
    ];

    return providers.map(provider => {
      const adapter = this.getAdapterByProvider(provider);
      return {
        provider,
        name: adapter.getProviderName(),
        configured: adapter.isConfigured()
      };
    });
  }

  /**
   * Limpia el cache de adapters (útil para testing o recarga de configuración)
   */
  static clearCache(): void {
    this.adapters.clear();
  }
}

