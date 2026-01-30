import { useState } from "react";

interface Point {
  lat: number;
  lng: number;
}

export default function useReverseLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Convert latitude and longitude coordinates to human-readable location name
   * @param lat - Latitude coordinate
   * @param lng - Longitude coordinate
   * @returns {Promise<string>} Location name or error message
   */
  const getLocationName = async (lat: number, lng: number): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      // Using Mapbox Geocoding API for reverse geocoding
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!token) {
        throw new Error("Mapbox access token is required");
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address,place,locality,neighborhood`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        // Return the most specific place name available
        const placeName = data.features[0]?.place_name || "Unknown location";
        return placeName;
      } else {
        return "Unknown location";
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch location";
      setError(errorMessage);
      return "Unknown location";
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get location name from point object
   * @param point - Point object with lat and lng coordinates
   * @returns {Promise<string>} Location name or error message
   */
  const getLocationNameFromPoint = async (point: Point): Promise<string> => {
    return getLocationName(point.lat, point.lng);
  };

  return {
    getLocationName,
    getLocationNameFromPoint,
    loading,
    error,
  };
}
