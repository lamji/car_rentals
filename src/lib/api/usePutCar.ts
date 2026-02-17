"use client";

import { usePutData } from "plugandplay-react-query-hooks";
import { Car } from "../types";
import { getRuntimeToken } from "@/lib/auth/session";
import { useAppSelector } from "@/lib/store";

/**
 * Hook for updating an existing car.
 * Uses the local Next.js API route as a proxy.
 */
export default function usePutCar(id: string) {
  const authToken = useAppSelector((state) => state.auth.authToken);
  const token = getRuntimeToken(authToken);
  const externalUrl = process.env.NEXT_PUBLIC_API_URL || "";

  return usePutData<{ success: boolean; data: Car }, Partial<Car>>({
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
