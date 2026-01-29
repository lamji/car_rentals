/**
 * PayMongo Payment Intent API Service
 * Handles payment intent creation, retrieval, and management
 */

import {
  AttachPaymentMethodRequest,
  CreatePaymentIntentRequest,
  PayMongoApiResponse,
  PayMongoErrorResponse,
  PaymentIntentResource
} from '../types/api';
import { PaymentIntent, PaymentResult } from '../types/payment';

const PAYMONGO_API_BASE = 'https://api.paymongo.com/v1';

/**
 * PayMongo Payment Intent Service Class
 */
export class PaymentIntentService {
  private secretKey: string;
  private publicKey: string;

  constructor(secretKey: string, publicKey: string) {
    this.secretKey = secretKey;
    this.publicKey = publicKey;
  }

  /**
   * Get authorization headers for API requests
   */
  private getAuthHeaders(useSecretKey = true): Record<string, string> {
    const key = useSecretKey ? this.secretKey : this.publicKey;
    
    // Use btoa for browser compatibility or Buffer for Node.js
    const encodedKey = typeof window !== 'undefined' 
      ? btoa(`${key}:`) 
      : Buffer.from(`${key}:`).toString('base64');
    
    return {
      'Authorization': `Basic ${encodedKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Transform PayMongo API response to internal PaymentIntent format
   */
  private transformPaymentIntent(resource: PaymentIntentResource): PaymentIntent {
    return {
      id: resource.id,
      amount: {
        value: resource.attributes.amount,
        currency: resource.attributes.currency as 'PHP' | 'USD'
      },
      status: this.mapPaymentStatus(resource.attributes.status),
      clientKey: resource.attributes.client_key,
      nextAction: resource.attributes.next_action,
      paymentMethod: resource.attributes.payment_method,
      metadata: resource.attributes.metadata,
      createdAt: new Date(resource.attributes.created_at * 1000).toISOString(),
      updatedAt: new Date(resource.attributes.updated_at * 1000).toISOString()
    };
  }

  /**
   * Map PayMongo status to internal status
   */
  private mapPaymentStatus(status: string): PaymentIntent['status'] {
    const statusMap: Record<string, PaymentIntent['status']> = {
      'awaiting_payment_method': 'pending',
      'awaiting_next_action': 'requires_action',
      'processing': 'processing',
      'succeeded': 'succeeded',
      'canceled': 'canceled'
    };
    
    return statusMap[status] || 'failed';
  }

  /**
   * Create a new payment intent
   */
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentResult> {
    try {
      const response = await fetch(`${PAYMONGO_API_BASE}/payment_intents`, {
        method: 'POST',
        headers: this.getAuthHeaders(true),
        body: JSON.stringify({
          data: {
            attributes: data
          }
        })
      });

      if (!response.ok) {
        const errorData: PayMongoErrorResponse = await response.json();
        return {
          success: false,
          error: {
            code: errorData.errors[0]?.code || 'unknown_error',
            message: errorData.errors[0]?.detail || 'Failed to create payment intent',
            details: errorData.errors
          }
        };
      }

      const result: PayMongoApiResponse<PaymentIntentResource> = await response.json();
      const paymentIntent = this.transformPaymentIntent(result.data);

      return {
        success: true,
        paymentIntent
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'network_error',
          message: error instanceof Error ? error.message : 'Network error occurred',
          details: { error }
        }
      };
    }
  }

  /**
   * Retrieve a payment intent by ID
   */
  async getPaymentIntent(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${PAYMONGO_API_BASE}/payment_intents/${paymentIntentId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(true)
      });

      if (!response.ok) {
        const errorData: PayMongoErrorResponse = await response.json();
        return {
          success: false,
          error: {
            code: errorData.errors[0]?.code || 'unknown_error',
            message: errorData.errors[0]?.detail || 'Failed to retrieve payment intent',
            details: errorData.errors
          }
        };
      }

      const result: PayMongoApiResponse<PaymentIntentResource> = await response.json();
      const paymentIntent = this.transformPaymentIntent(result.data);

      return {
        success: true,
        paymentIntent
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'network_error',
          message: error instanceof Error ? error.message : 'Network error occurred',
          details: { error }
        }
      };
    }
  }

  /**
   * Attach a payment method to a payment intent
   */
  async attachPaymentMethod(
    paymentIntentId: string, 
    data: AttachPaymentMethodRequest
  ): Promise<PaymentResult> {
    try {
      const response = await fetch(`${PAYMONGO_API_BASE}/payment_intents/${paymentIntentId}/attach`, {
        method: 'POST',
        headers: this.getAuthHeaders(false), // Use public key for client-side operations
        body: JSON.stringify({
          data: {
            attributes: data
          }
        })
      });

      if (!response.ok) {
        const errorData: PayMongoErrorResponse = await response.json();
        return {
          success: false,
          error: {
            code: errorData.errors[0]?.code || 'unknown_error',
            message: errorData.errors[0]?.detail || 'Failed to attach payment method',
            details: errorData.errors
          }
        };
      }

      const result: PayMongoApiResponse<PaymentIntentResource> = await response.json();
      const paymentIntent = this.transformPaymentIntent(result.data);

      return {
        success: true,
        paymentIntent
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'network_error',
          message: error instanceof Error ? error.message : 'Network error occurred',
          details: { error }
        }
      };
    }
  }

  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${PAYMONGO_API_BASE}/payment_intents/${paymentIntentId}/cancel`, {
        method: 'POST',
        headers: this.getAuthHeaders(true)
      });

      if (!response.ok) {
        const errorData: PayMongoErrorResponse = await response.json();
        return {
          success: false,
          error: {
            code: errorData.errors[0]?.code || 'unknown_error',
            message: errorData.errors[0]?.detail || 'Failed to cancel payment intent',
            details: errorData.errors
          }
        };
      }

      const result: PayMongoApiResponse<PaymentIntentResource> = await response.json();
      const paymentIntent = this.transformPaymentIntent(result.data);

      return {
        success: true,
        paymentIntent
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'network_error',
          message: error instanceof Error ? error.message : 'Network error occurred',
          details: { error }
        }
      };
    }
  }
}
