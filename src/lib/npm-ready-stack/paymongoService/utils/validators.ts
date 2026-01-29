/**
 * PayMongo Validation Utilities
 * Validation functions for payment data and forms
 */

import { CreatePaymentMethodData, PaymentMethodType } from '../types/paymentMethod';
import { PaymentAmount } from '../types/payment';

/**
 * Validate email address
 */
export function validateEmail(email: string): { valid: boolean; message?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  return { valid: true };
}

/**
 * Validate phone number (Philippine format)
 */
export function validatePhone(phone: string): { valid: boolean; message?: string } {
  const phoneRegex = /^(\+63|0)?9\d{9}$/;
  
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }
  
  const cleanPhone = phone.replace(/\s|-/g, '');
  
  if (!phoneRegex.test(cleanPhone)) {
    return { valid: false, message: 'Please enter a valid Philippine mobile number' };
  }
  
  return { valid: true };
}

/**
 * Validate credit card number using Luhn algorithm
 */
export function validateCardNumber(cardNumber: string): { valid: boolean; message?: string } {
  if (!cardNumber) {
    return { valid: false, message: 'Card number is required' };
  }
  
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return { valid: false, message: 'Card number must be between 13-19 digits' };
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  if (sum % 10 !== 0) {
    return { valid: false, message: 'Please enter a valid card number' };
  }
  
  return { valid: true };
}

/**
 * Validate card expiry date
 */
export function validateCardExpiry(month: number, year: number): { valid: boolean; message?: string } {
  if (!month || !year) {
    return { valid: false, message: 'Expiry date is required' };
  }
  
  if (month < 1 || month > 12) {
    return { valid: false, message: 'Invalid expiry month' };
  }
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, message: 'Card has expired' };
  }
  
  if (year > currentYear + 20) {
    return { valid: false, message: 'Invalid expiry year' };
  }
  
  return { valid: true };
}

/**
 * Validate card CVC
 */
export function validateCardCVC(cvc: string, cardType?: string): { valid: boolean; message?: string } {
  if (!cvc) {
    return { valid: false, message: 'CVC is required' };
  }
  
  const cleaned = cvc.replace(/\D/g, '');
  
  // American Express uses 4-digit CVC, others use 3-digit
  const expectedLength = cardType === 'amex' ? 4 : 3;
  
  if (cleaned.length !== expectedLength) {
    return { 
      valid: false, 
      message: `CVC must be ${expectedLength} digits` 
    };
  }
  
  return { valid: true };
}

/**
 * Validate billing address
 */
export function validateBillingAddress(address: CreatePaymentMethodData['billing']['address']): { valid: boolean; message?: string } {
  if (!address.line1) {
    return { valid: false, message: 'Address line 1 is required' };
  }
  
  if (!address.city) {
    return { valid: false, message: 'City is required' };
  }
  
  if (!address.state) {
    return { valid: false, message: 'State/Province is required' };
  }
  
  if (!address.country) {
    return { valid: false, message: 'Country is required' };
  }
  
  if (!address.postalCode) {
    return { valid: false, message: 'Postal code is required' };
  }
  
  // Validate Philippine postal code format
  if (address.country === 'PH') {
    const postalRegex = /^\d{4}$/;
    if (!postalRegex.test(address.postalCode)) {
      return { valid: false, message: 'Philippine postal code must be 4 digits' };
    }
  }
  
  return { valid: true };
}

/**
 * Validate complete payment method data
 */
export function validatePaymentMethodData(data: CreatePaymentMethodData): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  // Validate billing info
  if (!data.billing.name) {
    errors.name = 'Name is required';
  }
  
  const emailValidation = validateEmail(data.billing.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.message || 'Invalid email';
  }
  
  if (data.billing.phone) {
    const phoneValidation = validatePhone(data.billing.phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.message || 'Invalid phone';
    }
  }
  
  const addressValidation = validateBillingAddress(data.billing.address);
  if (!addressValidation.valid) {
    errors.address = addressValidation.message || 'Invalid address';
  }
  
  // Validate card data if present
  if (data.type === 'card' && data.card) {
    const cardValidation = validateCardNumber(data.card.number);
    if (!cardValidation.valid) {
      errors.cardNumber = cardValidation.message || 'Invalid card number';
    }
    
    const expiryValidation = validateCardExpiry(data.card.expMonth, data.card.expYear);
    if (!expiryValidation.valid) {
      errors.cardExpiry = expiryValidation.message || 'Invalid expiry date';
    }
    
    const cvcValidation = validateCardCVC(data.card.cvc);
    if (!cvcValidation.valid) {
      errors.cardCvc = cvcValidation.message || 'Invalid CVC';
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate payment amount and method compatibility
 */
export function validatePaymentMethodAmount(
  paymentType: PaymentMethodType,
  amount: PaymentAmount
): { valid: boolean; message?: string } {
  const limits: Record<PaymentMethodType, { min: number; max: number }> = {
    'card': { min: 100, max: 10000000 },
    'gcash': { min: 100, max: 5000000 },
    'grab_pay': { min: 100, max: 2500000 },
    'paymaya': { min: 100, max: 5000000 },
    'billease': { min: 100000, max: 4000000 },
    'dob': { min: 100, max: 10000000 },
    'dob_ubp': { min: 100, max: 5000000 },
    'brankas_bdo': { min: 100, max: 5000000 },
    'brankas_landbank': { min: 100, max: 5000000 },
    'brankas_metrobank': { min: 100, max: 5000000 }
  };
  
  const methodLimits = limits[paymentType];
  if (!methodLimits) {
    return { valid: false, message: 'Unsupported payment method' };
  }
  
  if (amount.value < methodLimits.min) {
    return { 
      valid: false, 
      message: `Minimum amount for ${paymentType} is ₱${(methodLimits.min / 100).toFixed(2)}` 
    };
  }
  
  if (amount.value > methodLimits.max) {
    return { 
      valid: false, 
      message: `Maximum amount for ${paymentType} is ₱${(methodLimits.max / 100).toFixed(2)}` 
    };
  }
  
  return { valid: true };
}
