/**
 * PayMongo Payment Method Types
 * Definitions for supported payment methods and their configurations
 */

export type PaymentMethodType = 
  | 'card'
  | 'gcash'
  | 'grab_pay'
  | 'paymaya'
  | 'billease'
  | 'dob'
  | 'dob_ubp'
  | 'brankas_bdo'
  | 'brankas_landbank'
  | 'brankas_metrobank';

export interface PaymentMethodBrand {
  visa: boolean;
  mastercard: boolean;
  jcb: boolean;
  amex: boolean;
}

export interface PaymentMethodCard {
  last4: string;
  brand: string;
  country: string;
  expMonth: number;
  expYear: number;
}

export interface PaymentMethodEWallet {
  accountName?: string;
  accountNumber?: string;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  attributes: {
    card?: PaymentMethodCard;
    ewallet?: PaymentMethodEWallet;
    billing?: {
      name: string;
      email: string;
      phone?: string;
      address?: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
      };
    };
  };
  createdAt: string;
}

export interface PaymentMethodOption {
  type: PaymentMethodType;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  fees?: {
    fixed?: number; // Fixed fee in cents
    percentage?: number; // Percentage fee (e.g., 0.035 for 3.5%)
  };
  limits?: {
    min?: number; // Minimum amount in cents
    max?: number; // Maximum amount in cents
  };
}

export interface CreatePaymentMethodData {
  type: PaymentMethodType;
  card?: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
  };
  billing: {
    name: string;
    email: string;
    phone?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  };
}

export interface PaymentMethodConfig {
  enabledMethods: PaymentMethodType[];
  defaultMethod?: PaymentMethodType;
  showFees: boolean;
  allowSaveMethod: boolean;
}
