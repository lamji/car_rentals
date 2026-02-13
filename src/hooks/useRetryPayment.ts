/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store";
import { clearRetryPayload } from "@/lib/slices/bookingSlice";
import { showAlert } from "@/lib/slices/alertSlice";
import useGcashPayment from "@/lib/api/useGcashPayment";

/**
 * Hook for retrying a failed GCash payment.
 * Reads the saved paymongoPayload from Redux (persisted) and re-initiates the payment.
 */
export function useRetryPayment() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const retryPayload = useAppSelector((state) => state.booking.retryPayload);
  const { initiateGcashPayment, isPaymentPending } = useGcashPayment();
  const [isRetrying, setIsRetrying] = useState(false);

  const hasRetryPayload = !!retryPayload;

  const retryPayment = useCallback(async () => {
    if (isRetrying || !retryPayload) return;

    setIsRetrying(true);

    try {
      console.log("debug:retryPayment - retrying with payload:", retryPayload);
      const paymentResponse: any = await initiateGcashPayment(retryPayload);
      console.log("debug:retryPayment - response:", paymentResponse);

      if (!paymentResponse?.success || !paymentResponse?.data?.checkoutUrl) {
        dispatch(showAlert({
          type: "error",
          title: "Payment Failed",
          message: paymentResponse?.message || "Failed to initiate GCash payment. Please try again.",
          duration: 5000,
        }));
        return;
      }

      // Redirect to the GCash checkout URL directly
      // The returnUrl in the payload already points to /payment/waiting
      window.location.href = paymentResponse.data.checkoutUrl;
    } catch (error: any) {
      console.error("debug:retryPayment - error:", error);
      const apiData = error?.response?.data;
      dispatch(showAlert({
        type: "error",
        title: "Payment Error",
        message: apiData?.message || error?.message || "Something went wrong. Please try again.",
        duration: 5000,
      }));
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, retryPayload, initiateGcashPayment, dispatch]);

  const clearRetry = useCallback(() => {
    dispatch(clearRetryPayload());
    router.push("/cars");
  }, [dispatch, router]);

  return {
    retryPayment,
    clearRetry,
    hasRetryPayload,
    isRetrying: isRetrying || isPaymentPending,
  };
}
