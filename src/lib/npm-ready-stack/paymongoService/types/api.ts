/**
 * PayMongo API Response Types
 * Standard API response structures from PayMongo
 */

export interface PayMongoApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
      links: Record<string, string>;
    };
  };
}

export interface PayMongoError {
  code: string;
  detail: string;
  source?: {
    pointer: string;
    parameter: string;
  };
}

export interface PayMongoErrorResponse {
  errors: PayMongoError[];
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  payment_method_allowed?: string[];
  payment_method_options?: {
    card?: {
      request_three_d_secure?: 'automatic' | 'any';
    };
  };
  description?: string;
  statement_descriptor?: string;
  metadata?: Record<string, string | number>;
  capture_type?: 'automatic' | 'manual';
}

export interface AttachPaymentMethodRequest {
  payment_method: string;
  client_key: string;
  return_url?: string;
}

export interface PaymentIntentResource {
  id: string;
  type: 'payment_intent';
  attributes: {
    amount: number;
    currency: string;
    description?: string;
    statement_descriptor?: string;
    status: string;
    livemode: boolean;
    client_key?: string;
    created_at: number;
    updated_at: number;
    last_payment_error?: {
      code: string;
      detail: string;
      payment_method?: {
        id: string;
        type: string;
      };
    };
    payment_method?: {
      id: string;
      type: string;
    };
    payments?: Array<{
      id: string;
      type: string;
      attributes: Record<string, unknown>;
    }>;
    next_action?: {
      type: string;
      redirect?: {
        url: string;
        return_url: string;
      };
    };
    metadata?: Record<string, string | number>;
    setup_future_usage?: string;
    capture_type: string;
  };
}

export interface PaymentMethodResource {
  id: string;
  type: 'payment_method';
  attributes: {
    livemode: boolean;
    type: string;
    details?: {
      card?: {
        last4: string;
        brand: string;
        country: string;
        exp_month: number;
        exp_year: number;
      };
      account_name?: string;
      account_number?: string;
      [key: string]: unknown;
    };
    billing?: {
      address: {
        city: string;
        country: string;
        line1: string;
        line2?: string;
        postal_code: string;
        state: string;
      };
      email: string;
      name: string;
      phone?: string;
    };
    metadata?: Record<string, string | number>;
    created_at: number;
    updated_at: number;
  };
}
