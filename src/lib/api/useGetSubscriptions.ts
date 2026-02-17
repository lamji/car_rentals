"use client";

import { useGetData } from "plugandplay-react-query-hooks";
import { getRuntimeToken } from "@/lib/auth/session";
import { useAppSelector } from "@/lib/store";

/**
 * Hook for fetching push subscriptions.
 * Standardized using plugandplay-react-query-hooks.
 */
export default function useGetSubscriptions() {
  const authToken = useAppSelector((state) => state.auth.authToken);
  const token = getRuntimeToken(authToken);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  return useGetData<any[]>({
    baseUrl,
    endpoint: "/api/subscriptions",
    axiosConfig: {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
    options: {
      queryKey: ["subscriptions", "list", token],
      enabled: !!token,
      staleTime: 60000, // 1 minute
    }
  });
}
