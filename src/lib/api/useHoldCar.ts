import { usePostData } from "plugandplay-react-query-hooks";

export default function useHoldCar({ id }: { id: string }) {
  const { mutate, isPending } = usePostData({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
    endpoint: `/api/cars/hold-date/${id}`,
    // invalidateQueryKey: ["users", "list"],
    axiosConfig: {
      headers: { Authorization: "Bearer token123" },
      timeout: 5000,
    },
    options: {
      onSuccess: (data) => {
        console.log("User created:", data);
      },
      onError: (error) => {
        console.error("Error creating user:", error);
      },
    },
  });
  return {
    handleHoldDate: mutate,
    isLoading: isPending,
  };
}
