/**
 * MapBox Service Component - Reusable map display
 * Pure component for displaying maps with routes between two points
 */

"use client";

import { Building, CircleUserRound, Eye, Navigation, X } from "lucide-react";
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
  distanceText?: string;
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
  distanceText,
}: MapBoxServiceProps) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const { config } = useInitConfig();

  // Function to open Google Maps with route
  const openGoogleMaps = () => {
    const origin = `${pointA.lat},${pointA.lng}`;
    const destination = `${pointB.lat},${pointB.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    window.open(url, '_blank');
  };



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

    if (!hasConfig) {

      setIsMapReady(false);
      return;
    }


    // Initialize map with dynamic points
    initializeMap(pointA, pointB);

    // SIMPLE APPROACH: Check if pointA is north of pointB and rotate accordingly
    console.log("debug-location: Starting SIMPLE rotation approach");
    setTimeout(() => {
      if (mapRef.current) {
        console.log("debug-location: Checking relative positions");
        console.log("debug-location: PointA lat:", pointA.lat, "PointB lat:", pointB.lat);

        // Simple check: if pointA is north (higher latitude) than pointB
        if (pointA.lat > pointB.lat) {
          console.log("debug-location: PointA is NORTH of PointB - rotating 180°");
          mapRef.current.setBearing(180); // Flip map upside down
        } else {
          console.log("debug-location: PointA is SOUTH of PointB - no rotation needed");
          mapRef.current.setBearing(0); // Keep normal orientation
        }

        mapRef.current.setPitch(45);

        // Set zoom level to focus on Point A
        console.log("debug-location: Setting manual zoom level");
        mapRef.current.setZoom(14); // Focus on Point A

        console.log("debug-location: Simple rotation and zoom applied");

        // Now show the map after rotation is complete
        setIsMapReady(true);
      }
    }, 4000); // Increase delay to ensure route is fully loaded first

    // Initialize route data after a short delay to ensure map is ready
    const timer = setTimeout(() => {
      initializeRouteData(pointA, pointB);
      // Don't set isMapReady here - wait for rotation to complete
    }, 500);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [hasConfig, config.token, initializeMap, initializeRouteData, cleanup, pointA, pointB, mapRef]);

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
      {/* Loading State */}
      {!isMapReady && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Route Details Overlay - Right Corner */}
      {routeDetails && isMapReady && (
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
                    onClick={() => setShowOverlay(false)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    aria-label="Close route details"
                  >
                    <X className="h-3 w-3 md:h-4 md:w-4 text-white" />
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
                      {distanceText || "Calculating..."}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-gray-300">
                      ETA
                    </span>
                    <span className="text-xs md:text-sm font-semibold text-white">
                      {routeDetails && routeDetails.duration
                        ? formatDuration(routeDetails.duration)
                        : "Calculating..."}
                    </span>
                  </div>

                  {/* Go Now Button */}
                  <button
                    onClick={openGoogleMaps}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Navigation className="h-4 w-4" />
                    Go Now
                  </button>
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
