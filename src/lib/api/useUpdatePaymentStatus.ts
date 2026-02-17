"use client";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRuntimeToken } from "@/lib/auth/session";
import { useAppSelector } from "@/lib/store";

/**
 * Custom mutation hook to update payment status via PATCH.
 * Hits car_rental_service:5000 directly.
 */
export default function useUpdatePaymentStatus() {
  const authToken = useAppSelector((state) => state.auth.authToken);
  const token = getRuntimeToken(authToken);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: string; paymentStatus: string }) => {
      const response = await axios.patch(`${baseUrl}/api/bookings/${id}/payment-status`, { paymentStatus }, {
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
