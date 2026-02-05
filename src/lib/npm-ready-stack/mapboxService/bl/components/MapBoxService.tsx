/* eslint-disable react-hooks/exhaustive-deps */
/**
 * MapBoxService Component - Dynamic map display for any web app
 * Usage: <MapBoxService pointA={{lng, lat}} pointB={{lng, lat}} />
 */
"use client";

import { Building, CircleUserRound, Eye, EyeOff } from "lucide-react";
import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMapboxContext } from "../hooks/useMapboxProvider";

interface Point {
  lng: number;
  lat: number;
}

interface RouteDetails {
  distance: number;
  duration: number;
}

interface LocationNames {
  pointA: string;
  pointB: string;
}

interface RouteGeometry {
  type: "LineString";
  coordinates: [number, number][];
}

interface MapBoxServiceProps {
  pointA: Point;
  pointB: Point;
  className?: string;
}

/**
 * MapBoxService Component - Display map with route between two points
 * @param pointA - Starting point coordinates
 * @param pointB - Ending point coordinates
 * @param className - Optional CSS classes
 * @returns {JSX.Element} Interactive map with route
 */
export function MapBoxService({
  pointA,
  pointB,
  className = "",
}: MapBoxServiceProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
  const [locationNames, setLocationNames] = useState<LocationNames>({
    pointA: "Point A",
    pointB: "Point B",
  });
  const [routeGeometry, setRouteGeometry] = useState<RouteGeometry | null>(
    null,
  );

  // Get Mapbox context from provider
  const { isInitialized, accessToken, mapStyle } = useMapboxContext();

  /**
   * Initialize map when component mounts and context is ready
   */
  useEffect(() => {
    if (!isInitialized || !accessToken || !mapStyle || mapRef.current) return;

    console.log("test:service - Initializing MapBoxService map");

    // Create map centered between Point A and Point B
    const centerLng = (pointA.lng + pointB.lng) / 2;
    const centerLat = (pointA.lat + pointB.lat) / 2;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: mapStyle,
      center: [centerLng, centerLat],
      zoom: 13,
    });

    // Fit map to show both points with 2km radius padding
    mapRef.current.on("load", () => {
      const bounds = new mapboxgl.LngLatBounds();
      const buffer = 0.018; // ~2km in degrees

      bounds.extend([pointA.lng - buffer, pointA.lat - buffer]);
      bounds.extend([pointA.lng + buffer, pointA.lat + buffer]);
      bounds.extend([pointB.lng - buffer, pointB.lat - buffer]);
      bounds.extend([pointB.lng + buffer, pointB.lat + buffer]);

      mapRef.current!.fitBounds(bounds, {
        padding: 20,
        maxZoom: 13,
      });
    });

    console.log("test:service - Map created successfully");
  }, [isInitialized, accessToken, mapStyle, pointA, pointB]);

  /**
   * Fetch route data when map is ready
   */
  useEffect(() => {
    if (!mapRef.current || !isInitialized) return;

    const fetchRouteData = async () => {
      try {
        // Fetch driving route
        const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${pointA.lng},${pointA.lat};${pointB.lng},${pointB.lat}?access_token=${accessToken}&geometries=geojson&overview=full&steps=true`;
        const routeResponse = await fetch(routeUrl);
        const routeData = await routeResponse.json();

        if (routeData.routes && routeData.routes[0]) {
          console.log("test:service - Route data received");
          setRouteGeometry(routeData.routes[0].geometry);
          setRouteDetails({
            distance: routeData.routes[0].distance,
            duration: routeData.routes[0].duration,
          });
        }

        // Fetch location names
        const [pointAResponse, pointBResponse] = await Promise.all([
          fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${pointA.lng},${pointA.lat}.json?access_token=${accessToken}&types=poi,address`,
          ),
          fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${pointB.lng},${pointB.lat}.json?access_token=${accessToken}&types=poi,address`,
          ),
        ]);

        const [pointAData, pointBData] = await Promise.all([
          pointAResponse.json(),
          pointBResponse.json(),
        ]);

        setLocationNames({
          pointA: pointAData.features[0]?.place_name || "Point A",
          pointB: pointBData.features[0]?.place_name || "Point B",
        });

        console.log("test:service - Location names fetched");
      } catch (error) {
        console.error("test:service - Data fetch failed:", error);
      }
    };

    fetchRouteData();
    addMarkers();
  }, [mapRef.current, isInitialized, accessToken, pointA, pointB]);

  /**
   * Add route line to map when geometry is available
   */
  useEffect(() => {
    if (!mapRef.current || !routeGeometry) return;

    const addRouteToMap = () => {
      if (!mapRef.current!.isStyleLoaded()) {
        setTimeout(addRouteToMap, 100);
        return;
      }

      // Remove existing route
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

      console.log("test:service - Route added to map");
    };

    addRouteToMap();
  }, [routeGeometry]);

  /**
   * Create custom markers
   */
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

  /**
   * Add markers to map
   */
  const addMarkers = useCallback(() => {
    if (!mapRef.current) return;

    // Point A - Green marker (Person)
    const pointAElement = createMarkerElement("avatar", "green");
    new mapboxgl.Marker({ element: pointAElement })
      .setLngLat([pointA.lng, pointA.lat])
      .setPopup(new mapboxgl.Popup().setText("👤 Person"))
      .addTo(mapRef.current);

    // Point B - Red marker (Garage)
    const pointBElement = createMarkerElement("building", "red");
    new mapboxgl.Marker({ element: pointBElement })
      .setLngLat([pointB.lng, pointB.lat])
      .setPopup(new mapboxgl.Popup().setText("🏢 Garage"))
      .addTo(mapRef.current);

    console.log("test:service - Markers added to map");
  }, [pointA, pointB]);

  /**
   * Cleanup map on unmount
   */
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (!isInitialized) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
      >
        <div className="text-gray-500">Initializing Mapbox...</div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Route Details Overlay */}
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
                      <div className="text-xs md:text-sm font-medium text-white wrap-break-word">
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
                      <div className="text-xs md:text-sm font-medium text-white wrap-break-word">
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
