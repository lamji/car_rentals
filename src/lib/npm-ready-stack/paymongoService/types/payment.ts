/**
 * PayMongo Payment Types
 * Comprehensive type definitions for PayMongo payment integration
 */

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'requires_action';

export type Currency = 'PHP' | 'USD';

export interface PaymentAmount {
  value: number; // Amount in cents (e.g., 10000 = PHP 100.00)
  currency: Currency;
}

export interface PaymentMetadata {
  bookingId?: string;
  userId?: string;
  carId?: string;
  rentalDays?: number;
  [key: string]: string | number | undefined;
}

export interface PaymentIntent {
  id: string;
  amount: PaymentAmount;
  status: PaymentStatus;
  clientKey?: string;
  nextAction?: {
    type: string;
    redirect?: {
      url: string;
      return_url: string;
    };
  };
  paymentMethod?: {
    id: string;
    type: string;
  };
  metadata?: PaymentMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaymentConfig {
  publicKey: string;
  webhookEndpoint?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentCallbacks {
  onSuccess?: (paymentIntent: PaymentIntent) => void;
  onError?: (error: { code: string; message: string; details?: unknown }) => void;
  onCancel?: () => void;
  onProcessing?: (paymentIntent: PaymentIntent) => void;
}
