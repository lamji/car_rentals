/**
 * PayMongo Payment Hook
 * Main hook for managing payment state and operations
 */

'use client';

import { useState, useCallback } from 'react';
import { PayMongoService } from '../api';
import {
  PaymentIntent,
  PaymentAmount,
  PaymentMetadata,
  PaymentCallbacks,
  PaymentConfig
} from '../types/payment';
import { PaymentMethodType, PaymentMethodOption } from '../types/paymentMethod';

interface UsePaymentOptions {
  config: PaymentConfig & { secretKey: string };
  callbacks?: PaymentCallbacks;
}

interface PaymentState {
  paymentIntent?: PaymentIntent;
  selectedMethod?: PaymentMethodType;
  availableMethods: PaymentMethodOption[];
  isLoading: boolean;
  error?: string;
  step: 'select_method' | 'processing' | 'completed' | 'failed';
}

/**
 * Custom hook for PayMongo payment management
 */
export function usePayment({ config, callbacks }: UsePaymentOptions) {
  const [paymentService] = useState(() => new PayMongoService(config));
  
  const [state, setState] = useState<PaymentState>({
    availableMethods: [],
    isLoading: false,
    step: 'select_method'
  });

  /**
   * Initialize payment with amount and metadata
   */
  const initializePayment = useCallback(async (
    amount: PaymentAmount,
    metadata?: PaymentMetadata
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Get available payment methods for this amount
      const availableMethods = paymentService.getAvailablePaymentMethods(amount.value);
      
      // Create payment intent
      const result = await paymentService.initializePayment(amount, metadata);
      
      if (result.success && result.paymentIntent) {
        setState(prev => ({
          ...prev,
          paymentIntent: result.paymentIntent,
          availableMethods,
          isLoading: false,
          step: 'select_method'
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error?.message || 'Failed to initialize payment',
          isLoading: false,
          step: 'failed'
        }));
        
        callbacks?.onError?.(result.error || {
          code: 'initialization_failed',
          message: 'Failed to initialize payment'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        step: 'failed'
      }));
      
      callbacks?.onError?.({
        code: 'initialization_error',
        message: errorMessage
      });
    }
  }, [paymentService, callbacks]);

  /**
   * Select payment method
   */
  const selectPaymentMethod = useCallback((methodType: PaymentMethodType) => {
    setState(prev => ({
      ...prev,
      selectedMethod: methodType,
      error: undefined
    }));
  }, []);

  /**
   * Process payment with selected method
   */
  const processPayment = useCallback(async (paymentMethodId: string) => {
    if (!state.paymentIntent) {
      const error = { code: 'no_payment_intent', message: 'No payment intent found' };
      setState(prev => ({ ...prev, error: error.message }));
      callbacks?.onError?.(error);
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, step: 'processing', error: undefined }));
    
    try {
      callbacks?.onProcessing?.(state.paymentIntent);
      
      const result = await paymentService.processPayment(
        state.paymentIntent.id,
        paymentMethodId,
        config.returnUrl
      );

      if (result.success && result.paymentIntent) {
        const updatedIntent = result.paymentIntent;
        
        setState(prev => ({
          ...prev,
          paymentIntent: updatedIntent,
          isLoading: false,
          step: updatedIntent.status === 'succeeded' ? 'completed' : 'processing'
        }));

        if (updatedIntent.status === 'succeeded') {
          callbacks?.onSuccess?.(updatedIntent);
        } else if (updatedIntent.status === 'requires_action' && updatedIntent.nextAction?.redirect) {
          // Redirect to payment provider for authentication
          window.location.href = updatedIntent.nextAction.redirect.url;
        }
      } else {
        setState(prev => ({
          ...prev,
          error: result.error?.message || 'Payment processing failed',
          isLoading: false,
          step: 'failed'
        }));
        
        callbacks?.onError?.(result.error || {
          code: 'processing_failed',
          message: 'Payment processing failed'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        step: 'failed'
      }));
      
      callbacks?.onError?.({
        code: 'processing_error',
        message: errorMessage
      });
    }
  }, [state.paymentIntent, paymentService, config.returnUrl, callbacks]);

  /**
   * Check payment status
   */
  const checkPaymentStatus = useCallback(async () => {
    if (!state.paymentIntent) return;

    try {
      const result = await paymentService.getPaymentStatus(state.paymentIntent.id);
      
      if (result.success && result.paymentIntent) {
        const updatedIntent = result.paymentIntent;
        
        setState(prev => ({
          ...prev,
          paymentIntent: updatedIntent,
          step: updatedIntent.status === 'succeeded' ? 'completed' : 
                updatedIntent.status === 'failed' ? 'failed' : prev.step
        }));

        if (updatedIntent.status === 'succeeded') {
          callbacks?.onSuccess?.(updatedIntent);
        } else if (updatedIntent.status === 'failed') {
          callbacks?.onError?.({
            code: 'payment_failed',
            message: 'Payment was not successful'
          });
        }
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
    }
  }, [state.paymentIntent, paymentService, callbacks]);

  /**
   * Cancel payment
   */
  const cancelPayment = useCallback(async () => {
    if (!state.paymentIntent) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await paymentService.cancelPayment(state.paymentIntent.id);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          paymentIntent: result.paymentIntent,
          isLoading: false,
          step: 'select_method'
        }));
        
        callbacks?.onCancel?.();
      } else {
        setState(prev => ({
          ...prev,
          error: result.error?.message || 'Failed to cancel payment',
          isLoading: false
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
    }
  }, [state.paymentIntent, paymentService, callbacks]);

  /**
   * Calculate total amount including fees
   */
  const calculateTotal = useCallback((baseAmount: number, methodType?: PaymentMethodType) => {
    if (!methodType) return baseAmount;
    return paymentService.getTotalAmount(baseAmount, methodType);
  }, [paymentService]);

  /**
   * Get fees for payment method
   */
  const getFees = useCallback((baseAmount: number, methodType: PaymentMethodType) => {
    return paymentService.calculatePaymentFees(methodType, baseAmount);
  }, [paymentService]);

  /**
   * Reset payment state
   */
  const resetPayment = useCallback(() => {
    setState({
      availableMethods: [],
      isLoading: false,
      step: 'select_method'
    });
  }, []);

  return {
    // State
    paymentIntent: state.paymentIntent,
    selectedMethod: state.selectedMethod,
    availableMethods: state.availableMethods,
    isLoading: state.isLoading,
    error: state.error,
    step: state.step,
    
    // Actions
    initializePayment,
    selectPaymentMethod,
    processPayment,
    checkPaymentStatus,
    cancelPayment,
    resetPayment,
    
    // Utilities
    calculateTotal,
    getFees
  };
}
