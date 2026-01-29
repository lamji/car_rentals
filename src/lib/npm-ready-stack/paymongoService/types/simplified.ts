/**
 * Simplified PayMongo Service Types
 * Types for the simplified component interface
 */

export interface PayMongoServiceProps {
  method: string[];
  key: {
    public: string;
    secret: string;
  };
  endpoints?: {
    [key: string]: string;
  };
  redirect: {
    success: string;
    cancel: string;
  };
  errorCallBack?: (error: any) => void;
  amount?: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string | number>;
  onSuccess?: (paymentIntent: any) => void;
  onCancel?: () => void;
  className?: string;
}
