/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePostData } from "plugandplay-react-query-hooks";
import { useDispatch } from "react-redux";
import { setHoldData, clearHoldData } from "@/lib/slices/bookingSlice";
import { showAlert } from "@/lib/slices/alertSlice";
import { useConfirmation } from "@/hooks/useConfirmation";
import useReleaseHold from "./useReleaseHold";


export default function useHoldCar({ id }: { id: string }) {
  const dispatch = useDispatch();
  const { showConfirmation } = useConfirmation();
  const { handleReleaseHold } = useReleaseHold({ id });
  
  const { mutate, isPending } = usePostData({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
    endpoint: `/api/cars/hold-date/${id}`,
    // invalidateQueryKey: ["users", "list"],
    axiosConfig: {
      timeout: 5000,
    },
  options: {
  onSuccess: (response:any) => {
    console.log('debug:holdData - onSuccess fired, raw response:', response);
    
    // The response structure is: { success, data, booking, newBooking }
    const transformedData = {
      success: response.success,
      carId: response.data?._id,
      holdExpiry: response.hold?.expiresAt || response.data?.holdExpiry,
      bookingDetails: response.data?.bookingDetails,
      newBooking: response.newBooking,  // This is at root level
      booking: response.booking,        // This is at root level
      hold: response.hold,             // { room, expiresAt, durationMs }
    };
    
    console.log('debug:holdData - transformedData:', transformedData);
    
    // Dispatch the hold data to Redux store
    dispatch(setHoldData(transformedData));
    console.log('debug:holdData - setHoldData dispatched');
    
    // Show confirmation modal directly
    if (transformedData.newBooking) {
      showConfirmation({
        title: "Car is Available",
        message: `Your selected dates are available and the car has been temporarily held for 2 minutes.\n\n` +
                `Booking Details:\n` +
                `Start: ${transformedData.newBooking.startDate} at ${transformedData.newBooking.startTime}\n` +
                `End: ${transformedData.newBooking.endDate} at ${transformedData.newBooking.endTime}\n\n` +
                `Please complete your booking within 2 minutes.`,
        confirmText: "Proceed with Booking",
        cancelText: "Release Hold",
        variant: "default",
        onConfirm: () => {
          // User wants to proceed - keep holdData so booking flow can use it
          console.log('debug:holdData - user confirmed, keeping holdData');
        },
        onCancel: async () => {
          try {
            if (transformedData.newBooking?._id) {
              await handleReleaseHold(transformedData.newBooking._id);
            }
          } catch (error) {
            console.error('Error releasing hold:', error);
          } finally {
            dispatch(clearHoldData());
          }
        },
      });
    }
    
    return transformedData;  // Return the transformed data
  },
  onError: (error:any) => {
    console.error("debug:holdData - hold car error:", error);

    const apiData = error?.response?.data;
    const requestedDates = apiData?.data?.requestedDates;
    let errorTitle = "Hold Failed";
    let errorMessage = error?.message || "Unable to hold the car. Please try again.";

    if (apiData?.message === "Date is unavailable" && requestedDates) {
      errorTitle = "Date Unavailable";
      errorMessage = `The selected dates (${requestedDates.startDate} ${requestedDates.startTime} to ${requestedDates.endDate} ${requestedDates.endTime}) are already booked. Please choose different dates.`;
    } else if (apiData?.message) {
      errorMessage = apiData.message;
    }

    dispatch(showAlert({
      type: "error",
      title: errorTitle,
      message: errorMessage,
      duration: 8000,
    }));
  },
},
  });
  return {
    handleHoldDate: mutate,
    isLoading: isPending,
  };
}
