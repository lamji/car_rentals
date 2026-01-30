/**
 * Hook for initializing Mapbox map instance
 * @param key - Access token for Mapbox
 * @param mapboxStyle - Mapbox style URL
 * @returns {Object} Map instance and container ref
 */
"use client";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useRef } from "react";

interface UseMapboxInitProps {
  key: string;
  mapboxStyle: string;
}

interface Point {
  lng: number;
  lat: number;
}

export function useMapboxInit({ key, mapboxStyle }: UseMapboxInitProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  /**
   * Initialize map with proper bounds and centering
   * @param pointA - Starting point coordinates
   * @param pointB - Ending point coordinates
   */
  const initializeMap = useCallback((pointA: Point, pointB: Point) => {
    if (mapRef.current) return;

    console.log("test:hooks - Starting mapbox initialization");

    // Set access token
    mapboxgl.accessToken = key;
    console.log("test:hooks - Access token set");

    // Create map centered between Point A and Point B
    const centerLng = (pointA.lng + pointB.lng) / 2;
    const centerLat = (pointA.lat + pointB.lat) / 2;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: mapboxStyle,
      center: [centerLng, centerLat],
      zoom: 13,
    });

    // Fit map to show both points with 2km radius padding after map loads
    mapRef.current.on("load", () => {
      const bounds = new mapboxgl.LngLatBounds();

      // Add 2km (approximately 0.018 degrees) buffer around each point
      const buffer = 0.018; // ~2km in degrees

      bounds.extend([pointA.lng - buffer, pointA.lat - buffer]);
      bounds.extend([pointA.lng + buffer, pointA.lat + buffer]);
      bounds.extend([pointB.lng - buffer, pointB.lat - buffer]);
      bounds.extend([pointB.lng + buffer, pointB.lat + buffer]);

      mapRef.current!.fitBounds(bounds, {
        padding: 20, // Small UI padding
        maxZoom: 13, // Allow slightly wider view
      });
    });

    console.log("test:hooks - Map created");
  }, [key, mapboxStyle]);

  /**
   * Clean up map instance
   */
  const cleanup = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  }, []);

  return {
    mapRef,
    mapContainerRef,
    initializeMap,
    cleanup,
  };
}
