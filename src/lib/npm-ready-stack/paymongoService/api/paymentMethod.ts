/**
 * PayMongo Payment Method API Service
 * Handles payment method creation and management
 */

import {
  PaymentMethodResource,
  PayMongoApiResponse,
  PayMongoErrorResponse
} from '../types/api';
import { PaymentResult } from '../types/payment';
import {
  CreatePaymentMethodData,
  PaymentMethod,
  PaymentMethodOption,
  PaymentMethodType
} from '../types/paymentMethod';

const PAYMONGO_API_BASE = 'https://api.paymongo.com/v1';

/**
 * PayMongo Payment Method Service Class
 */
export class PaymentMethodService {
  private publicKey: string;

  constructor(publicKey: string) {
    this.publicKey = publicKey;
  }

  /**
   * Get authorization headers for API requests
   */
  private getAuthHeaders(): Record<string, string> {
    // Use btoa for browser compatibility or Buffer for Node.js
    const encodedKey = typeof window !== 'undefined' 
      ? btoa(`${this.publicKey}:`) 
      : Buffer.from(`${this.publicKey}:`).toString('base64');
    
    return {
      'Authorization': `Basic ${encodedKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Transform PayMongo API response to internal PaymentMethod format
   */
  private transformPaymentMethod(resource: PaymentMethodResource): PaymentMethod {
    return {
      id: resource.id,
      type: resource.attributes.type as PaymentMethodType,
      attributes: {
        card: resource.attributes.details?.card ? {
          last4: resource.attributes.details.card.last4 as string,
          brand: resource.attributes.details.card.brand as string,
          country: resource.attributes.details.card.country as string,
          expMonth: resource.attributes.details.card.exp_month as number,
          expYear: resource.attributes.details.card.exp_year as number
        } : undefined,
        ewallet: resource.attributes.details?.account_name ? {
          accountName: resource.attributes.details.account_name as string,
          accountNumber: resource.attributes.details.account_number as string
        } : undefined,
        billing: resource.attributes.billing ? {
          name: resource.attributes.billing.name,
          email: resource.attributes.billing.email,
          phone: resource.attributes.billing.phone,
          address: resource.attributes.billing.address ? {
            line1: resource.attributes.billing.address.line1,
            line2: resource.attributes.billing.address.line2,
            city: resource.attributes.billing.address.city,
            state: resource.attributes.billing.address.state,
            country: resource.attributes.billing.address.country,
            postalCode: resource.attributes.billing.address.postal_code
          } : undefined
        } : undefined
      },
      createdAt: new Date(resource.attributes.created_at * 1000).toISOString()
    };
  }

  /**
   * Create a new payment method
   */
  async createPaymentMethod(data: CreatePaymentMethodData): Promise<PaymentResult> {
    try {
      const requestData = {
        type: data.type,
        details: data.card ? {
          card_number: data.card.number,
          exp_month: data.card.expMonth,
          exp_year: data.card.expYear,
          cvc: data.card.cvc
        } : {},
        billing: {
          name: data.billing.name,
          email: data.billing.email,
          phone: data.billing.phone,
          address: {
            line1: data.billing.address.line1,
            line2: data.billing.address.line2,
            city: data.billing.address.city,
            state: data.billing.address.state,
            country: data.billing.address.country,
            postal_code: data.billing.address.postalCode
          }
        }
      };

      const response = await fetch(`${PAYMONGO_API_BASE}/payment_methods`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          data: {
            attributes: requestData
          }
        })
      });

      if (!response.ok) {
        const errorData: PayMongoErrorResponse = await response.json();
        return {
          success: false,
          error: {
            code: errorData.errors[0]?.code || 'unknown_error',
            message: errorData.errors[0]?.detail || 'Failed to create payment method',
            details: errorData.errors
          }
        };
      }

      const result: PayMongoApiResponse<PaymentMethodResource> = await response.json();
      const paymentMethod = this.transformPaymentMethod(result.data);

      return {
        success: true,
        paymentIntent: {
          id: paymentMethod.id,
          amount: { value: 0, currency: 'PHP' },
          status: 'pending',
          paymentMethod: {
            id: paymentMethod.id,
            type: paymentMethod.type
          },
          createdAt: paymentMethod.createdAt,
          updatedAt: paymentMethod.createdAt
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'network_error',
          message: error instanceof Error ? error.message : 'Network error occurred',
          details: error
        }
      };
    }
  }

  /**
   * Get available payment method options
   */
  getPaymentMethodOptions(): PaymentMethodOption[] {
    return [
      {
        type: 'gcash',
        name: 'GCash',
        description: 'Pay using your GCash wallet',
        icon: '/icons/gcash.png',
        enabled: true,
        fees: {
          percentage: 0.02 // 2%
        },
        limits: {
          min: 100, // PHP 1.00
          max: 5000000 // PHP 50,000.00
        }
      },
      {
        type: 'paymaya',
        name: 'PayMaya',
        description: 'Pay using your PayMaya wallet',
        icon: '/icons/paymaya.png',
        enabled: true,
        fees: {
          percentage: 0.02 // 2%
        },
        limits: {
          min: 100, // PHP 1.00
          max: 5000000 // PHP 50,000.00
        }
      },
      {
        type: 'grab_pay',
        name: 'GrabPay',
        description: 'Pay using your GrabPay wallet',
        icon: '/icons/grabpay.png',
        enabled: true,
        fees: {
          percentage: 0.02 // 2%
        },
        limits: {
          min: 100, // PHP 1.00
          max: 2500000 // PHP 25,000.00
        }
      },
      {
        type: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay using Visa, Mastercard, JCB, or American Express',
        icon: '/icons/card.png',
        enabled: true,
        fees: {
          percentage: 0.035, // 3.5%
          fixed: 1500 // PHP 15.00
        },
        limits: {
          min: 100, // PHP 1.00
          max: 10000000 // PHP 100,000.00
        }
      },
      {
        type: 'billease',
        name: 'Billease',
        description: 'Pay later with Billease installments',
        icon: '/icons/billease.png',
        enabled: true,
        fees: {
          percentage: 0.02 // 2%
        },
        limits: {
          min: 100000, // PHP 1,000.00
          max: 4000000 // PHP 40,000.00
        }
      },
      {
        type: 'dob',
        name: 'DragonPay Online Banking',
        description: 'Pay using online banking',
        icon: '/icons/dragonpay.png',
        enabled: true,
        fees: {
          fixed: 1500 // PHP 15.00
        },
        limits: {
          min: 100, // PHP 1.00
          max: 10000000 // PHP 100,000.00
        }
      }
    ];
  }

  /**
   * Get enabled payment methods for a specific amount
   */
  getEnabledPaymentMethods(amount: number): PaymentMethodOption[] {
    const allMethods = this.getPaymentMethodOptions();
    
    return allMethods.filter(method => {
      if (!method.enabled) return false;
      
      if (method.limits?.min && amount < method.limits.min) return false;
      if (method.limits?.max && amount > method.limits.max) return false;
      
      return true;
    });
  }

  /**
   * Calculate payment fees for a method and amount
   */
  calculateFees(method: PaymentMethodOption, amount: number): number {
    let totalFees = 0;
    
    if (method.fees?.fixed) {
      totalFees += method.fees.fixed;
    }
    
    if (method.fees?.percentage) {
      totalFees += Math.round(amount * method.fees.percentage);
    }
    
    return totalFees;
  }
}
