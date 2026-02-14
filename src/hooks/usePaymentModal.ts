/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store";
import { showLoader, hideLoader } from "@/lib/slices/globalLoaderSlice";
import { clearHoldData, setRetryPayload, clearRetryPayload, clearBooking } from "@/lib/slices/bookingSlice";
import { showAlert } from "@/lib/slices/alertSlice";
import useSaveBooking from "@/lib/api/useSaveBooking";
import useGcashPayment from "@/lib/api/useGcashPayment";
import { usePaymentCheckout } from "@/hooks/usePaymentCheckout";
import { useSocket } from "@/components/providers/SocketProvider";

/**
 * Hook that encapsulates all PaymentModal business logic.
 * Flow: save booking → initiate GCash payment → open checkout.
 * Guest token is fetched at app load in LayoutContent and stored in Redux.
 */
export function usePaymentModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const state = useAppSelector((state) => state.booking);
  const activeCars = useAppSelector((state) => state.data.cars);

  // Get guest auth from Redux (fetched at app load in LayoutContent)
  const guestToken = useAppSelector((state) => state.auth.guestToken);
  const guestId = useAppSelector((state) => state.auth.guestId);

  const { saveBooking, isSaving } = useSaveBooking();
  const { initiateGcashPayment, isPaymentPending } = useGcashPayment();
  const { socket } = useSocket();

  const { checkoutUrl, isCheckoutOpen, openCheckout, closeCheckout } = usePaymentCheckout();
  const [isProcessing, setIsProcessing] = useState(false);
  const activeBookingIdRef = useRef<string | null>(null);
  const paymongoPayloadRef = useRef<any>(null);

  // Listen for payment_status_updated socket event while checkout is open
  useEffect(() => {
    if (!socket || !isCheckoutOpen) return;

    const handlePaymentUpdate = (payload: any) => {
      console.log("debug:payment - payment_status_updated received:", payload);
      const data = payload?.data;
      if (!data) return;

      // Only react to our own booking
      if (activeBookingIdRef.current && data.bookingId !== activeBookingIdRef.current) return;

      closeCheckout();
      dispatch(hideLoader());
      setIsProcessing(false);

      if (data.status === "paid") {
        dispatch(clearRetryPayload());
        const params = new URLSearchParams({
          booking_id: data.bookingId || "",
          payment_id: data.paymentId || "",
          amount: String(data.amount || ""),
        });
        router.push(`/payment/success?${params.toString()}`);
      } else if (data.status === "failed") {
        if (paymongoPayloadRef.current) {
          dispatch(setRetryPayload(paymongoPayloadRef.current));
        }
        const params = new URLSearchParams({
          booking_id: data.bookingId || "",
          reason: "Payment was declined or failed",
        });
        router.push(`/payment/failed?${params.toString()}`);
      }
    };

    socket.on("payment_status_updated", handlePaymentUpdate);
    console.log("debug:payment - listening for payment_status_updated on checkout");

    return () => {
      socket.off("payment_status_updated", handlePaymentUpdate);
    };
  }, [socket, isCheckoutOpen, closeCheckout, dispatch, router]);

  const handleGcashPayment = useCallback(async () => {
    if (isProcessing) return;

    console.log("debug:payment - starting payment flow",{guestToken, guestId});

    if (!guestToken) {
      dispatch(showAlert({
        type: "error",
        title: "Authentication Error",
        message: "Unable to authenticate. Please refresh the page and try again.",
        duration: 5000,
      }));
      return;
    }

    setIsProcessing(true);
    dispatch(showLoader("Processing payment..."));

    try {
      // Step 1: Build booking payload
      const payload = {
        bookingDetails: state.bookingDetails,
        selectedCar: activeCars,
        userId: guestId,
        bookingId: `BK-${Date.now().toString(36).toUpperCase()}`,
        paymentStatus: "pending",
      };

      // Step 2: Save booking to DB
      console.log("debug:payment - saving booking:", payload);
      const bookingResponse: any = await saveBooking(payload);
      console.log("debug:payment - booking saved:", bookingResponse);

      // Step 2.5: Validate booking save success before proceeding
      if (!bookingResponse?.success) {
        console.error("debug:payment - booking save failed:", bookingResponse);
        dispatch(showAlert({
          type: "error",
          title: "Booking Failed",
          message: bookingResponse?.message || "Failed to save booking. Please try again.",
          duration: 5000,
        }));
        return;
      }

      // Step 2.6: Booking saved successfully — clear hold countdown on client
      dispatch(clearHoldData());
      console.log("debug:payment - hold cleared, booking is now permanent");

      // Step 3: Build PayMongo GCash payload
      const totalPrice = state.bookingDetails.totalPrice || 200;
      const downPaymentAmount = Math.round(totalPrice * 0.2 * 100) / 100; // 20% down payment
      const paymongoPayload = {
        amount: downPaymentAmount,
        description: "Car Rental Payment",
        returnUrl: `${window.location.origin}/payment/waiting?bookingId=${encodeURIComponent(payload.bookingId)}`,
        billing: {
          name: `${state.bookingDetails.firstName || ""} ${state.bookingDetails.lastName || ""}`.trim(),
          email: state.bookingDetails.email || "",
          phone: state.bookingDetails.contactNumber || "",
          address: {
            line1: "line 1",
            city: "city",
            state: "state",
            postal_code: "6006",
            country: "PH",
          },
        },
        metadata: {
          bookingId: payload.bookingId,
          userId: payload.userId || "",
          paymentStatus: payload.paymentStatus,
          selectedCarId: typeof payload.selectedCar === "object" ? payload.selectedCar?._id || "" : payload.selectedCar || "",
          startDate: state.bookingDetails.startDate || "",
          endDate: state.bookingDetails.endDate || "",
          startTime: state.bookingDetails.startTime || "",
          endTime: state.bookingDetails.endTime || "",
          name: `${state.bookingDetails.firstName || ""} ${state.bookingDetails.lastName || ""}`.trim(),
          email: state.bookingDetails.email || "",
          phone: state.bookingDetails.contactNumber || "",
        },
      };

      // Step 3.5: Store payload ref for retry on failure
      paymongoPayloadRef.current = paymongoPayload;

      // Step 4: Initiate GCash payment
      console.log("debug:payment - initiating gcash payment:", paymongoPayload);
      const paymentResponse: any = await initiateGcashPayment(paymongoPayload);
      console.log("debug:payment - gcash payment response:", paymentResponse);

      // Step 4.5: Validate GCash response and open checkout
      if (!paymentResponse?.success || !paymentResponse?.data?.checkoutUrl) {
        dispatch(showAlert({
          type: "error",
          title: "Payment Failed",
          message: paymentResponse?.message || "Failed to initiate GCash payment. Please try again.",
          duration: 5000,
        }));
        return;
      }

      // Step 5: Track active booking and open fullscreen checkout
      activeBookingIdRef.current = payload.bookingId;
      dispatch(clearBooking())
      openCheckout(paymentResponse.data.checkoutUrl);
    } catch (error: any) {
      console.error("debug:payment - error in payment flow:", error);

      // Extract readable error from API response (e.g. 409 booking conflict)
      const apiData = error?.response?.data;
      const conflict = apiData?.conflict;
      let errorTitle = "Payment Error";
      let errorMessage = error?.message || "Something went wrong. Please try again.";

      if (error?.response?.status === 409 && conflict) {
        errorTitle = "Booking Conflict";
        errorMessage = `This car is already booked from ${conflict.startDate} ${conflict.startTime} to ${conflict.endDate} ${conflict.endTime} (${conflict.bookingStatus}). Booking ID: ${conflict.bookingId}. Please choose different dates.`;
      } else if (apiData?.message) {
        errorMessage = apiData.message;
      }

      dispatch(showAlert({
        type: "error",
        title: errorTitle,
        message: errorMessage,
        duration: 8000,
      }));
    } finally {
      dispatch(hideLoader());
      setIsProcessing(false);
    }
  }, [
    isProcessing,
    dispatch,
    state.bookingDetails,
    activeCars,
    saveBooking,
    initiateGcashPayment,
    openCheckout,
    guestToken,
    guestId,
  ]);

  return {
    handleGcashPayment,
    isProcessing: isProcessing || isSaving || isPaymentPending,
    checkoutUrl,
    isCheckoutOpen,
    closeCheckout,
  };
}
