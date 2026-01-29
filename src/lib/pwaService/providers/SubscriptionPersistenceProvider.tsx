"use client";

import { useEffect } from "react";
import { initializeSubscriptionPersistence } from "../subscription-persistence";

/**
 * Provider component that initializes subscription persistence system
 * Handles automatic subscription validation and renewal in the background
 */
export function SubscriptionPersistenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    /**
     * Initialize subscription persistence on app startup
     * This sets up automatic validation and heartbeat systems
     */
    const initialize = async () => {
      try {
        await initializeSubscriptionPersistence();
        console.log("✅ Subscription persistence system initialized");
      } catch (error) {
        console.error(
          "❌ Failed to initialize subscription persistence:",
          error,
        );
      }
    };

    // Only initialize in browser environment
    if (typeof window !== "undefined") {
      initialize();
    }
  }, []);

  return <>{children}</>;
}
