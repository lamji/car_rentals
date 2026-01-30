/**
 * Hook for managing Mapbox routes, markers, and location data
 * @param mapRef - Mapbox map instance reference
 * @returns {Object} Route data, location names, and marker functions
 */
"use client";

import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useState } from "react";

interface Point {
  lng: number;
  lat: number;
}

export interface RouteDetails {
  distance: number;
  duration: number;
}

export interface RouteGeometry {
  type: "LineString";
  coordinates: [number, number][];
}

export interface LocationNames {
  pointA: string;
  pointB: string;
}

export function useMapboxRoute(mapRef: React.RefObject<mapboxgl.Map | null>) {
  const [routeGeometry, setRouteGeometry] = useState<RouteGeometry | null>(
    null,
  );
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
  const [locationNames, setLocationNames] = useState<LocationNames>({
    pointA: "Point A",
    pointB: "Point B",
  });

  /**
   * Fetch driving route from Mapbox Directions API
   * @param pointA - Starting point coordinates
   * @param pointB - Ending point coordinates
   */
  const fetchRoute = async (pointA: Point, pointB: Point) => {
    console.log("test:hooks - Fetching driving route");
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pointA.lng},${pointA.lat};${pointB.lng},${pointB.lat}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&geometries=geojson&overview=full&steps=true`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        console.log("test:hooks - Route data received");
        setRouteGeometry(data.routes[0].geometry);
        setRouteDetails({
          distance: data.routes[0].distance,
          duration: data.routes[0].duration,
        });
      }
    } catch (error) {
      console.error("test:hooks - Route fetch failed:", error);
    }
  };

  /**
   * Fetch location names using reverse geocoding
   * @param pointA - Starting point coordinates
   * @param pointB - Ending point coordinates
   */
  const fetchLocationNames = async (pointA: Point, pointB: Point) => {
    try {
      // Reverse geocode Point A
      const pointAResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${pointA.lng},${pointA.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&types=poi,address`,
      );
      const pointAData = await pointAResponse.json();

      // Reverse geocode Point B
      const pointBResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${pointB.lng},${pointB.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&types=poi,address`,
      );
      const pointBData = await pointBResponse.json();

      setLocationNames({
        pointA: pointAData.features[0]?.place_name || "Point A",
        pointB: pointBData.features[0]?.place_name || "Point B",
      });

      console.log("test:hooks - Location names fetched");
    } catch (error) {
      console.error("test:hooks - Reverse geocoding failed:", error);
    }
  };

  /**
   * Create custom marker elements with Lucide-style SVG icons
   * @param iconType - Type of icon ('user' or 'building2')
   * @param color - Color for the marker border and icon
   * @returns {HTMLElement} Custom marker element
   */
  const createMarkerElement = (
    iconType: "user" | "building2",
    color: string,
  ) => {
    const el = document.createElement("div");
    el.className =
      "flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-lg border-2";
    el.style.borderColor = color;

    // Lucide-style SVG icons
    const iconSvg =
      iconType === "user"
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 14.2 0L21 21"></path><path d="m14.5 7.5c.83.83 2.17.83 3 0 0 0 0 0 0 0a2.12 2.12 0 0 0 0-3c-.83-.83-2.17-.83-3 0s-.83 2.17 0 3"></path><path d="m9.5 7.5c.83.83 2.17.83 3 0 0 0 0 0 0 0a2.12 2.12 0 0 0 0-3c-.83-.83-2.17-.83-3 0s-.83 2.17 0 3"></path></svg>';

    el.innerHTML = `
      <div style="color: ${color}; width: 20px; height: 20px;">
        ${iconSvg}
      </div>
    `;
    return el;
  };

  /**
   * Add custom markers to the map
   * @param pointA - Starting point coordinates
   * @param pointB - Ending point coordinates
   */
  const addMarkers = useCallback(
    (pointA: Point, pointB: Point) => {
      if (!mapRef.current) return;

      console.log("test:hooks - Adding Point A and Point B markers");

      // Point A - Green marker (start) - Person
      const pointAElement = createMarkerElement("user", "green");
      new mapboxgl.Marker({ element: pointAElement })
        .setLngLat([pointA.lng, pointA.lat])
        .setPopup(new mapboxgl.Popup().setText("👤 Person"))
        .addTo(mapRef.current);

      // Point B - Red marker (end) - Garage
      const pointBElement = createMarkerElement("building2", "red");
      new mapboxgl.Marker({ element: pointBElement })
        .setLngLat([pointB.lng, pointB.lat])
        .setPopup(new mapboxgl.Popup().setText("🏢 Garage"))
        .addTo(mapRef.current);

      console.log("test:hooks - All markers added");
    },
    [mapRef],
  );

  /**
   * Add route line to the map when geometry is available
   */
  useEffect(() => {
    if (!mapRef.current || !routeGeometry) return;

    console.log("test:hooks - Adding driving route to map");

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

      console.log("test:hooks - Driving route added successfully");
    };

    addRouteToMap();
  }, [routeGeometry, mapRef]);

  /**
   * Initialize all route and marker data
   * @param pointA - Starting point coordinates
   * @param pointB - Ending point coordinates
   */
  const initializeRouteData = useCallback(
    (pointA: Point, pointB: Point) => {
      fetchRoute(pointA, pointB);
      fetchLocationNames(pointA, pointB);
      addMarkers(pointA, pointB);
    },
    [addMarkers],
  );

  return {
    routeGeometry,
    routeDetails,
    locationNames,
    initializeRouteData,
  };
}
