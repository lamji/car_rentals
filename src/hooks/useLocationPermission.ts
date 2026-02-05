import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import useGetCurrentLocation from "@/lib/npm-ready-stack/mapboxService/bl/hooks/useGetCurrentLocation";
import { setCurrentAddress, setPosition } from "@/lib/slices/mapBoxSlice";

export function useLocationPermission() {
  const dispatch = useDispatch();
  const { getCurrentLocation, loading } = useGetCurrentLocation();
  const locationCheckRef = useRef(false);

  const checkLocationPermission = useCallback(async () => {
    try {
      // Simply try to get location - this will trigger permission prompt if needed
      const locationData = await getCurrentLocation();
      
      if (locationData.position && locationData.address) {
        // Store the result in mapBoxSlice
        dispatch(setPosition(locationData.position));
        dispatch(setCurrentAddress(locationData.address));
      }
    } catch (error) {
      console.error("debug-location: Failed to get location:", error);
      // Location permission denied or failed - user can manually select location via other UI
    }
  }, [getCurrentLocation, dispatch]);

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
