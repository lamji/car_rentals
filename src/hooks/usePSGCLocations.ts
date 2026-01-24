"use client";

import { useState, useCallback, useRef } from "react";
import type { 
  PSGCLocation, 
  PSGCPlace, 
  UsePSGCLocationsOptions, 
  CascadingSearchState, 
  UsePSGCLocationsReturn 
} from "@/lib/types/psgc";

export function usePSGCLocations(options: UsePSGCLocationsOptions = {}): UsePSGCLocationsReturn {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    baseUrl = "https://psgc.rootscratch.com"
  } = options;

  const [predictions, setPredictions] = useState<PSGCPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSearchLevel] = useState<'regions' | 'provinces' | 'cities' | 'barangays'>('regions');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cascading search state
  const [cascadingState, setCascadingState] = useState<CascadingSearchState>({
    selectedRegion: null,
    selectedProvince: null,
    selectedCity: null,
    selectedBarangay: null,
  });

  // Setters for cascading state
  const setSelectedRegion = useCallback((region: PSGCLocation | null) => {
    setCascadingState(prev => ({
      ...prev,
      selectedRegion: region,
      selectedProvince: null,
      selectedCity: null,
      selectedBarangay: null,
    }));
    setPredictions([]);
  }, []);

  const setSelectedProvince = useCallback((province: PSGCLocation | null) => {
    setCascadingState(prev => ({
      ...prev,
      selectedProvince: province,
      selectedCity: null,
      selectedBarangay: null,
    }));
    setPredictions([]);
  }, []);

  const setSelectedCity = useCallback((city: PSGCLocation | null) => {
    setCascadingState(prev => ({
      ...prev,
      selectedCity: city,
      selectedBarangay: null,
    }));
    setPredictions([]);
  }, []);

  const setSelectedBarangay = useCallback((barangay: PSGCLocation | null) => {
    setCascadingState(prev => ({
      ...prev,
      selectedBarangay: barangay,
    }));
    setPredictions([]);
  }, []);

  const resetCascadingSearch = useCallback(() => {
    setCascadingState({
      selectedRegion: null,
      selectedProvince: null,
      selectedCity: null,
      selectedBarangay: null,
    });
    setPredictions([]);
    setError(null);
  }, []);

  // Fetch location predictions from PSGC API
  const fetchPredictions = useCallback(async (query: string, level?: 'regions' | 'provinces' | 'cities' | 'barangays') => {
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
        let endpoint: string;
        const searchLevel = level || currentSearchLevel;

        // Build endpoint based on search level and parent selections
        switch (searchLevel) {
          case 'regions':
            endpoint = `${baseUrl}/regions?search=${encodeURIComponent(query)}`;
            break;
          case 'provinces':
            if (cascadingState.selectedRegion) {
              endpoint = `${baseUrl}/regions/${cascadingState.selectedRegion.psgc_id}/provinces?search=${encodeURIComponent(query)}`;
            } else {
              endpoint = `${baseUrl}/provinces?search=${encodeURIComponent(query)}`;
            }
            break;
          case 'cities':
            if (cascadingState.selectedProvince) {
              endpoint = `${baseUrl}/provinces/${cascadingState.selectedProvince.psgc_id}/cities-municipalities?search=${encodeURIComponent(query)}`;
            } else if (cascadingState.selectedRegion) {
              endpoint = `${baseUrl}/regions/${cascadingState.selectedRegion.psgc_id}/cities-municipalities?search=${encodeURIComponent(query)}`;
            } else {
              endpoint = `${baseUrl}/cities-municipalities?search=${encodeURIComponent(query)}`;
            }
            break;
          case 'barangays':
            if (cascadingState.selectedCity) {
              endpoint = `${baseUrl}/cities-municipalities/${cascadingState.selectedCity.psgc_id}/barangays?search=${encodeURIComponent(query)}`;
            } else if (cascadingState.selectedProvince) {
              endpoint = `${baseUrl}/provinces/${cascadingState.selectedProvince.psgc_id}/barangays?search=${encodeURIComponent(query)}`;
            } else if (cascadingState.selectedRegion) {
              endpoint = `${baseUrl}/regions/${cascadingState.selectedRegion.psgc_id}/barangays?search=${encodeURIComponent(query)}`;
            } else {
              endpoint = `${baseUrl}/barangays?search=${encodeURIComponent(query)}`;
            }
            break;
          default:
            endpoint = `${baseUrl}/regions?search=${encodeURIComponent(query)}`;
        }

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${searchLevel}`);
        }

        const data = await response.json();
        
        if (Array.isArray(data)) {
          const places = data.map((item: PSGCLocation) => ({
            psgc_id: item.psgc_id,
            name: item.name,
            geographic_level: item.geographic_level,
            full_address: `${item.name} (${getGeographicLevelName(item.geographic_level)})`,
            population: item.population
          }));

          // Sort by relevance (exact matches first, then by name length)
          places.sort((a, b) => {
            const aExact = a.name.toLowerCase() === query.toLowerCase();
            const bExact = b.name.toLowerCase() === query.toLowerCase();
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return a.name.length - b.name.length;
          });

          setPredictions(places.slice(0, 20));
        } else {
          setPredictions([]);
        }
      } catch {
        setError("Failed to fetch location data");
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [minQueryLength, baseUrl, debounceMs, currentSearchLevel, cascadingState]);

  // Get detailed location information
  const getLocationDetails = useCallback(async (psgcId: string): Promise<PSGCLocation | null> => {
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
    getLocationDetails,
    clearPredictions,
    cascadingState,
    setSelectedRegion,
    setSelectedProvince,
    setSelectedCity,
    setSelectedBarangay,
    resetCascadingSearch,
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
