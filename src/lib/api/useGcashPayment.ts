/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePostData } from "plugandplay-react-query-hooks";

export default function useGcashPayment() {
  const { mutateAsync, isPending } = usePostData({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
    endpoint: "/api/payments/gcash",
    axiosConfig: {
      timeout: 15000,
    },
    options: {
      onSuccess: (response: any) => {
        console.log("debug:gcashPayment - payment initiated successfully:", response);
      },
      onError: (error: any) => {
        console.error("debug:gcashPayment - error initiating payment:", error);
      },
    },
  });

  return {
    initiateGcashPayment: mutateAsync,
    isPaymentPending: isPending,
  };
}
