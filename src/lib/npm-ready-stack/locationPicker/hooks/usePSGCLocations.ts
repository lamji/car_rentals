"use client";

import { useCallback, useRef, useState } from "react";
import type {
  CascadingSearchState,
  PSGCLocation,
  PSGCRegion,
  UsePSGCLocationsOptions,
} from "../types";

/**
 * Helper function to get geographic level display name
 * @param level - Geographic level code
 * @returns {string} Human-readable level name
 */
function getGeographicLevelName(level: string): string {
  switch (level) {
    case "Reg": return "Region";
    case "Prov": return "Province";
    case "City": return "City/Municipality";
    case "Bgy": return "Barangay";
    default: return level;
  }
}

/**
 * Custom hook for PSGC (Philippine Standard Geographic Code) location data
 * Provides cascading location selection (Region -> Province -> City -> Barangay)
 * Uses direct API calls without Redux dependency for isolation
 * @param options - Configuration options (debounceMs, minQueryLength, baseUrl)
 * @returns {Object} Location data, loading states, and selection handlers
 */
export function usePSGCLocations(options: UsePSGCLocationsOptions = {}) {
  const {
    debounceMs = 300,
    baseUrl = "https://psgc.rootscratch.com",
  } = options;

  // Region state
  const [allRegions, setAllRegions] = useState<PSGCRegion[]>([]);
  const [filteredRegions, setFilteredRegions] = useState<PSGCRegion[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [regionQuery, setRegionQueryState] = useState("");

  // Province state
  const [allProvinces, setAllProvinces] = useState<PSGCLocation[]>([]);
  const [filteredProvinces, setFilteredProvinces] = useState<PSGCLocation[]>([]);
  const [provincesLoading, setProvincesLoading] = useState(false);

  // City state
  const [allCities, setAllCities] = useState<PSGCLocation[]>([]);
  const [filteredCities, setFilteredCities] = useState<PSGCLocation[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Barangay state
  const [allBarangays, setAllBarangays] = useState<PSGCLocation[]>([]);
  const [filteredBarangays, setFilteredBarangays] = useState<PSGCLocation[]>([]);
  const [barangaysLoading, setBarangaysLoading] = useState(false);

  // Cascading selection state
  const [cascadingState, setCascadingState] = useState<CascadingSearchState>({
    selectedRegion: null,
    selectedProvince: null,
    selectedCity: null,
    selectedBarangay: null,
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const regionsLoadedRef = useRef(false);

  /**
   * Fetch all regions from PSGC API
   * Caches results to prevent redundant API calls
   * @returns {Promise<void>}
   */
  const fetchRegions = useCallback(async () => {
    if (regionsLoadedRef.current && allRegions.length > 0) return;
    
    setRegionsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/region`);
      if (!response.ok) throw new Error("Failed to fetch regions");
      
      const data = await response.json();
      const regions = Array.isArray(data) ? data : [];
      setAllRegions(regions);
      setFilteredRegions(regions);
      regionsLoadedRef.current = true;
    } catch (error) {
      console.error("Error fetching regions:", error);
    } finally {
      setRegionsLoading(false);
    }
  }, [baseUrl, allRegions.length]);

  /**
   * Filter regions based on search query (client-side)
   * @param query - Search query string
   * @returns {void}
   */
  const filterRegions = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredRegions(allRegions);
      return;
    }
    const filtered = allRegions.filter(region =>
      region.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRegions(filtered);
  }, [allRegions]);

  /**
   * Set region query and trigger filtering
   * @param query - Search query string
   * @returns {void}
   */
  const setRegionQuery = useCallback((query: string) => {
    setRegionQueryState(query);
    filterRegions(query);
  }, [filterRegions]);

  /**
   * Fetch provinces for a selected region
   * @param regionId - PSGC ID of the selected region
   * @returns {Promise<void>}
   */
  const fetchProvinces = useCallback(async (regionId: string) => {
    setProvincesLoading(true);
    setAllProvinces([]);
    setFilteredProvinces([]);
    
    try {
      const response = await fetch(`${baseUrl}/province?id=${regionId}`);
      if (!response.ok) throw new Error("Failed to fetch provinces");
      
      const data = await response.json();
      const provinces = Array.isArray(data) ? data : [];
      setAllProvinces(provinces);
      setFilteredProvinces(provinces);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    } finally {
      setProvincesLoading(false);
    }
  }, [baseUrl]);

  /**
   * Filter provinces based on search query (client-side)
   * @param query - Search query string
   * @returns {void}
   */
  const setProvinceQuery = useCallback((query: string) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (!query.trim()) {
        setFilteredProvinces(allProvinces);
        return;
      }
      const filtered = allProvinces.filter(province =>
        province.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProvinces(filtered);
    }, debounceMs);
  }, [allProvinces, debounceMs]);

  /**
   * Fetch cities for a selected province
   * @param provinceId - PSGC ID of the selected province
   * @returns {Promise<void>}
   */
  const fetchCities = useCallback(async (provinceId: string) => {
    setCitiesLoading(true);
    setAllCities([]);
    setFilteredCities([]);
    
    try {
      const response = await fetch(`${baseUrl}/municipal-city?id=${provinceId}`);
      if (!response.ok) throw new Error("Failed to fetch cities");
      
      const data = await response.json();
      const cities = Array.isArray(data) ? data : [];
      setAllCities(cities);
      setFilteredCities(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setCitiesLoading(false);
    }
  }, [baseUrl]);

  /**
   * Filter cities based on search query (client-side)
   * @param query - Search query string
   * @returns {void}
   */
  const setCityQuery = useCallback((query: string) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (!query.trim()) {
        setFilteredCities(allCities);
        return;
      }
      const filtered = allCities.filter(city =>
        city.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCities(filtered);
    }, debounceMs);
  }, [allCities, debounceMs]);

  /**
   * Fetch barangays for a selected city
   * @param cityId - PSGC ID of the selected city
   * @returns {Promise<void>}
   */
  const fetchBarangays = useCallback(async (cityId: string) => {
    setBarangaysLoading(true);
    setAllBarangays([]);
    setFilteredBarangays([]);
    
    try {
      const response = await fetch(`${baseUrl}/barangay?id=${cityId}`);
      if (!response.ok) throw new Error("Failed to fetch barangays");
      
      const data = await response.json();
      const barangays = Array.isArray(data) ? data : [];
      setAllBarangays(barangays);
      setFilteredBarangays(barangays);
    } catch (error) {
      console.error("Error fetching barangays:", error);
    } finally {
      setBarangaysLoading(false);
    }
  }, [baseUrl]);

  /**
   * Filter barangays based on search query (client-side)
   * @param query - Search query string
   * @returns {void}
   */
  const setBarangayQuery = useCallback((query: string) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (!query.trim()) {
        setFilteredBarangays(allBarangays);
        return;
      }
      const filtered = allBarangays.filter(barangay =>
        barangay.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredBarangays(filtered);
    }, debounceMs);
  }, [allBarangays, debounceMs]);

  /**
   * Set selected region and fetch its provinces
   * Clears downstream selections (province, city, barangay)
   * @param region - Selected region or null to clear
   * @returns {void}
   */
  const setSelectedRegion = useCallback((region: PSGCRegion | null) => {
    setCascadingState(prev => ({
      ...prev,
      selectedRegion: region,
      selectedProvince: null,
      selectedCity: null,
      selectedBarangay: null,
    }));
    
    // Clear downstream data
    setAllProvinces([]);
    setFilteredProvinces([]);
    setAllCities([]);
    setFilteredCities([]);
    setAllBarangays([]);
    setFilteredBarangays([]);
    
    if (region) {
      setRegionQueryState(region.name);
      fetchProvinces(region.psgc_id);
    }
  }, [fetchProvinces]);

  /**
   * Set selected province and fetch its cities
   * Clears downstream selections (city, barangay)
   * @param province - Selected province or null to clear
   * @returns {void}
   */
  const setSelectedProvince = useCallback((province: PSGCLocation | null) => {
    setCascadingState(prev => ({
      ...prev,
      selectedProvince: province,
      selectedCity: null,
      selectedBarangay: null,
    }));
    
    // Clear downstream data
    setAllCities([]);
    setFilteredCities([]);
    setAllBarangays([]);
    setFilteredBarangays([]);
    
    if (province) {
      fetchCities(province.psgc_id);
    }
  }, [fetchCities]);

  /**
   * Set selected city and fetch its barangays
   * Clears downstream selection (barangay)
   * @param city - Selected city or null to clear
   * @returns {void}
   */
  const setSelectedCity = useCallback((city: PSGCLocation | null) => {
    setCascadingState(prev => ({
      ...prev,
      selectedCity: city,
      selectedBarangay: null,
    }));
    
    // Clear downstream data
    setAllBarangays([]);
    setFilteredBarangays([]);
    
    if (city) {
      fetchBarangays(city.psgc_id);
    }
  }, [fetchBarangays]);

  /**
   * Set selected barangay
   * @param barangay - Selected barangay or null to clear
   * @returns {void}
   */
  const setSelectedBarangay = useCallback((barangay: PSGCLocation | null) => {
    setCascadingState(prev => ({
      ...prev,
      selectedBarangay: barangay,
    }));
  }, []);

  /**
   * Reset all cascading search state
   * Clears all selections and data
   * @returns {void}
   */
  const resetCascadingSearch = useCallback(() => {
    setCascadingState({
      selectedRegion: null,
      selectedProvince: null,
      selectedCity: null,
      selectedBarangay: null,
    });
    setRegionQueryState("");
    setFilteredRegions(allRegions);
    setAllProvinces([]);
    setFilteredProvinces([]);
    setAllCities([]);
    setFilteredCities([]);
    setAllBarangays([]);
    setFilteredBarangays([]);
  }, [allRegions]);

  return {
    // Regions
    filteredRegions,
    regionsLoading,
    regionQuery,
    setRegionQuery,
    fetchRegions,
    
    // Provinces
    filteredProvinces,
    provincesLoading,
    setProvinceQuery,
    
    // Cities
    filteredCities,
    citiesLoading,
    setCityQuery,
    
    // Barangays
    filteredBarangays,
    barangaysLoading,
    setBarangayQuery,
    
    // Cascading state
    cascadingState,
    setSelectedRegion,
    setSelectedProvince,
    setSelectedCity,
    setSelectedBarangay,
    resetCascadingSearch,
  };
}

export { getGeographicLevelName };
