'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { usePaymentWaiting } from '@/hooks/usePaymentWaiting';

export default function PaymentWaitingPage() {
  const { bookingId, status } = usePaymentWaiting();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-50">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Payment
          </h1>
          <p className="text-gray-600">
            Please wait while we confirm your payment. This may take a moment.
          </p>
        </div>

        {bookingId && (
          <p className="text-sm text-gray-500">
            Booking: <span className="font-mono font-medium">{bookingId}</span>
          </p>
        )}

        {status === 'waiting' && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full animate-pulse w-2/3" />
            </div>
            <p className="text-xs text-gray-400">
              Waiting for payment confirmation from payment provider...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
