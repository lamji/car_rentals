"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { 
  fetchRegions, 
  filterRegions, 
  selectAllRegions, 
  selectFilteredRegions, 
  selectRegionsLoading, 
  selectRegionsError,
  selectShouldRefetchRegions,
  PSGCRegion 
} from "@/lib/slices/regionsSlice";

// PSGC API types for other levels
interface PSGCLocation {
  psgc_id: string;
  name: string;
  correspondence_code: string;
  geographic_level: "Reg" | "Prov" | "City" | "Bgy";
  old_names: string;
  city_class: string;
  income_classification: string;
  urban_rural: string;
  population: string;
  status: string;
}

interface PSGCPlace {
  psgc_id: string;
  name: string;
  geographic_level: string;
  full_address: string;
  population?: string;
}

interface UseReduxPSGCLocationsOptions {
  debounceMs?: number;
  minQueryLength?: number;
  baseUrl?: string;
  autoFetchRegions?: boolean;
  regionCacheTime?: number; // in milliseconds
}

interface CascadingSearchState {
  selectedRegion: PSGCRegion | null;
  selectedProvince: PSGCLocation | null;
  selectedCity: PSGCLocation | null;
  selectedBarangay: PSGCLocation | null;
}

interface UseReduxPSGCLocationsReturn {
  // Regions (from Redux)
  allRegions: PSGCRegion[];
  filteredRegions: PSGCRegion[];
  regionsLoading: boolean;
  regionsError: string | null;
  regionQuery: string;
  setRegionQuery: (query: string) => void;
  
  // Other levels (from API)
  predictions: PSGCPlace[];
  isLoading: boolean;
  error: string | null;
  fetchPredictions: (query: string, level?: 'provinces' | 'cities' | 'barangays') => void;
  getLocationDetails: (psgcId: string) => Promise<PSGCLocation | null>;
  clearPredictions: () => void;
  
  // Cascading state
  cascadingState: CascadingSearchState;
  setSelectedRegion: (region: PSGCRegion | null) => void;
  setSelectedProvince: (province: PSGCLocation | null) => void;
  setSelectedCity: (city: PSGCLocation | null) => void;
  setSelectedBarangay: (barangay: PSGCLocation | null) => void;
  resetCascadingSearch: () => void;
}

