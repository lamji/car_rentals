import { useCallback, useState } from "react";
import useReverseLocation from "./useReveseLocation";

interface Position {
  lat: number;
  lng: number;
}

interface LocationData {
  position: Position | null;
  address: string | null;
  accuracy: number | null;
}

export default function useGetCurrentLocation() {
  const [locationData, setLocationData] = useState<LocationData>({
    position: null,
    address: null,
    accuracy: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getLocationName } = useReverseLocation();

  /**
   * Get the user's current location with coordinates and reverse geocoded address
   * Uses browser's geolocation API and Mapbox reverse geocoding
   * @returns {Promise<LocationData>} Location data with coordinates and address
   */
  const getCurrentLocation = useCallback(async (): Promise<LocationData> => {
    setLoading(true);
    setError(null);

    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
      }

      // Get current position using browser API
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes cache
          });
        },
      );

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      // Get reverse geocoded address
      const address = await getLocationName(coords.lat, coords.lng);

      const locationData: LocationData = {
        position: coords,
        address,
        accuracy: position.coords.accuracy,
      };

      setLocationData(locationData);
      return locationData;
    } catch (err) {
      let errorMessage = "Failed to get current location";

      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case err.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      const fallbackData: LocationData = {
        position: null,
        address: null,
        accuracy: null,
      };
      setLocationData(fallbackData);
      return fallbackData;
    } finally {
      setLoading(false);
    }
  }, [getLocationName]);

  /**
   * Watch the user's location for continuous updates
   * @param callback - Callback function called when location changes
   * @returns {number} Watch ID for clearing the watch
   */
  const watchLocation = useCallback(
    (callback?: (data: LocationData) => void) => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by this browser");
        return null;
      }

      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          try {
            const address = await getLocationName(coords.lat, coords.lng);
            const data: LocationData = {
              position: coords,
              address,
              accuracy: position.coords.accuracy,
            };

            setLocationData(data);
            callback?.(data);
          } catch (error) {
            console.error("Failed to get address for watched location:", error);
          }
        },
        (error) => {
          setError(`Location watch error: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // 1 minute cache for watch
        },
      );

      return watchId;
    },
    [getLocationName],
  );

  /**
   * Clear location watch
   * @param watchId - Watch ID returned from watchLocation
   */
  const clearWatch = useCallback((watchId: number) => {
    navigator.geolocation.clearWatch(watchId);
  }, []);

  return {
    // Current location data
    position: locationData.position,
    address: locationData.address,
    accuracy: locationData.accuracy,
    locationData,

    // State
    loading,
    error,

    // Actions
    getCurrentLocation,
    watchLocation,
    clearWatch,
  };
}
