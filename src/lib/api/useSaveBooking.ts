
import { usePostData } from "plugandplay-react-query-hooks";

export default function useSaveBooking() {
  const { mutateAsync, isPending } = usePostData({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
    endpoint: "/api/bookings",
    axiosConfig: {
      timeout: 10000,
    },
  });

  return {
    saveBooking: mutateAsync,
    isSaving: isPending,
  };
}
