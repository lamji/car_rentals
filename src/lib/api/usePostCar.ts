"use client";

import { usePostData } from "plugandplay-react-query-hooks";
import { Car } from "../types";
import { getRuntimeToken } from "@/lib/auth/session";
import { useAppSelector } from "@/lib/store";

/**
 * Hook for registering a new car.
 * Per user instructions, this calls the external API directly using a Bearer token.
 */
export default function usePostCar() {
  const authToken = useAppSelector((state) => state.auth.authToken);
  const token = getRuntimeToken(authToken);
  const externalUrl = process.env.NEXT_PUBLIC_API_URL || "";

  return usePostData<{ success: boolean; data: Car }, Partial<Car>>({
    baseUrl: externalUrl,
    endpoint: "/api/cars",
    invalidateQueryKey: ["cars", "list"],
    axiosConfig: {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  });
}
