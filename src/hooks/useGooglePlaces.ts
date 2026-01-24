"use client";

import { useState, useCallback, useRef } from "react";
import type { 
  PSGCLocation, 
  PSGCPlace, 
  UseGooglePlacesOptions, 
  UseGooglePlacesReturn 
} from "@/lib/types/psgc";

export function useGooglePlaces(options: UseGooglePlacesOptions = {}): UseGooglePlacesReturn {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    baseUrl = "https://psgc.rootscratch.com/api"
  } = options;

  const [predictions, setPredictions] = useState<PSGCPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch location predictions from PSGC API
  const fetchPredictions = useCallback(async (query: string) => {
    if (!query || query.length < minQueryLength) {
      setPredictions([]);
      return;
    }

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the request
    debounceTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Search across all levels (regions, provinces, cities, barangays)
        const endpoints = [
          `${baseUrl}/regions?search=${encodeURIComponent(query)}`,
          `${baseUrl}/provinces?search=${encodeURIComponent(query)}`,
          `${baseUrl}/cities-municipalities?search=${encodeURIComponent(query)}`,
          `${baseUrl}/barangays?search=${encodeURIComponent(query)}`
        ];

        const responses = await Promise.allSettled(
          endpoints.map(endpoint => fetch(endpoint))
        );

        const allResults: PSGCPlace[] = [];

        for (const response of responses) {
          if (response.status === 'fulfilled') {
            try {
              const data = await response.value.json();
              if (Array.isArray(data)) {
                const places = data.map((item: PSGCLocation) => ({
                  psgc_id: item.psgc_id,
                  name: item.name,
                  geographic_level: item.geographic_level,
                  full_address: `${item.name} (${getGeographicLevelName(item.geographic_level)})`,
                  population: item.population
                }));
                allResults.push(...places);
              }
            } catch (parseError) {
              console.warn('Failed to parse PSGC response:', parseError);
            }
          }
        }

        // Sort by relevance (exact matches first, then by name length)
        allResults.sort((a, b) => {
          const aExact = a.name.toLowerCase() === query.toLowerCase();
          const bExact = b.name.toLowerCase() === query.toLowerCase();
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          return a.name.length - b.name.length;
        });

        // Limit results to prevent overwhelming the UI
        setPredictions(allResults.slice(0, 20));
      } catch {
        setError("Failed to fetch location data");
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [minQueryLength, baseUrl, debounceMs]);

  // Get detailed location information
  const getPlaceDetails = useCallback(async (psgcId: string): Promise<PSGCLocation | null> => {
    try {
      // Determine the endpoint based on PSGC ID length
      let endpoint: string;
      if (psgcId.length === 10) {
        endpoint = `${baseUrl}/regions/${psgcId}`;
      } else if (psgcId.length === 9) {
        endpoint = `${baseUrl}/provinces/${psgcId}`;
      } else if (psgcId.length === 9) {
        endpoint = `${baseUrl}/cities-municipalities/${psgcId}`;
      } else {
        endpoint = `${baseUrl}/barangays/${psgcId}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Location not found');
      }

      const data = await response.json();
      return data;
    } catch {
      setError("Failed to get location details");
      return null;
    }
  }, [baseUrl]);

  // Clear predictions
  const clearPredictions = useCallback(() => {
    setPredictions([]);
    setError(null);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  return {
    predictions,
    isLoading,
    error,
    fetchPredictions,
    getPlaceDetails,
    clearPredictions,
  };
}

// Helper function to get geographic level name
function getGeographicLevelName(level: string): string {
  switch (level) {
    case "Reg": return "Region";
    case "Prov": return "Province";
    case "City": return "City/Municipality";
    case "Bgy": return "Barangay";
    default: return level;
  }
}
