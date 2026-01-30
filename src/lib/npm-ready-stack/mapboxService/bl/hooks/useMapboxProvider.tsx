/**
 * Mapbox Provider Hook - Initialize once in root layout
 * Provides global mapbox context for the entire application
 * @param token - Mapbox access token from environment
 * @param styleMap - Mapbox style URL
 * @returns {Object} Mapbox provider context
 */
"use client";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createContext, useContext, useEffect, useState } from "react";

interface MapboxContextType {
  isInitialized: boolean;
  accessToken: string | null;
  mapStyle: string | null;
}

const MapboxContext = createContext<MapboxContextType | null>(null);

interface MapboxProviderProps {
  children: React.ReactNode;
  token: string;
  styleMap: string;
}

/**
 * Mapbox Provider Component - Wrap your app with this
 * @param token - Mapbox access token
 * @param styleMap - Mapbox style URL
 * @param children - App components
 */
export function MapboxProvider({
  children,
  token,
  styleMap,
}: MapboxProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !styleMap) return;

    console.log("test:provider - Initializing Mapbox globally");

    // Set global Mapbox access token
    mapboxgl.accessToken = token;

    setAccessToken(token);
    setMapStyle(styleMap);
    setIsInitialized(true);

    console.log("test:provider - Mapbox initialized successfully");
  }, [token, styleMap]);

  const contextValue: MapboxContextType = {
    isInitialized,
    accessToken,
    mapStyle,
  };

  return (
    <MapboxContext.Provider value={contextValue}>
      {children}
    </MapboxContext.Provider>
  );
}

/**
 * Hook to use Mapbox initialization - Call this in root layout
 * @param token - Mapbox access token from environment
 * @param styleMap - Mapbox style URL
 * @returns {Object} Provider component and initialization status
 */

/**
 * Hook to access Mapbox context from any component
 * @returns {Object} Mapbox context with error state
 */
export function useMapboxContext() {
  const context = useContext(MapboxContext);

  if (!context) {
    return {
      isInitialized: false,
      accessToken: null,
      mapStyle: null,
      error:
        "MapboxProvider not found. Please wrap your app with MapboxProvider in the root layout.",
    };
  }

  return {
    ...context,
    error: null,
  };
}
