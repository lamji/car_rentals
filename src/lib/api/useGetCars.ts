/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetData } from "plugandplay-react-query-hooks";

export default function useGetCars() {
  const { data, isLoading, refetch } = useGetData<any>({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    endpoint: "/api/cars",
    query: { page: 1 },
    axiosConfig: {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    },
    options: {
      queryKey: ["cars", "list", { page: 1 }],
      enabled: true,
      staleTime: 0,
    }
  });

   
  return {
    data,
    isLoading,
    refetch,
  };
}
