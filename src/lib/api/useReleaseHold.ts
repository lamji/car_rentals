import { useState, useCallback } from "react";
import { useDeleteData } from "plugandplay-react-query-hooks";
import { useDispatch } from "react-redux";
import { showAlert } from "@/lib/slices/alertSlice";
import { setBookingDetails } from "@/lib/slices/bookingSlice";
import { showLoader, hideLoader } from "@/lib/slices/globalLoaderSlice";

export default function useReleaseHold({ id }: { id: string }) {
  const dispatch = useDispatch();
  const [currentBookingId, setCurrentBookingId] = useState<string>("");
  
  const { mutate, isPending } = useDeleteData({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
    endpoint: `/api/cars/release-date/${id}`,
    body: currentBookingId ? { bookingId: currentBookingId } : undefined,
    axiosConfig: {
      headers: { Authorization: "Bearer token123" },
      timeout: 5000,
    },
    options: {
      onMutate: () => {
        dispatch(showLoader("Releasing car hold..."));
      },
      onSuccess: () => {
        dispatch(hideLoader());
        dispatch(showAlert({
          type: "success",
          title: "Hold Released",
          message: "The car hold has been released successfully. The dates are now available for other users."
        }));
        
        // Clear booking form fields
        dispatch(setBookingDetails({
          startDate: undefined,
          endDate: undefined,
          startTime: undefined,
          endTime: undefined
        }));
      },
      onError: (error: Error) => {
        dispatch(hideLoader());
        dispatch(showAlert({
          type: "error",
          title: "Release Failed",
          message: error.message || "Unable to release the car hold. Please try again or contact support."
        }));
      },
      onSettled: () => {
        dispatch(hideLoader());
      },
    },
  });
  
  const handleReleaseHold = useCallback((bookingId: string) => {
    setCurrentBookingId(bookingId);
    // Small delay to ensure state is updated before mutation
    setTimeout(() => mutate(), 0);
  }, [mutate]);
  
  return {
    handleReleaseHold,
    isLoading: isPending,
  };
}
