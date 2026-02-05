import { useCallback, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useGetCurrentLocation from "@/lib/npm-ready-stack/mapboxService/bl/hooks/useGetCurrentLocation";
import useReverseLocation from "@/lib/npm-ready-stack/mapboxService/bl/hooks/useReveseLocation";
import { setCurrentAddress, setPosition } from "@/lib/slices/mapBoxSlice";
import { setLoadingState, setNearestGarage } from "@/lib/slices/data";
import useNearestGarage from "@/lib/npm-ready-stack/mapboxService/bl/hooks/useNearestGarage";
import { CARS } from "@/lib/data/cars";
import { RootState } from "@/lib/store";

export function useLocationPermission() {
  const dispatch = useDispatch();
  const { getCurrentLocation, loading } = useGetCurrentLocation();
  const { getNearestGarage } = useNearestGarage();
  const { getLocationName } = useReverseLocation();
  const locationCheckRef = useRef(false);
  const stateRadius = useSelector((state: RootState) => state.data.radius);
  const lastRadiusRef = useRef(stateRadius);
  console.log("test:state radius", stateRadius);

  const checkLocationPermission = useCallback(async () => {
    try {
      dispatch(setLoadingState(true));
      // Simply try to get location - this will trigger permission prompt if needed
      const locationData = await getCurrentLocation();

      if (locationData.position && locationData.address) {
        // Store the result in mapBoxSlice
        dispatch(setPosition(locationData.position));
        dispatch(setCurrentAddress(locationData.address));
        console.log("debug-location: Location permission granted", { locationData });

        /**
         * Get the nearest garage
         * @param data - all cars data
         * @param position - user's current position {lat, lng}
         * @param radius - radius in kilometers
         */
        const nearestGarage = await getNearestGarage(CARS, locationData.position, stateRadius);
        const finalData = await Promise.all(nearestGarage.map(async (garage) => {


          // Use reverse geocoding to get readable address for garage location
          const readableAddress = await getLocationName(garage.lat, garage.lng);
          console.log("debug-location: Processing garage", { garageId: garage.id, readableAddress });

          return {
            ...garage,
            address: readableAddress, // Add the readable address from reverse geocoding
            distanceText: garage.distanceText,
            carData: {
              ...garage.carData,
              garageAddress: readableAddress, // Update garageAddress with readable address
              distanceText: garage.distanceText,
            }
          };
        }));
        console.log("debug-location: Final garage data with readable addresses", { finalData });

        // Store the nearest garage data in Redux
        dispatch(setNearestGarage(finalData));
        dispatch(setLoadingState(false));
      }
    } catch (error) {
      console.error("debug-location: Failed to get location:", error);
      // Location permission denied or failed - user can manually select location via other UI
      dispatch(setLoadingState(false));
    }
  }, [getCurrentLocation, dispatch, getNearestGarage, getLocationName, stateRadius]);

  // Re-run search when radius changes and location is already available
  useEffect(() => {
    if (lastRadiusRef.current !== stateRadius && locationCheckRef.current) {
      console.log("debug-location: Radius changed, re-running search", {
        oldRadius: lastRadiusRef.current,
        newRadius: stateRadius
      });
      lastRadiusRef.current = stateRadius;

      // Re-run the search with new radius
      checkLocationPermission();
    }
  }, [stateRadius, checkLocationPermission]);

  const checkLocationOnce = useCallback(() => {
    // Only run if not loading and not already checked
    if (!loading && !locationCheckRef.current) {
      locationCheckRef.current = true; // Mark as checked
      checkLocationPermission();
    }
  }, [loading, checkLocationPermission]);

  return {
    checkLocationOnce,
    loading
  };
}
