"use client";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRuntimeToken } from "@/lib/auth/session";
import { useAppSelector } from "@/lib/store";

/**
 * Custom mutation hook to update booking status via PATCH.
 * Workaround for library lacking PATCH support.
 */
export default function useUpdateBookingStatus() {
  const authToken = useAppSelector((state) => state.auth.authToken);
  const token = getRuntimeToken(authToken);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, bookingStatus }: { id: string; bookingStatus: string }) => {
      const response = await axios.patch(`${baseUrl}/api/bookings/${id}/booking-status`, { bookingStatus }, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
