"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetData } from "plugandplay-react-query-hooks";
import { getRuntimeToken } from "@/lib/auth/session";
import { useAppSelector } from "@/lib/store";

/**
 * Hook to fetch bookings from the backend service.
 * Follows Direct Backend Architecture (port 5000).
 */
export default function useGetBookings(query: Record<string, any> = {}) {
  const authToken = useAppSelector((state) => state.auth.authToken);
  const token = getRuntimeToken(authToken);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  return useGetData<any>({
    baseUrl,
    endpoint: "/api/bookings",
    query: {
      ...query,
      sort: "-createdAt",
    },
    axiosConfig: {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
    options: {
      queryKey: ["bookings", "list", query, token],
      enabled: !!token,
      staleTime: 5000,
    }
  });
}
