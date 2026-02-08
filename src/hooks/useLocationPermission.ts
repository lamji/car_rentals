/* eslint-disable react-hooks/exhaustive-deps */
import { useCarsFromRedux } from "@/lib/data/cars";
import useGetCurrentLocation from "@/lib/npm-ready-stack/mapboxService/bl/hooks/useGetCurrentLocation";
import useNearestGarage from "@/lib/npm-ready-stack/mapboxService/bl/hooks/useNearestGarage";
import useReverseLocation from "@/lib/npm-ready-stack/mapboxService/bl/hooks/useReveseLocation";
import { setLoadingState, setNearestGarage, setRecalCulate } from "@/lib/slices/data";
import { setCurrentAddress, setPosition } from "@/lib/slices/mapBoxSlice";
import { RootState } from "@/lib/store";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useLocationPermission() {
  const dispatch = useDispatch();
  const stateRadius = useSelector((state: RootState) => state.data.radius);
  const carsFromRedux = useCarsFromRedux();
  const recalCulate = useSelector((state: RootState) => state.data.recalCulate);
  const currentPosition = useSelector((state: RootState) => state.mapBox.current.position);
  const { getCurrentLocation, loading } = useGetCurrentLocation();
  const { getNearestGarage } = useNearestGarage();
  const { getLocationName } = useReverseLocation();
  const locationCheckRef = useRef(false);
  const lastRadiusRef = useRef(stateRadius);

  const recalculateNearestGarages = useCallback(async () => {
    try {
      
      if (currentPosition && carsFromRedux.length > 0) {
        // Get nearest garage based on current location (no new location request)
        const nearestGarage = await getNearestGarage(carsFromRedux, currentPosition, stateRadius);
        const finalData = await Promise.all(nearestGarage.map(async (garage) => {
          // Use reverse geocoding to get readable address for garage location
          const readableAddress = await getLocationName(garage.lat, garage.lng);

          return {
            ...garage,
            address: readableAddress, // Add the readable address from reverse geocoding
            distanceText: garage.distanceText,
            carData: {
              ...garage.carData,
              garageAddress: readableAddress, // Update garageAddress with readable address
              distanceText: garage.distanceText,
              garageLocation: {
                ...garage.carData.garageLocation,
                address: readableAddress,
              }
            }
          };
        }));

        // Store the nearest garage data in Redux
        dispatch(setNearestGarage(finalData));
      }
    } catch (error) {
      console.error("debug-location: Failed to recalculate nearest garages:", error);
    }
  }, [carsFromRedux, currentPosition, dispatch, getNearestGarage, getLocationName, stateRadius]);

  const checkLocationPermission = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        dispatch(setLoadingState(true));
      }
      // Simply try to get location - this will trigger permission prompt if needed
      const locationData = await getCurrentLocation();

      if (locationData.position && locationData.address) {
        // Store the result in mapBoxSlice
        dispatch(setCurrentAddress(locationData.address));
        dispatch(setPosition(locationData.position));

        // Get nearest garage based on current location
        const nearestGarage = await getNearestGarage(carsFromRedux, locationData.position, stateRadius);
        const finalData = await Promise.all(nearestGarage.map(async (garage) => {
          // Use reverse geocoding to get readable address for garage location
          const readableAddress = await getLocationName(garage.lat, garage.lng);

          return {
            ...garage,
            address: readableAddress, // Add the readable address from reverse geocoding
            distanceText: garage.distanceText,
            carData: {
              ...garage.carData,
              garageAddress: readableAddress, // Update garageAddress with readable address
              distanceText: garage.distanceText,
              garageLocation: {
                ...garage.carData.garageLocation,
                address: readableAddress,
              }
            }
          };
        }));

        // Store the nearest garage data in Redux
        dispatch(setNearestGarage(finalData));
        if (!silent) {
          dispatch(setLoadingState(false));
        }
      }
    } catch (error) {
      console.error("debug-location: Failed to get location:", error);
      // Location permission denied or failed - user can manually select location via other UI
      if (!silent) {
        dispatch(setLoadingState(false));
      }
    }
  }, [getCurrentLocation, dispatch, getNearestGarage, getLocationName, stateRadius, carsFromRedux]);

  // Re-run search when recalCulate flag changes (triggered by Socket.IO) - use existing location
  useEffect(() => {
    if (recalCulate) {
      recalculateNearestGarages().then(() => {
        // Reset the flag after recalculation to allow future triggers
        dispatch(setRecalCulate());
      });
    }
  }, [recalCulate, recalculateNearestGarages, dispatch]);

  // Re-run search when radius changes and location is already available
  useEffect(() => {
    if (lastRadiusRef.current !== stateRadius && locationCheckRef.current) {
      lastRadiusRef.current = stateRadius;
      // Re-run the search with new radius
      checkLocationPermission();
    }
  }, [stateRadius, checkLocationPermission, carsFromRedux]);

  const checkLocationOnce = useCallback(() => {
    // Only run if not loading and not already checked
    if (!loading && !locationCheckRef.current) {
      locationCheckRef.current = true; // Mark as checked
      checkLocationPermission();
    }
  }, [loading, checkLocationPermission, carsFromRedux]);

  return {
    checkLocationOnce,
    loading
  };
}
