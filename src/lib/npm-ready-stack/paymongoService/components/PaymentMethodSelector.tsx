/**
 * PayMongo Payment Method Selector Component
 * UI component for selecting payment methods with fees display
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentMethodOption, PaymentMethodType } from '../types/paymentMethod';
import { formatCurrency, getPaymentMethodIcon, formatPaymentMethodName } from '../utils/formatters';

interface PaymentMethodSelectorProps {
  methods: PaymentMethodOption[];
  selectedMethod?: PaymentMethodType;
  baseAmount: number;
  currency?: 'PHP' | 'USD';
  onSelectMethod: (method: PaymentMethodType) => void;
  onCalculateFees: (baseAmount: number, method: PaymentMethodType) => number;
  disabled?: boolean;
}

/**
 * Payment Method Selector Component
 */
export function PaymentMethodSelector({
  methods,
  selectedMethod,
  baseAmount,
  currency = 'PHP',
  onSelectMethod,
  onCalculateFees,
  disabled = false
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Payment Method
        </h3>
        <p className="text-sm text-gray-600">
          Select your preferred payment method to continue
        </p>
      </div>

      <div className="grid gap-3">
        {methods.map((method) => {
          const fees = onCalculateFees(baseAmount, method.type);
          const totalAmount = baseAmount + fees;
          const isSelected = selectedMethod === method.type;

          return (
            <Card
              key={method.type}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? 'ring-2 ring-primary border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && onSelectMethod(method.type)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Payment Method Icon */}
                    <div className="flex-shrink-0">
                      <Image
                        src={getPaymentMethodIcon(method.type)}
                        alt={method.name}
                        width={40}
                        height={40}
                        className="rounded-lg"
                      />
                    </div>

                    {/* Payment Method Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {formatPaymentMethodName(method.type)}
                        </h4>
                        {!method.enabled && (
                          <Badge variant="secondary" className="text-xs">
                            Unavailable
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {method.description}
                      </p>
                      
                      {/* Fees Display */}
                      {fees > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          Processing fee: {formatCurrency(fees, currency)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amount Display */}
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(totalAmount, currency)}
                    </div>
                    {fees > 0 && (
                      <div className="text-xs text-gray-500">
                        + {formatCurrency(fees, currency)} fee
                      </div>
                    )}
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Payment Limits Info */}
                {method.limits && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Limits: {formatCurrency(method.limits.min || 0, currency)} - {formatCurrency(method.limits.max || 0, currency)}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {methods.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              No Payment Methods Available
            </h3>
            <p className="text-sm text-gray-500">
              No payment methods are available for this amount.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
