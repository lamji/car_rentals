/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetData } from "plugandplay-react-query-hooks";

export default function useGetCars() {
  const { data, isLoading, refetch, error } = useGetData<any>({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
    endpoint: "/api/cars",
    query: { page: 1 },
    axiosConfig: {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      timeout: 10000, // 10 second timeout
    },
    options: {
      queryKey: ["cars", "list", { page: 1 }],
      enabled: !!process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== "https://your-backend-api.com",
      staleTime: 0,
      retry: 2,
      retryDelay: 1000,
    }
  });

  // Log errors for debugging
  if (error) {
    console.error("🚨 Cars API Error:", error);
  }

  // Log when API is disabled
  if (!process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL === "https://your-backend-api.com") {
    console.warn("⚠️ Cars API is disabled - using fallback data");
  }
   
  return {
    data,
    isLoading,
    refetch,
    error,
    isApiDisabled: !process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL === "https://your-backend-api.com"
  };
}
