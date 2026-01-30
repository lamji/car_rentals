/**
 * Simple Mapbox modal using direct mapboxgl import
 * No complex service layer, just basic mapbox
 */

"use client";

import { Building, CircleUserRound, Eye, EyeOff } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";

interface SimpleMapboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RouteGeometry {
  type: "LineString";
  coordinates: [number, number][];
}

// Point A and Point B coordinates for Google Maps comparison
const POINT_A = { lng: 121.03198315333073, lat: 14.532165709610107 }; // New Point A
const POINT_B = { lng: 121.02245594673593, lat: 14.558501989223595 }; // New Point B

/**
 * Simple modal with direct Mapbox API call
 * @param isOpen - Whether modal is open
 * @param onClose - Close handler
 * @returns {JSX.Element} Simple modal with map
 */
export function SimpleMapboxModal({ isOpen, onClose }: SimpleMapboxModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<RouteGeometry | null>(
    null,
  );
  const [routeDetails, setRouteDetails] = useState<{
    distance: number;
    duration: number;
  } | null>(null);
  const [locationNames, setLocationNames] = useState<{
    pointA: string;
    pointB: string;
  }>({ pointA: "Point A", pointB: "Point B" });
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    if (!isOpen || mapRef.current) return;

    console.log("test:simple - Starting simple mapbox initialization");

    // Set access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;
    console.log("test:simple - Access token set");

    // Create map centered between Point A and Point B
    const centerLng = (POINT_A.lng + POINT_B.lng) / 2;
    const centerLat = (POINT_A.lat + POINT_B.lat) / 2;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/lamjilampago/ckg2ggpzw0r9j19mit7o0fr2n",
      center: [centerLng, centerLat], // Center between Point A and B
      zoom: 13,
    });

    // Fit map to show both points with 2km radius padding after map loads
    mapRef.current.on("load", () => {
      const bounds = new mapboxgl.LngLatBounds();

      // Add 2km (approximately 0.018 degrees) buffer around each point
      const buffer = 0.018; // ~2km in degrees

      bounds.extend([POINT_A.lng - buffer, POINT_A.lat - buffer]);
      bounds.extend([POINT_A.lng + buffer, POINT_A.lat + buffer]);
      bounds.extend([POINT_B.lng - buffer, POINT_B.lat - buffer]);
      bounds.extend([POINT_B.lng + buffer, POINT_B.lat + buffer]);

      mapRef.current!.fitBounds(bounds, {
        padding: 20, // Small UI padding
        maxZoom: 13, // Allow slightly wider view
      });
    });

    console.log("test:simple - Map created");

    // Fetch driving route from Mapbox Directions API
    const fetchRoute = async () => {
      console.log("test:simple - Fetching driving route");
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${POINT_A.lng},${POINT_A.lat};${POINT_B.lng},${POINT_B.lat}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&geometries=geojson&overview=full&steps=true`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes[0]) {
          console.log("test:simple - Route data received");
          setRouteGeometry(data.routes[0].geometry);
          setRouteDetails({
            distance: data.routes[0].distance,
            duration: data.routes[0].duration,
          });
        }
      } catch (error) {
        console.error("test:simple - Route fetch failed:", error);
      }
    };

    fetchRoute();

    // Fetch location names using reverse geocoding
    const fetchLocationNames = async () => {
      try {
        // Reverse geocode Point A
        const pointAResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${POINT_A.lng},${POINT_A.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&types=poi,address`,
        );
        const pointAData = await pointAResponse.json();

        // Reverse geocode Point B
        const pointBResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${POINT_B.lng},${POINT_B.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&types=poi,address`,
        );
        const pointBData = await pointBResponse.json();

        setLocationNames({
          pointA: pointAData.features[0]?.place_name || "Point A",
          pointB: pointBData.features[0]?.place_name || "Point B",
        });

        console.log("test:simple - Location names fetched");
      } catch (error) {
        console.error("test:simple - Reverse geocoding failed:", error);
      }
    };

    fetchLocationNames();

    // Add Point A and Point B markers
    console.log("test:simple - Adding Point A and Point B markers");

    // Create custom marker elements
    const createMarkerElement = (
      iconType: "avatar" | "building",
      color: string,
    ) => {
      const el = document.createElement("div");
      el.className =
        "flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-lg border-2";
      el.style.borderColor = color;

      const iconSvg =
        iconType === "avatar"
          ? '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
          : '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>';

      el.innerHTML = `
        <div style="color: ${color}; width: 20px; height: 20px;">
          ${iconSvg}
        </div>
      `;
      return el;
    };

    // Point A - Green marker (start) - Person
    const pointAElement = createMarkerElement("avatar", "green");
    new mapboxgl.Marker({ element: pointAElement })
      .setLngLat([POINT_A.lng, POINT_A.lat])
      .setPopup(new mapboxgl.Popup().setText("👤 Person"))
      .addTo(mapRef.current);

    // Point B - Red marker (end) - Garage
    const pointBElement = createMarkerElement("building", "red");
    new mapboxgl.Marker({ element: pointBElement })
      .setLngLat([POINT_B.lng, POINT_B.lat])
      .setPopup(new mapboxgl.Popup().setText("🏢 Garage"))
      .addTo(mapRef.current);

    console.log("test:simple - All markers added");

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen]);

  // Add route when geometry is loaded
  useEffect(() => {
    if (!mapRef.current || !routeGeometry) return;

    console.log("test:simple - Adding driving route to map");

    // Check if map is loaded and style is ready
    const addRouteToMap = () => {
      if (!mapRef.current!.isStyleLoaded()) {
        setTimeout(addRouteToMap, 100);
        return;
      }

      // Remove existing route if present
      if (mapRef.current!.getSource("route")) {
        mapRef.current!.removeLayer("route");
        mapRef.current!.removeSource("route");
      }

      // Add new route
      mapRef.current!.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: routeGeometry,
        },
      });

      mapRef.current!.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3b82f6",
          "line-width": 6,
          "line-opacity": 0.8,
        },
      });

      console.log("test:simple - Driving route added successfully");
    };

    addRouteToMap();
  }, [routeGeometry]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl h-[80vh] rounded-lg border bg-background shadow-lg overflow-hidden">
          {/* Map */}
          <div className="relative w-full h-full">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Route Details Overlay - Right Corner */}
            {routeDetails && (
              <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 w-72 md:w-80">
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
                            {Math.round(routeDetails.duration / 60)} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className=" p-4 flex items-center justify-between border-b border-gray-600 pb-1 md:pb-2">
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
        </div>
      </div>
    </div>
  );
}
