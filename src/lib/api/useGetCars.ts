"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetData } from "plugandplay-react-query-hooks";
import { getRuntimeToken } from "@/lib/auth/session";
import { useAppSelector } from "@/lib/store";

interface UseGetCarsOptions {
  managed?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
}

export default function useGetCars(options: UseGetCarsOptions = {}) {
  const { managed = false, query = { page: 1 } } = options;
  const authToken = useAppSelector((state) => state.auth.authToken);
  const token = getRuntimeToken(authToken);
  const endpoint = managed ? "/api/cars/managed/list" : "/api/cars";

  const { data, isLoading, refetch, error } = useGetData<any>({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
    endpoint,
    query: { ...query },
    axiosConfig: {
      headers: {
        ...(managed && token ? { Authorization: `Bearer ${token}` } : {}),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      timeout: 10000, // 10 second timeout
    },
    options: {
      queryKey: ["cars", managed ? "managed" : "public", query, token],
      enabled: managed ? !!token : true,
      staleTime: 0,
      retry: 2,
      retryDelay: 1000,
    }
  });

  // Log errors for debugging
  if (error) {
    console.error("🚨 Cars API Error:", error);
  }

   
  return {
    data,
    isLoading,
    refetch,
    error,
    isApiDisabled: !process.env.NEXT_PUBLIC_API_URL
  };
}
