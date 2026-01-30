/**
 * MapBox Service Component - Reusable map display
 * Pure component for displaying maps with routes between two points
 */

"use client";

import { Building, CircleUserRound, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useInitConfig } from "..";
import { useMapboxRoute } from "../bl/hooks";
import { useMapboxInit } from "../bl/hooks/useMapboxInit";

/**
 * Format duration from seconds to a human-readable string with days, hours, and minutes
 * @param durationInSeconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
const formatDuration = (durationInSeconds: number): string => {
  const totalMinutes = Math.round(durationInSeconds / 60);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  // Build the duration string based on what units are needed
  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes}min`);
  }

  return parts.join(" ");
};

interface MapBoxServiceProps {
  pointA: { lng: number; lat: number };
  pointB: { lng: number; lat: number };
  className?: string;
  ui?: string;
}

/**
 * MapBox Service Component - Display map with route between two points
 * @param pointA - Starting point coordinates
 * @param pointB - Ending point coordinates
 * @param className - Optional CSS classes
 * @returns {JSX.Element} Interactive map with route
 */
export function MapBoxService({
  pointA,
  pointB,
  className = "w-full h-full",
  ui = "default",
}: MapBoxServiceProps) {
  const [showOverlay, setShowOverlay] = useState(true);
  const { config } = useInitConfig();

  console.log("test:ui - MapBoxService config", config);
  console.log("test:ui - Config token exists:", !!config.token);
  console.log("test:ui - Config style exists:", !!config.style);

  // Don't initialize map until we have config
  const hasConfig = config.token && config.style;
  console.log("test:ui - Has complete config:", hasConfig);

  // Initialize map with custom hook only when config is ready
  const { mapRef, mapContainerRef, initializeMap, cleanup } = useMapboxInit({
    key: config.token || "",
    mapboxStyle: config.style || "mapbox://styles/mapbox/streets-v12",
  });

  // Handle routes, markers, and location data with custom hook
  const { routeDetails, locationNames, initializeRouteData } =
    useMapboxRoute(mapRef);

  // Initialize map and route data when component mounts and config is ready
  useEffect(() => {
    console.log("test:ui - useEffect triggered");
    console.log("test:ui - Has config:", hasConfig);
    console.log("test:ui - Config token:", config.token);

    if (!hasConfig) {
      console.log("test:ui - Skipping initialization, no config yet");
      return;
    }

    console.log("test:ui - Initializing MapBox service with config");

    // Initialize map with dynamic points
    initializeMap(pointA, pointB);

    // Initialize route data after a short delay to ensure map is ready
    const timer = setTimeout(() => {
      initializeRouteData(pointA, pointB);
    }, 500);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [
    hasConfig,
    config.token,
    initializeMap,
    initializeRouteData,
    cleanup,
    pointA,
    pointB,
  ]);

  if (ui === "distance") {
    return (
      <div className={`relative ${className}`}>
        <span className="text-xs md:text-sm font-semibold text-white">
          {routeDetails && routeDetails.distance
            ? (routeDetails.distance / 1000).toFixed(1)
            : "0.0"}{" "}
          km
        </span>
      </div>
    );
  }

  if (ui === "charge") {
    const ratePerKm = 30; // Rate per kilometer
    const totalCharge =
      routeDetails && routeDetails.distance
        ? ((routeDetails.distance / 1000) * ratePerKm).toFixed(2)
        : "0.00";

    return (
      <div className={`relative ${className}`}>
        <span className="text-xs md:text-sm font-semibold text-white">
          ₱{totalCharge}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Route Details Overlay - Right Corner */}
      {routeDetails && (
        <div
          className={`absolute top-4 right-4 bg-transparent backdrop-blur-sm rounded-lg shadow-lg border border-white mt-10 ${showOverlay ? "w-72 md:w-80" : "w-auto"}`}
        >
          {showOverlay ? (
            <div className="p-3 md:p-4">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between border-b border-gray-600 pb-1 md:pb-2">
                  <div className="text-xs md:text-sm font-semibold text-white">
                    Route Details
                  </div>
                  <button
                    onClick={() => setShowOverlay(!showOverlay)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <EyeOff className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </button>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-start gap-2 md:gap-3">
                    <CircleUserRound className="h-3 w-3 md:h-4 md:w-4 text-green-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] md:text-xs text-gray-400 mb-0.5 md:mb-1">
                        From (Person)
                      </div>
                      <div className="text-xs md:text-sm font-medium text-white break-words">
                        {locationNames.pointA}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 md:gap-3">
                    <Building className="h-3 w-3 md:h-4 md:w-4 text-red-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] md:text-xs text-gray-400 mb-0.5 md:mb-1">
                        To (Garage)
                      </div>
                      <div className="text-xs md:text-sm font-medium text-white break-words">
                        {locationNames.pointB}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-2 md:pt-3 space-y-1 md:space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-gray-300">
                      Distance
                    </span>
                    <span className="text-xs md:text-sm font-semibold text-white">
                      {(routeDetails.distance / 1000).toFixed(1)} km
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-gray-300">
                      ETA
                    </span>
                    <span className="text-xs md:text-sm font-semibold text-white">
                      {formatDuration(routeDetails.duration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 flex items-center justify-between border-b border-gray-600 pb-1 md:pb-2">
              <div className="text-xs md:text-sm font-semibold text-white">
                Route Details
              </div>
              <button
                onClick={() => setShowOverlay(!showOverlay)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <Eye className="h-3 w-3 md:h-4 md:w-4 text-white" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
