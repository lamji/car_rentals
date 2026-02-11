/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useCallback, useRef } from "react";
import { useSocket } from "@/components/providers/SocketProvider";
import { useConfirmation } from "@/hooks/useConfirmation";
import { clearHoldData } from "@/lib/slices/bookingSlice";
import { updateConfirmationMessage } from "@/lib/slices/confirmationSlice";
import { useAppDispatch } from "@/lib/store";
import { getUserAgentRoom } from "@/utils/getUserAgentRoom";

interface HoldExpiryOptions {
  onExpired?: () => void;
  onContinue?: () => void;
  releaseHold?: (bookingId: string) => void;
  bookingId?: string;
}

/**
 * Builds the warning message with the current countdown value
 */
function buildWarningMessage(seconds: number): string {
  return (
    `Your car hold will expire in ${seconds} second${seconds !== 1 ? "s" : ""}. ` +
    `Would you like to continue with the booking?`
  );
}

/**
 * Hook that listens for hold_warning and hold_expired socket events.
 * Shows a confirmation alert with a live countdown when hold is about to expire.
 * Auto-releases if no response from user.
 */
export function useHoldExpiry(options?: HoldExpiryOptions) {
  const { socket } = useSocket();
  const { showConfirmation } = useConfirmation();
  const dispatch = useAppDispatch();
  const optionsRef = useRef(options);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep ref up to date
  useEffect(() => {
    optionsRef.current = options;
  });

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  /**
   * Starts a 1-second interval that ticks the modal message from `seconds` down to 0
   */
  const startCountdown = useCallback(
    (seconds: number) => {
      // Clear any existing countdown
      if (countdownRef.current) clearInterval(countdownRef.current);

      let remaining = seconds;

      countdownRef.current = setInterval(() => {
        remaining -= 1;

        if (remaining <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          countdownRef.current = null;
          return;
        }

        dispatch(updateConfirmationMessage(buildWarningMessage(remaining)));
      }, 1000);
    },
    [dispatch]
  );

  const stopCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const handleHoldWarning = useCallback(
    (payload: any) => {
      console.log("debug:holdExpiry - hold_warning received:", payload);

      const seconds = payload?.data?.secondsRemaining || 30;

      showConfirmation({
        title: "Hold Expiring Soon",
        message: buildWarningMessage(seconds),
        confirmText: "Continue Booking",
        cancelText: "Release Hold",
        variant: "default",
        onConfirm: () => {
          console.log("debug:holdExpiry - user chose to continue, extending hold");
          stopCountdown();
          // Emit extend_hold to backend to restart the 2-min countdown
          const room = getUserAgentRoom(navigator.userAgent);
          socket?.emit("extend_hold", { room });
          optionsRef.current?.onContinue?.();
        },
        onCancel: async () => {
          console.log("debug:holdExpiry - user chose to release");
          stopCountdown();
          // Actually release the booking from DB via API
          const bookingId = optionsRef.current?.bookingId;
          if (bookingId && optionsRef.current?.releaseHold) {
            try {
              await optionsRef.current.releaseHold(bookingId);
            } catch (error) {
              console.error("debug:holdExpiry - release API error:", error);
            }
          }
          dispatch(clearHoldData());
          optionsRef.current?.onExpired?.();
        },
      });

      // Start the live countdown after showing the modal
      startCountdown(seconds);
    },
    [showConfirmation, dispatch, startCountdown, stopCountdown, socket]
  );

  const handleHoldExpired = useCallback(
    (payload: any) => {
      console.log("debug:holdExpiry - hold_expired received:", payload);

      stopCountdown();
      dispatch(clearHoldData());

      showConfirmation({
        title: "Hold Expired",
        message:
          "Your car hold has expired and the dates have been released. Please select new dates to try again.",
        confirmText: "OK",
        cancelText: "Close",
        variant: "destructive",
        onConfirm: () => {
          optionsRef.current?.onExpired?.();
        },
        onCancel: () => {
          optionsRef.current?.onExpired?.();
        },
      });
    },
    [showConfirmation, dispatch, stopCountdown]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("hold_warning", handleHoldWarning);
    socket.on("hold_expired", handleHoldExpired);

    console.log("debug:holdExpiry - listening for hold events");

    return () => {
      socket.off("hold_warning", handleHoldWarning);
      socket.off("hold_expired", handleHoldExpired);
    };
  }, [socket, handleHoldWarning, handleHoldExpired]);
}
