/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePostData } from "plugandplay-react-query-hooks";
import { useCallback } from "react";

export default function useGuestToken() {
  const { mutateAsync, isPending } = usePostData({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
    endpoint: "/api/auth/guest-token",
    axiosConfig: {
      timeout: 10000,
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_GUEST_API_KEY || "",
      },
    },
  });

  const getGuestToken = useCallback(async (data?: unknown) => {
    const response: any = await mutateAsync(data);
    // Save token to localStorage so plug-and-play Providers can consume it
    if (response?.token) {
      localStorage.setItem("token", response.token);
      console.log("token:response", response.token, response);
      window.dispatchEvent(new Event("token-updated"));
    }
    return response;
  }, [mutateAsync]);

  return {
    getGuestToken,
    isGettingToken: isPending,
  };
}
