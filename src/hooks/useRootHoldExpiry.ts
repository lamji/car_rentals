import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useHoldExpiry } from "@/hooks/useHoldExpiry";
import useReleaseHold from "@/lib/api/useReleaseHold";
import { useAppSelector, useAppDispatch } from "@/lib/store";
import { clearBooking } from "@/lib/slices/bookingSlice";

/**
 * Root-level hold expiry listener.
 * Mounts once in LayoutContent so hold_warning / hold_expired
 * socket events are handled even when the user navigates away
 * from the booking form (e.g. payment section).
 */
export function useRootHoldExpiry() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const holdData = useAppSelector((state) => state.booking.holdData);
  const selectedCar = useAppSelector((state) => state.data.cars);

  const { handleReleaseHold } = useReleaseHold({
    id: selectedCar?._id || "",
  });

  const handleExpired = useCallback(() => {
    dispatch(clearBooking());
    router.push("/");
  }, [dispatch, router]);

  const handleContinue = useCallback(() => {
    // No-op at root level; the backend extend_hold is handled inside useHoldExpiry
  }, []);

  useHoldExpiry({
    onExpired: handleExpired,
    onContinue: handleContinue,
    releaseHold: handleReleaseHold,
    bookingId: holdData?.newBooking?._id,
  });
}
