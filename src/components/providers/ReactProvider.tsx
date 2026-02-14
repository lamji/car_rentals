"use client";

import { Providers } from "plugandplay-react-query-hooks";
import React, { useEffect, useState } from "react";

const queryClient = {
  queries: {
    // Default settings for react-query
    staleTime: 0, // Immediate refetching for real-time updates
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1, // Retry failed queries once
  },
};

export default function ReactProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**
   * In this case we use localStorage to persist the token
   * This allows the token to be available even after a page refresh
   * You can use whatever storage mechanism you prefer (e.g., sessionStorage, cookies)
   */
  const [initialToken, setInitialToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setInitialToken(token);

    console.log("token", token);

    // Listen for token updates from useGuestToken (custom event)
    const handleTokenUpdate = () => {
      const updatedToken = localStorage.getItem("token");
      setInitialToken(updatedToken);
    };
    window.addEventListener("token-updated", handleTokenUpdate);
    return () => window.removeEventListener("token-updated", handleTokenUpdate);
  }, []);

  // Pass initialToken to Providers if needed for authentication


  return (
    <Providers bearer={true} queryClient={queryClient} token={initialToken}>
      {children}
    </Providers>
  );
}
