/**
 * PayMongo API Service
 * Main service class that combines payment intent and payment method services
 */

import { PaymentAmount, PaymentConfig, PaymentMetadata, PaymentResult } from '../types/payment';
import { PaymentMethodOption, PaymentMethodType } from '../types/paymentMethod';
import { PaymentIntentService } from './paymentIntent';
import { PaymentMethodService } from './paymentMethod';

/**
 * Main PayMongo Service Class
 */
export class PayMongoService {
  private paymentIntentService: PaymentIntentService;
  private paymentMethodService: PaymentMethodService;
  private config: PaymentConfig;

  constructor(config: PaymentConfig & { secretKey: string }) {
    // Validate API keys
    if (!config.publicKey || !config.publicKey.startsWith('pk_')) {
      throw new Error('Invalid or missing PayMongo public key. Expected format: pk_test_... or pk_live_...');
    }
    
    if (!config.secretKey || !config.secretKey.startsWith('sk_')) {
      throw new Error('Invalid or missing PayMongo secret key. Expected format: sk_test_... or sk_live_...');
    }

    this.config = config;
    this.paymentIntentService = new PaymentIntentService(config.secretKey, config.publicKey);
    this.paymentMethodService = new PaymentMethodService(config.publicKey);
  }

  /**
   * Initialize a payment flow
   */
  async initializePayment(
    amount: PaymentAmount,
    metadata?: PaymentMetadata
  ): Promise<PaymentResult> {
    return await this.paymentIntentService.createPaymentIntent({
      amount: amount.value,
      currency: amount.currency,
      payment_method_allowed: ['gcash', 'paymaya', 'grab_pay', 'card', 'billease', 'dob'],
      payment_method_options: {
        card: {
          request_three_d_secure: 'any'
        }
      },
      description: `Car rental payment - ${metadata?.bookingId || 'Unknown'}`,
      statement_descriptor: 'AutoGo Car Rental',
      metadata: metadata ? {
        booking_id: metadata.bookingId || '',
        user_id: metadata.userId || '',
        car_id: metadata.carId || '',
        rental_days: metadata.rentalDays?.toString() || '0'
      } : undefined,
      capture_type: 'automatic'
    });
  }

  /**
   * Process payment with selected method
   */
  async processPayment(
    paymentIntentId: string,
    paymentMethodId: string,
    returnUrl?: string
  ): Promise<PaymentResult> {
    return await this.paymentIntentService.attachPaymentMethod(paymentIntentId, {
      payment_method: paymentMethodId,
      client_key: this.config.publicKey,
      return_url: returnUrl || this.config.returnUrl
    });
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentResult> {
    return await this.paymentIntentService.getPaymentIntent(paymentIntentId);
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentIntentId: string): Promise<PaymentResult> {
    return await this.paymentIntentService.cancelPaymentIntent(paymentIntentId);
  }

  /**
   * Get available payment methods for amount
   */
  getAvailablePaymentMethods(amount: number): PaymentMethodOption[] {
    return this.paymentMethodService.getEnabledPaymentMethods(amount);
  }

  /**
   * Calculate fees for payment method
   */
  calculatePaymentFees(paymentType: PaymentMethodType, amount: number): number {
    const methods = this.paymentMethodService.getPaymentMethodOptions();
    const method = methods.find(m => m.type === paymentType);
    
    if (!method) return 0;
    
    return this.paymentMethodService.calculateFees(method, amount);
  }

  /**
   * Get total amount including fees
   */
  getTotalAmount(baseAmount: number, paymentType: PaymentMethodType): number {
    const fees = this.calculatePaymentFees(paymentType, baseAmount);
    return baseAmount + fees;
  }
}

// Export individual services
export { PaymentIntentService } from './paymentIntent';
export { PaymentMethodService } from './paymentMethod';

