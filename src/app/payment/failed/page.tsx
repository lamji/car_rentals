'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRetryPayment } from '@/hooks/useRetryPayment';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const { retryPayment, hasRetryPayload, isRetrying } = useRetryPayment();
  const [details, setDetails] = useState<{
    bookingId?: string;
    reason?: string;
  }>({});

  useEffect(() => {
    setDetails({
      bookingId: searchParams.get('booking_id') || undefined,
      reason: searchParams.get('reason') || 'Payment was declined or failed',
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
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
            Payment Failed
          </h1>
          <p className="text-gray-600">
            Your payment could not be processed
          </p>
        </div>

        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Details</h2>
          <div className="space-y-3">
            {details.bookingId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <Badge variant="outline">{details.bookingId}</Badge>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge className="bg-red-100 text-red-800">Failed</Badge>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Reason:</span>
              <span className="text-sm text-right max-w-48">{details.reason}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3">What can you do?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-red-600 font-bold">1.</span>
              <span>Check your GCash balance and try again</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-600 font-bold">2.</span>
              <span>Make sure your account is verified</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-600 font-bold">3.</span>
              <span>Contact support if the issue persists</span>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {hasRetryPayload && (
            <Button
              className="w-full"
              size="lg"
              onClick={retryPayment}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay Again with GCash"
              )}
            </Button>
          )}
          <Button asChild variant={hasRetryPayload ? "outline" : "default"} className="w-full" size="lg">
            <Link href="/cars">Browse Cars</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Need help? Contact our support team</p>
          <p className="font-medium">support@autogo.com</p>
        </div>
      </div>
    </div>
  );
}
