"use client";

import { useDeleteData } from "plugandplay-react-query-hooks";
import { getRuntimeToken } from "@/lib/auth/session";
import { useAppSelector } from "@/lib/store";

/**
 * Hook for deleting a car.
 * Uses the local Next.js API route as a proxy.
 */
export default function useDeleteCar(id: string) {
  const authToken = useAppSelector((state) => state.auth.authToken);
  const token = getRuntimeToken(authToken);
  const externalUrl = process.env.NEXT_PUBLIC_API_URL || "";

  return useDeleteData<void>({
    baseUrl: externalUrl,
    endpoint: `/api/cars/${id}`,
    invalidateQueryKey: ["cars", "list"],
    axiosConfig: {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  });
}
