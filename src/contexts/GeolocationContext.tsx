"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { GeolocationState } from "@/lib/types/geolocation";

interface GeolocationContextType extends GeolocationState {
  getCurrentPosition: () => void;
  requestLocation: () => void;
  requestLocationPermission: () => void;
}

const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined);

export function useGeolocationContext() {
  const context = useContext(GeolocationContext);
  if (context === undefined) {
    throw new Error("useGeolocationContext must be used within a GeolocationProvider");
  }
  return context;
}

interface GeolocationProviderProps {
  children: ReactNode;
  autoRequest?: boolean; // Auto-request location on mount
}

export function GeolocationProvider({ children, autoRequest = false }: GeolocationProviderProps) {
  const geolocation = useGeolocation();

  // Auto-request location on mount if enabled
  useEffect(() => {
    console.log('🚀 GeolocationProvider: Mounted, autoRequest:', autoRequest);
    console.log('🚀 GeolocationProvider: Permission granted:', geolocation.permissionGranted);
    
    if (autoRequest && geolocation.permissionGranted !== false) {
      console.log('🚀 GeolocationProvider: Auto-requesting location...');
      // Request immediately without delay for testing
      geolocation.getCurrentPosition();
    } else {
      console.log('🚀 GeolocationProvider: Skipping auto-request', {
        autoRequest,
        permissionGranted: geolocation.permissionGranted
      });
    }
  }, [autoRequest, geolocation.permissionGranted, geolocation.getCurrentPosition]); // eslint-disable-line react-hooks/exhaustive-deps

  const requestLocation = () => {
    geolocation.getCurrentPosition();
  };

  const contextValue: GeolocationContextType = {
    ...geolocation,
    requestLocation,
    requestLocationPermission: geolocation.requestLocationPermission,
  };

  return (
    <GeolocationContext.Provider value={contextValue}>
      {children}
    </GeolocationContext.Provider>
  );
}
