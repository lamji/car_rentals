/**
 * PayMongo Utility Functions
 * Currency formatting and amount conversion utilities
 */

import { Currency } from '../types/payment';

/**
 * Format amount from cents to display currency
 */
export function formatCurrency(amountInCents: number, currency: Currency = 'PHP'): string {
  const amount = amountInCents / 100;
  
  const formatters: Record<Currency, Intl.NumberFormat> = {
    PHP: new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    USD: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  };

  return formatters[currency].format(amount);
}

/**
 * Convert display amount to cents
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert cents to display amount
 */
export function fromCents(amountInCents: number): number {
  return amountInCents / 100;
}

/**
 * Format payment method name for display
 */
export function formatPaymentMethodName(type: string): string {
  const nameMap: Record<string, string> = {
    'card': 'Credit/Debit Card',
    'gcash': 'GCash',
    'grab_pay': 'GrabPay',
    'paymaya': 'PayMaya',
    'billease': 'Billease',
    'dob': 'Online Banking',
    'dob_ubp': 'UnionBank Online',
    'brankas_bdo': 'BDO Online Banking',
    'brankas_landbank': 'Landbank Online Banking',
    'brankas_metrobank': 'Metrobank Online Banking'
  };

  return nameMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format card number for display (mask middle digits)
 */
export function formatCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  const masked = cleaned.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 **** **** $4');
  return masked;
}

/**
 * Get payment method icon path
 */
export function getPaymentMethodIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'card': '/icons/payment/card.svg',
    'gcash': '/icons/payment/gcash.svg',
    'grab_pay': '/icons/payment/grabpay.svg',
    'paymaya': '/icons/payment/paymaya.svg',
    'billease': '/icons/payment/billease.svg',
    'dob': '/icons/payment/dragonpay.svg',
    'dob_ubp': '/icons/payment/ubp.svg',
    'brankas_bdo': '/icons/payment/bdo.svg',
    'brankas_landbank': '/icons/payment/landbank.svg',
    'brankas_metrobank': '/icons/payment/metrobank.svg'
  };

  return iconMap[type] || '/icons/payment/default.svg';
}

/**
 * Calculate total amount including fees
 */
export function calculateTotalAmount(baseAmount: number, fees: number): number {
  return baseAmount + fees;
}

/**
 * Format payment status for display
 */
export function formatPaymentStatus(status: string): { text: string; color: string } {
  const statusMap: Record<string, { text: string; color: string }> = {
    'pending': { text: 'Pending', color: 'text-yellow-600' },
    'processing': { text: 'Processing', color: 'text-blue-600' },
    'succeeded': { text: 'Completed', color: 'text-green-600' },
    'failed': { text: 'Failed', color: 'text-red-600' },
    'canceled': { text: 'Canceled', color: 'text-gray-600' },
    'requires_action': { text: 'Action Required', color: 'text-orange-600' }
  };

  return statusMap[status] || { text: status, color: 'text-gray-600' };
}

/**
 * Validate payment amount
 */
export function validateAmount(amount: number, currency: Currency = 'PHP'): { valid: boolean; message?: string } {
  if (amount <= 0) {
    return { valid: false, message: 'Amount must be greater than zero' };
  }

  const minAmounts: Record<Currency, number> = {
    PHP: 100, // PHP 1.00
    USD: 50   // USD 0.50
  };

  const maxAmounts: Record<Currency, number> = {
    PHP: 10000000, // PHP 100,000.00
    USD: 200000    // USD 2,000.00
  };

  if (amount < minAmounts[currency]) {
    return { 
      valid: false, 
      message: `Minimum amount is ${formatCurrency(minAmounts[currency], currency)}` 
    };
  }

  if (amount > maxAmounts[currency]) {
    return { 
      valid: false, 
      message: `Maximum amount is ${formatCurrency(maxAmounts[currency], currency)}` 
    };
  }

  return { valid: true };
}
