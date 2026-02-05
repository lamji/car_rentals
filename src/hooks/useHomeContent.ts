"use client";

import { useSearchState } from "@/hooks/useSearchState";
import {
  SearchNearestGarageResponse,
  useNearestGarage,
} from "@/lib/api/useNearestGarage";
import type { CarType } from "@/lib/types";
import useGetCurrentLocation from "@/lib/npm-ready-stack/mapboxService/bl/hooks/useGetCurrentLocation";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useAppSelector } from "../lib/store";

export function useHomeContent() {
  const { state, setState } = useSearchState();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isNearestGarageModalOpen, setIsNearestGarageModalOpen] =
    useState(false);
  const [nearestGarageResults, setNearestGarageResults] =
    useState<SearchNearestGarageResponse | null>(null);
  const { searchNearestGarage } = useNearestGarage();
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const router = useRouter();
  const stateMapBox = useAppSelector((state) => state.mapBox);
  const stateData = useAppSelector((state) => state.data);
  
  // Location hook for retry functionality (same as LocationModal)
  const { getCurrentLocation: getMapboxCurrentLocation, loading: mapBoxLoading } = useGetCurrentLocation();
  
  // Custom loading state with delay
  const [delayedLoading, setDelayedLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to handle delayed loading
  useEffect(() => {
    if (mapBoxLoading) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // Set delayed loading to true immediately
      setDelayedLoading(true);
    } else {
      // When mapBoxLoading becomes false, wait 2 seconds before clearing delayedLoading
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      loadingTimeoutRef.current = setTimeout(() => {
        setDelayedLoading(false);
      }, 2000);
    }

    // Cleanup timeout on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [mapBoxLoading]);

  console.log("Hero - stateMapBox:", stateMapBox);

  const handleLocationSelect = useCallback(
    async (locationString: string) => {
      setState({ location: locationString }, { replace: true });
      setIsLocationModalOpen(false);

      // Trigger nearest garage search when location is selected from modal
      if (locationString.trim().length > 3) {
        try {
          const results = await searchNearestGarage({
            address: locationString,
            timeoutMs: 1500,
            progressIntervalMs: 300,
          });
          setNearestGarageResults(results);
          setIsNearestGarageModalOpen(true);
        } catch (error) {
          console.error("Error searching nearest garage:", error);
        }
      }
    },
    [setState, searchNearestGarage],
  );

  const handleClearLocation = useCallback(() => {
    setState({ location: "" });
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    setNearestGarageResults(null);
    setIsNearestGarageModalOpen(false);
  }, [setState, searchTimeout]);

  const handleLocationChange = useCallback(
    (value: string) => {
      console.log("handleLocationChange called with:", value);
      setState({ location: value });
      alert(value); // Testing alert

      // Clear existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Trigger nearest garage search with debouncing
      if (value.trim().length > 3) {
        const timeout = setTimeout(async () => {
          try {
            const results = await searchNearestGarage({
              address: value,
              timeoutMs: 1500,
              progressIntervalMs: 300,
            });
            setNearestGarageResults(results);
            setIsNearestGarageModalOpen(true);
          } catch (error) {
            console.error("Error searching nearest garage:", error);
          }
        }, 500); // 500ms debounce

        setSearchTimeout(timeout);
      }
    },
    [setState, searchNearestGarage, searchTimeout],
  );

  const handleRetryLocation = useCallback(() => {
    // Check if permission was denied and request it again
    if (stateMapBox.permissionDenied) {
      // For now, just try getting location - the permission request will happen in the hook
      getMapboxCurrentLocation();
      return;
    }
    getMapboxCurrentLocation();
  }, [getMapboxCurrentLocation, stateMapBox.permissionDenied]);

  const handleSelectGarage = useCallback(
    (carId: string) => {
      console.log("Selected car:", carId);
      setIsNearestGarageModalOpen(false);

      // Extract car ID from the listing ID (format: "car-listing-{carId}")
      const actualCarId = carId.replace("car-listing-", "");

      // Redirect to car details page
      router.push(`/cars/${actualCarId}`);
    },
    [router],
  );

  const detailsHrefFor = useCallback(
    (id: string) => {
      const params = new URLSearchParams();

      if (state.location) params.set("location", state.location);
      if (state.startDate) params.set("start", state.startDate);
      if (state.endDate) params.set("end", state.endDate);
      if (state.carType) params.set("type", state.carType);

      const queryString = params.toString();
      return `/cars/${encodeURIComponent(id)}${queryString ? `?${queryString}` : ""}`;
    },
    [state],
  );

  // Category filtering
  const categories: { label: string; value: CarType | "all" }[] = [
    { label: "All Cars", value: "all" },
    { label: "SUV", value: "suv" },
    { label: "Sedan", value: "sedan" },
    { label: "Van", value: "van" },
  ];

  const radiusList = [25, 50, 100, 200];

  const [selectedCategory, setSelectedCategory] = useState<CarType | "all">(
    "all",
  );

  const filteredCars = useMemo(() => {
    // Extract car data from nearest garages or use empty array as fallback
    const cars = stateData.nearestGarages.length > 0 
      ? stateData.nearestGarages.map((garage: any) => garage.carData)
      : stateData.cars;
    
    if (selectedCategory === "all") return cars;
    return cars.filter((car: any) => car.type === selectedCategory);
  }, [selectedCategory, stateData.cars, stateData.nearestGarages]);

  return {
    // State
    state,
    isLocationModalOpen,
    isNearestGarageModalOpen,
    nearestGarageResults,
    selectedCategory,
    filteredCars,
    categories,
    radiusList,
    // Actions
    setIsLocationModalOpen,
    setIsNearestGarageModalOpen,
    setSelectedCategory,
    handleLocationSelect,
    handleClearLocation,
    handleLocationChange,
    handleRetryLocation,
    handleSelectGarage,
    detailsHrefFor,
    currentAddress: stateMapBox.current.address,
    mapBoxLoading: delayedLoading
  };
}
