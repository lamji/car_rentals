"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  GeocodedAddress,
  GeolocationState,
  UseGeolocationOptions,
} from "../types";

/**
 * Reverse geocode coordinates to address using OpenStreetMap Nominatim API
 * @param lat - Latitude coordinate
 * @param lng - Longitude coordinate
 * @returns {Promise<GeocodedAddress | null>} Geocoded address or null
 */
async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<GeocodedAddress | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Use OpenStreetMap Nominatim API for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: { "User-Agent": "LocationPickerApp/1.0" },
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.error) return null;

    const address = data.address || {};

    return {
      formattedAddress: data.display_name || "Unknown address",
      street:
        address.road || address.pedestrian || address.residential || undefined,
      city: address.city || address.town || address.village || undefined,
      municipality:
        address.municipality || address.city || address.town || undefined,
      province: address.state || address.province || undefined,
      region: address.region || undefined,
      barangay: address.suburb || address.neighbourhood || undefined,
      country: address.country || undefined,
      postalCode: address.postcode || undefined,
    };
  } catch {
    return {
      formattedAddress: "Location unavailable",
      city: "Unknown",
      municipality: "Unknown",
      province: "Unknown",
    };
  }
}

/**
 * Get error message from GeolocationPositionError
 * @param error - Geolocation position error
 * @returns {string} Human-readable error message
 */
function getErrorMessage(error: GeolocationPositionError): string {
  if (!error) return "Unknown geolocation error occurred";

  switch (error.code) {
    case 1:
      return "Location access denied. Please enable location permissions.";
    case 2:
      return "Location information is unavailable.";
    case 3:
      return "Location request timed out. Please try again.";
    default:
      return error.message || "An unknown error occurred.";
  }
}

/**
 * Detect if running on iOS device
 * @returns {boolean} True if iOS device detected
 */
function isIOSDevice(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * Detect if running as PWA on iOS
 * @returns {boolean} True if running as PWA on iOS
 */
function isIOSPWA(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    isIOSDevice() &&
    (nav.standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches)
  );
}

/**
 * Custom hook for browser geolocation with reverse geocoding
 * Provides current position, address resolution, and permission handling
 * Includes iOS PWA-specific location permission handling
 * @param options - Geolocation options (enableHighAccuracy, timeout, maximumAge)
 * @returns {GeolocationState & methods} Geolocation state and control methods
 */
export function useGeolocation(options?: UseGeolocationOptions) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    address: null,
    error: null,
    loading: false,
    permissionGranted: null,
    permissionDenied: false,
  });

  const [userInteractionRequired, setUserInteractionRequired] = useState(false);

  /**
   * Request current position from browser geolocation API with iOS PWA support
   * Automatically performs reverse geocoding on success
   * Handles iOS PWA-specific permission requirements
   * @returns {void}
   */
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: { code: 0, message: "Geolocation is not supported" },
        loading: false,
      }));
      return;
    }

    // For iOS PWA, we need to ensure user interaction before requesting location
    if (isIOSPWA()) {
      setUserInteractionRequired(true);
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    // iOS PWA specific options
    const iosOptions = isIOSDevice()
      ? {
          enableHighAccuracy: false, // Start with low accuracy for iOS
          timeout: 15000, // Longer timeout for iOS
          maximumAge: 300000, // 5 minutes cache for iOS
        }
      : {};

    const geolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...iosOptions,
      ...options,
    };

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserInteractionRequired(false);
          const locationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          // Reverse geocode the coordinates
          reverseGeocode(locationData.lat, locationData.lng)
            .then((address) => {
              setState({
                position: locationData,
                address,
                error: null,
                loading: false,
                permissionGranted: true,
                permissionDenied: false,
              });
            })
            .catch(() => {
              setState({
                position: locationData,
                address: null,
                error: null,
                loading: false,
                permissionGranted: true,
                permissionDenied: false,
              });
            });
        },
        (error) => {
          setUserInteractionRequired(false);
          const errorMessage = getErrorMessage(error);
          const isPermissionDenied = error?.code === 1;

          // For iOS PWA, provide specific guidance
          if (isIOSPWA() && isPermissionDenied) {
            setState((prev) => ({
              ...prev,
              error: {
                code: error?.code || 0,
                message:
                  "Location access denied. Please go to Settings > Privacy & Security > Location Services and enable location for this app.",
              },
              loading: false,
              permissionGranted: false,
              permissionDenied: true,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              error: { code: error?.code || 0, message: errorMessage },
              loading: false,
              permissionGranted: false,
              permissionDenied: isPermissionDenied,
            }));
          }
        },
        geolocationOptions,
      );
    } catch {
      setUserInteractionRequired(false);
      setState((prev) => ({
        ...prev,
        error: {
          code: 0,
          message: "Location services are temporarily unavailable",
        },
        loading: false,
      }));
    }
  }, [options]);

  /**
   * Request location permission by triggering getCurrentPosition
   * Resets permission denied state before requesting
   * @returns {void}
   */
  const requestLocationPermission = useCallback(() => {
    setState((prev) => ({
      ...prev,
      permissionDenied: false,
      error: null,
    }));
    getCurrentPosition();
  }, [getCurrentPosition]);

  /**
   * Reset permission state to allow retry after accidental denial
   * Clears all permission and error states for fresh request
   * Also checks current browser permission status
   * @returns {void}
   */
  const resetPermissionState = useCallback(() => {
    setState((prev) => ({
      ...prev,
      permissionGranted: null,
      permissionDenied: false,
      error: null,
      loading: false,
    }));
    setUserInteractionRequired(false);

    // Re-check browser permission status after reset
    if ("permissions" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          const isGranted = result.state === "granted";
          const isDenied = result.state === "denied";

          setState((prev) => ({
            ...prev,
            permissionGranted: isGranted,
            permissionDenied: isDenied,
          }));
        })
        .catch(() => {
          // Permissions API not supported, continue with reset
        });
    }
  }, []);

  // Check permission status on mount
  useEffect(() => {
    if ("permissions" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          const isGranted = result.state === "granted";
          const isDenied = result.state === "denied";

          setState((prev) => ({
            ...prev,
            permissionGranted: isGranted,
            permissionDenied: isDenied,
          }));
        })
        .catch(() => {
          // Permissions API not supported or failed
        });
    }
  }, []);

  return {
    ...state,
    getCurrentPosition,
    requestLocationPermission,
    resetPermissionState,
    userInteractionRequired,
    isIOSDevice: isIOSDevice(),
    isIOSPWA: isIOSPWA(),
  };
}
