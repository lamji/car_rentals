/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSocket } from '@/components/providers/SocketProvider';
import { useAppDispatch } from '@/lib/store';
import { clearRetryPayload } from '@/lib/slices/bookingSlice';

/**
 * Hook for the payment waiting page.
 * Listens for payment_status_updated socket events and redirects
 * to success or failed page based on the webhook result.
 */
export function usePaymentWaiting() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { socket } = useSocket();
  const [status, setStatus] = useState<'waiting' | 'paid' | 'failed'>('waiting');

  const bookingId = searchParams.get('bookingId') || '';

  const handlePaymentUpdate = useCallback(
    (payload: any) => {
      console.log('debug:paymentWaiting - payment_status_updated received:', payload);

      const data = payload?.data;
      if (!data) return;

      // Match by bookingId if available, otherwise accept any update
      if (bookingId && data.bookingId !== bookingId) return;

      if (data.status === 'paid') {
        setStatus('paid');
        dispatch(clearRetryPayload());
        const params = new URLSearchParams({
          booking_id: data.bookingId || '',
          payment_id: data.paymentId || '',
          amount: String(data.amount || ''),
        });
        router.push(`/payment/success?${params.toString()}`);
      } else if (data.status === 'failed') {
        setStatus('failed');
        const params = new URLSearchParams({
          booking_id: data.bookingId || '',
          reason: 'Payment was declined or failed',
        });
        router.push(`/payment/failed?${params.toString()}`);
      }
    },
    [bookingId, router, dispatch],
  );

  useEffect(() => {
    if (!socket) return;

    socket.on('payment_status_updated', handlePaymentUpdate);
    console.log('debug:paymentWaiting - listening for payment_status_updated');

    return () => {
      socket.off('payment_status_updated', handlePaymentUpdate);
    };
  }, [socket, handlePaymentUpdate]);

  return {
    bookingId,
    status,
  };
}
