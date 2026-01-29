/**
 * Payment Success Page
 * Displays successful payment confirmation for car rental bookings
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/npm-ready-stack/paymongoService';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentIntentId?: string;
    amount?: string;
    method?: string;
    bookingId?: string;
  }>({});

  useEffect(() => {
    // Extract payment details from URL parameters
    setPaymentDetails({
      paymentIntentId: searchParams.get('payment_intent') || undefined,
      amount: searchParams.get('amount') || undefined,
      method: searchParams.get('method') || undefined,
      bookingId: searchParams.get('booking_id') || undefined,
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Success Icon */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-gray-600">
            Your car rental booking has been confirmed
          </p>
        </div>

        {/* Payment Details */}
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Payment Details</h2>
          
          <div className="space-y-3">
            {paymentDetails.bookingId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <Badge variant="secondary">
                  #{paymentDetails.bookingId.slice(-6)}
                </Badge>
              </div>
            )}
            
            {paymentDetails.paymentIntentId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-sm">
                  {paymentDetails.paymentIntentId.slice(0, 20)}...
                </span>
              </div>
            )}
            
            {paymentDetails.amount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold">
                  {formatCurrency(parseInt(paymentDetails.amount), 'PHP')}
                </span>
              </div>
            )}
            
            {paymentDetails.method && (
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="capitalize">{paymentDetails.method.replace('_', ' ')}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge className="bg-green-100 text-green-800">
                Confirmed
              </Badge>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6">
          <h3 className="font-semibold mb-3">What's Next?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Confirmation email sent to your registered email</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Booking details available in your dashboard</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Car will be ready for pickup as scheduled</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/bookings">
              View My Bookings
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              Back to Home
            </Link>
          </Button>
          
          <Button asChild variant="ghost" className="w-full">
            <Link href="/payment/test">
              Test Another Payment
            </Link>
          </Button>
        </div>

        {/* Support */}
        <div className="text-center text-sm text-gray-500">
          <p>Need help? Contact our support team</p>
          <p className="font-medium">support@autogo.com</p>
        </div>
      </div>
    </div>
  );
}
