/**
 * PayMongo Service - Main Export
 * Complete PayMongo payment integration package for car rentals
 */

// Types
export * from './types';

// API Services
export { PayMongoService as PayMongoAPIService, PaymentIntentService, PaymentMethodService } from './api';

// Hooks
export { default as useBlHooks } from './hooks/useBlHooks';
export { usePayment } from './hooks/usePayment';

// Export components
export { PayMongoService } from './components/PayMongoService';
export { PaymentMethodSelector } from './components/PaymentMethodSelector';

// Utilities
export * from './utils';

// Default configuration for car rentals
export const DEFAULT_PAYMONGO_CONFIG = {
  returnUrl: '/payment/success',
  cancelUrl: '/payment/cancel',
  webhookEndpoint: '/api/paymongo/webhook'
};

// Payment method configurations for car rentals
export const CAR_RENTAL_PAYMENT_METHODS = [
  'gcash',
  'paymaya', 
  'grab_pay',
  'card',
  'billease',
  'dob'
] as const;
