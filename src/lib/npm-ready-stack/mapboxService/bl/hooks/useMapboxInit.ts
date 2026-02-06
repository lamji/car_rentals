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

    // Create map centered on Point A (primary focus)
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: mapboxStyle,
      center: [pointA.lng, pointA.lat],
      zoom: 14,
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
