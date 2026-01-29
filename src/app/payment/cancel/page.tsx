/**
 * Payment Cancel Page
 * Displays payment cancellation message for car rental bookings
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const [cancelDetails, setCancelDetails] = useState<{
    bookingId?: string;
    reason?: string;
  }>({});

  useEffect(() => {
    // Extract cancellation details from URL parameters
    setCancelDetails({
      bookingId: searchParams.get('booking_id') || undefined,
      reason: searchParams.get('reason') || 'User cancelled payment',
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Cancel Icon */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-4">
            <svg
              className="h-8 w-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600">
            Your payment was cancelled and no charges were made
          </p>
        </div>

        {/* Cancel Details */}
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Cancellation Details</h2>
          
          <div className="space-y-3">
            {cancelDetails.bookingId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <Badge variant="outline">
                  #{cancelDetails.bookingId.slice(-6)}
                </Badge>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Cancelled
              </Badge>
            </div>
            
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Reason:</span>
              <span className="text-sm text-right max-w-48">
                {cancelDetails.reason}
              </span>
            </div>
          </div>
        </Card>

        {/* What Happened */}
        <Card className="p-6">
          <h3 className="font-semibold mb-3">What Happened?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>Payment process was interrupted or cancelled</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>No charges have been made to your account</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>Your booking reservation has not been confirmed</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/payment/test">
              Try Payment Again
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/cars">
              Browse Cars
            </Link>
          </Button>
          
          <Button asChild variant="ghost" className="w-full">
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Support */}
        <div className="text-center text-sm text-gray-500">
          <p>Having trouble with payment?</p>
          <p>Contact support: <span className="font-medium">support@autogo.com</span></p>
        </div>
      </div>
    </div>
  );
}