export function useReduxPSGCLocations(options: UseReduxPSGCLocationsOptions = {}): UseReduxPSGCLocationsReturn {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    baseUrl = "https://psgc.rootscratch.com",
    autoFetchRegions = true,
    regionCacheTime = 24 * 60 * 60 * 1000, // 24 hours
  } = options;

  // Redux hooks for regions
  const dispatch = useAppDispatch();
  const allRegions = useAppSelector(selectAllRegions);
  const filteredRegions = useAppSelector(selectFilteredRegions);
  const regionsLoading = useAppSelector(selectRegionsLoading);
  const regionsError = useAppSelector(selectRegionsError);
  const shouldRefetch = useAppSelector((state) => selectShouldRefetchRegions(state, regionCacheTime));

  // Local state for region query
  const [regionQuery, setRegionQuery] = useState("");

  // Local state for other levels
  const [predictions, setPredictions] = useState<PSGCPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSearchLevel, setCurrentSearchLevel] = useState<'regions' | 'provinces' | 'cities' | 'barangays'>('regions');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cascading search state
  const [cascadingState, setCascadingState] = useState<CascadingSearchState>({
    selectedRegion: null,
    selectedProvince: null,
    selectedCity: null,
    selectedBarangay: null,
  });

  // Auto-fetch regions on first render or when cache expires
  useEffect(() => {
    console.log('🚀 Hook useEffect - Auto-fetch check:');
    console.log('  - autoFetchRegions:', autoFetchRegions);
    console.log('  - allRegions.length:', allRegions.length);
    console.log('  - shouldRefetch:', shouldRefetch);
    console.log('  - regionsLoading:', regionsLoading);
    console.log('  - regionsError:', regionsError);
    
    if (autoFetchRegions && (allRegions.length === 0 || shouldRefetch)) {
      console.log('🔄 Fetching regions...');
      dispatch(fetchRegions());
    } else {
      console.log('✅ Using cached regions - NOT fetching');
    }
  }, [dispatch, autoFetchRegions, allRegions.length, shouldRefetch, regionsLoading, regionsError]);

  // Handle region query change (client-side filtering)
  const handleRegionQueryChange = useCallback((query: string) => {
    console.log('🔍 Hook handleRegionQueryChange:', query);
    setRegionQuery(query);
    dispatch(filterRegions(query));
  }, [dispatch]);

  // Setters for cascading state
  const setSelectedRegion = useCallback((region: PSGCRegion | null) => {
    console.log('🎯 Region selected:', region?.name);
    setCascadingState(prev => ({
      ...prev,
      selectedRegion: region,
      selectedProvince: null,
      selectedCity: null,
      selectedBarangay: null,
    }));
    setPredictions([]);
    setError(null);
    if (region) {
      setRegionQuery(region.name);
      dispatch(filterRegions(region.name));
      setCurrentSearchLevel('provinces');
      console.log('🔄 Ready to search provinces in region:', region.psgc_id);
    } else {
      setCurrentSearchLevel('regions');
    }
  }, [dispatch]);

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
    setRegionQuery("");
    dispatch(filterRegions(""));
  }, [dispatch]);

  // Fetch predictions for non-region levels
  const fetchPredictions = useCallback(async (query: string, level?: 'provinces' | 'cities' | 'barangays') => {
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

        console.log('🔍 Fetching predictions for level:', searchLevel);
        console.log('🔍 Query:', query);
        console.log('🔍 Selected region:', cascadingState.selectedRegion?.name, cascadingState.selectedRegion?.psgc_id);

        // Build endpoint based on search level and parent selections
        switch (searchLevel) {
          case 'provinces':
            if (cascadingState.selectedRegion) {
              // Use the region's psgc_id to fetch provinces
              endpoint = `${baseUrl}/province?id=${cascadingState.selectedRegion.psgc_id}`;
              console.log('📡 Provinces endpoint:', endpoint);
            } else {
              endpoint = `${baseUrl}/province?search=${encodeURIComponent(query)}`;
              console.log('📡 All provinces endpoint:', endpoint);
            }
            break;
          case 'cities':
            if (cascadingState.selectedProvince) {
              endpoint = `${baseUrl}/municipal-city?id=${cascadingState.selectedProvince.psgc_id}`;
              console.log('📡 Cities endpoint:', endpoint);
            } else if (cascadingState.selectedRegion) {
              endpoint = `${baseUrl}/city-municipality?id=${cascadingState.selectedRegion.psgc_id}`;
            } else {
              endpoint = `${baseUrl}/city-municipality?search=${encodeURIComponent(query)}`;
            }
            break;
          case 'barangays':
            if (cascadingState.selectedCity) {
              endpoint = `${baseUrl}/barangay?id=${cascadingState.selectedCity.psgc_id}`;
              console.log('📡 Barangays endpoint:', endpoint);
            } else if (cascadingState.selectedProvince) {
              endpoint = `${baseUrl}/barangay?id=${cascadingState.selectedProvince.psgc_id}`;
            } else if (cascadingState.selectedRegion) {
              endpoint = `${baseUrl}/barangay?id=${cascadingState.selectedRegion.psgc_id}`;
            } else {
              endpoint = `${baseUrl}/barangay?search=${encodeURIComponent(query)}`;
            }
            break;
          default:
            endpoint = `${baseUrl}/province?search=${encodeURIComponent(query)}`;
        }

        const response = await fetch(endpoint);
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${searchLevel}`);
        }

        const data = await response.json();
        console.log('📊 Received data:', data);
        
        if (Array.isArray(data)) {
          const places = data.map((item: PSGCLocation) => ({
            psgc_id: item.psgc_id,
            name: item.name,
            geographic_level: item.geographic_level,
            full_address: `${item.name} (${getGeographicLevelName(item.geographic_level)})`,
            population: item.population
          }));

          // Filter by search query if needed (for endpoints that don't support search parameter)
          const filteredPlaces = query && endpoint.includes('search=') 
            ? places 
            : places.filter((place: PSGCPlace) => 
                place.name.toLowerCase().includes(query.toLowerCase())
              );

          // Sort by relevance (exact matches first, then by name length)
          filteredPlaces.sort((a, b) => {
            const aExact = a.name.toLowerCase() === query.toLowerCase();
            const bExact = b.name.toLowerCase() === query.toLowerCase();
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return a.name.length - b.name.length;
          });

          console.log('📝 Final filtered places:', filteredPlaces.length);
          setPredictions(filteredPlaces.slice(0, 20));
        } else {
          console.log('📊 Data is not an array:', data);
          setPredictions([]);
        }
      } catch (err) {
        console.error('❌ Fetch predictions error:', err);
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
        endpoint = `${baseUrl}/region/${psgcId}`;
      } else if (psgcId.length === 9) {
        endpoint = `${baseUrl}/province/${psgcId}`;
      } else if (psgcId.length === 9) {
        endpoint = `${baseUrl}/city-municipality/${psgcId}`;
      } else {
        endpoint = `${baseUrl}/barangay/${psgcId}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Location not found');
      }

      const data = await response.json();
      return data;
    } catch (err) {
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
    // Regions (from Redux)
    allRegions,
    filteredRegions,
    regionsLoading,
    regionsError,
    regionQuery,
    setRegionQuery: handleRegionQueryChange,
    
    // Other levels (from API)
    predictions,
    isLoading,
    error,
    fetchPredictions,
    getLocationDetails,
    clearPredictions,
    
    // Cascading state
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
