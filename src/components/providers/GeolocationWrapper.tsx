"use client";

import { ReactNode } from "react";
import { GeolocationProvider } from "@/contexts/GeolocationContext";

interface GeolocationWrapperProps {
  children: ReactNode;
}

export function GeolocationWrapper({ children }: GeolocationWrapperProps) {
  return (
    <GeolocationProvider autoRequest={true}>
      {children}
    </GeolocationProvider>
  );
}
