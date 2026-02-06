/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSearchState } from "@/hooks/useSearchState";
import {
  SearchNearestGarageResponse,
  useNearestGarage,
} from "@/lib/api/useNearestGarage";
import { CARS } from "@/lib/data/cars";
import type { LocationData } from "@/lib/npm-ready-stack/locationPicker/types";
import useGetCurrentLocation from "@/lib/npm-ready-stack/mapboxService/bl/hooks/useGetCurrentLocation";
import useNearestGarageHook from "@/lib/npm-ready-stack/mapboxService/bl/hooks/useNearestGarage";
import useReverseLocation from "@/lib/npm-ready-stack/mapboxService/bl/hooks/useReveseLocation";
import { clearLocationInputs, setCurrentAddress, setPosition } from "@/lib/slices/mapBoxSlice";
import type { CarType } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/store";



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
  const dispatch = useAppDispatch();
  const stateMapBox = useAppSelector((state) => state.mapBox);
  const stateData = useAppSelector((state) => state.data);
  
  // Location hook for retry functionality (same as LocationModal)
  const { getCurrentLocation: getMapboxCurrentLocation, loading: mapBoxLoading } = useGetCurrentLocation();
  
  // Nearest garage hook for coordinate-based searching
  const { getNearestGarage } = useNearestGarageHook();
  
  // Reverse geocoding hook for getting readable addresses
  const { getLocationName } = useReverseLocation();
  
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
    async (locationString: string, locationData?: LocationData) => {
      console.log("Hero - locationData:", locationData);
      setState({ location: locationString }, { replace: true });
      setIsLocationModalOpen(false);

      // Use the coordinates directly for nearest garage search
      try {
        // We need to get coordinates from the location string
        // But since LocationModal already geocoded it, we should get those coordinates
        // For now, let's geocode again (we can optimize this later)
        const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationString)}.json`;
        const params = new URLSearchParams({
          access_token: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
          limit: '1',
          country: 'PH'
        });
        
        const response = await fetch(`${geocodingUrl}?${params}`);
        if (!response.ok) {
          throw new Error(`Geocoding failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          const coordinates = { lat, lng };
          
          console.log("debug-location: Using coordinates from LocationModal for nearest garage search", { locationString, coordinates });
          
          // Debug: Check car data and coordinates
          const carDataToUse = (stateData.cars && stateData.cars.length > 0) ? stateData.cars : CARS;
          console.log("debug-location: Car data being used", { 
            stateDataCars: stateData.cars?.length || 0, 
            fallbackCars: CARS.length,
            totalCars: carDataToUse.length,
            coordinates,
            radius: 25
          });
              
          // Use the hook to find nearest garages by coordinates
          const garageResults = await getNearestGarage(carDataToUse, coordinates, 25);

          // Convert hook results to API NearestGarageResult format
          const convertedResults = await Promise.all(garageResults.map(async (garage) => {
            // Check if today is in unavailable dates (same logic as hook)
            const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
            const isUnavailableToday = garage.carData.availability.unavailableDates.includes(today);
            
            // Use reverse geocoding to get readable address for garage location
            const readableAddress = await getLocationName(garage.lat, garage.lng);
            
            return {
              id: garage.id,
              carId: garage.carData.id,
              carName: garage.carData.name,
              carYear: garage.carData.year,
              carImage: garage.carData.imageUrls[0],
              carType: garage.carData.type,
              seats: garage.carData.seats,
              transmission: garage.carData.transmission,
              selfDrive: garage.carData.selfDrive || false,
              distance: garage.distance,
              garageAddress: readableAddress, // Use reverse geocoded address
              available: !isUnavailableToday, // Use proper availability logic
              ownerName: garage.carData.owner.name,
              ownerContact: garage.carData.owner.contactNumber
            };
          }));
          
          // Convert to match SearchNearestGarageResponse format
          const response: SearchNearestGarageResponse = {
            success: true,
            garages: convertedResults,
            searchAddress: locationString,
            timestamp: new Date().toISOString()
          };
          
          setNearestGarageResults(response);
          setIsNearestGarageModalOpen(true);

          // Update the Redux address and location
          dispatch(setCurrentAddress(locationString));
          dispatch(setPosition(coordinates));
        } else {
          console.warn("debug-location: Could not geocode location string", { locationString });
        }
      } catch (error) {
        console.error("Error searching nearest garage:", error);
      }
    },
    [setState, stateData.cars, getNearestGarage, dispatch, getLocationName],
  );

  const handleClearLocation = useCallback(() => {
    // console.log("handleClearLocation called",{storeState});
    dispatch(clearLocationInputs())
    dispatch(setCurrentAddress(''))
    dispatch(setPosition({ lat: 0, lng: 0 }))
    setState({ location: "" });
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    setNearestGarageResults(null);
    setIsNearestGarageModalOpen(false);
  }, [dispatch, setState, searchTimeout]);

  

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
