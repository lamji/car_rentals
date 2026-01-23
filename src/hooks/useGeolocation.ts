"use client";

import { useState, useEffect, useCallback } from "react";
import { reverseGeocode, GeocodedAddress } from "@/utils/geocoding";

export type GeolocationPosition = {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
};

export type GeolocationError = {
  code: number;
  message: string;
};

export type GeolocationState = {
  position: GeolocationPosition | null;
  address: GeocodedAddress | null;
  error: GeolocationError | null;
  loading: boolean;
  permissionGranted: boolean | null;
  permissionDenied: boolean;
};

export function useGeolocation(options?: PositionOptions) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    address: null,
    error: null,
    loading: false,
    permissionGranted: null,
    permissionDenied: false,
  });

  const getCurrentPosition = useCallback(() => {
    console.log('🗺️ Geolocation: Requesting current position...');
    
    if (!navigator.geolocation) {
      console.error('❌ Geolocation: Not supported by this browser');
      setState(prev => ({
        ...prev,
        error: { code: 0, message: "Geolocation is not supported by this browser" },
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          
          console.log('✅ Geolocation: Location received', locationData);
          
          // Get address from coordinates
          reverseGeocode(locationData.lat, locationData.lng)
            .then(address => {
              console.log('📍 Geolocation: Address resolved', address);
              console.log('📍 Geolocation: Location details:', {
                region: address?.region,
                province: address?.province,
                city: address?.city || address?.municipality,
                barangay: address?.barangay,
                fullAddress: address?.formattedAddress
              });
              setState({
                position: locationData,
                address,
                error: null,
                loading: false,
                permissionGranted: true,
                permissionDenied: false,
              });
            })
            .catch(error => {
              console.warn('⚠️ Geolocation: Could not resolve address', error);
              // Still set position even if address resolution fails
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
          console.log('🔍 Geolocation: Raw error object:', error);
          console.log('🔍 Geolocation: Error properties:', Object.keys(error));
          
          const errorMessage = getErrorMessage(error);
          const isPermissionDenied = error?.code === 1; // PERMISSION_DENIED
          
          console.log('ℹ️ Geolocation: Location access not available', {
            code: error?.code,
            message: errorMessage,
            isPermissionDenied,
            timestamp: new Date().toISOString()
          });
          
          setState(prev => ({
            ...prev,
            error: { code: error?.code || 0, message: errorMessage },
            loading: false,
            permissionGranted: false,
            permissionDenied: isPermissionDenied,
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
          ...options,
        }
      );
    } catch (catchError) {
      console.log('ℹ️ Geolocation: Unexpected error during location request', catchError);
      setState(prev => ({
        ...prev,
        error: { code: 0, message: "Location services are temporarily unavailable" },
        loading: false,
      }));
    }
  }, [options]);

  const watchPosition = useCallback(() => {
    console.log('🗺️ Geolocation: Starting position watching...');
    
    if (!navigator.geolocation) {
      console.error('❌ Geolocation: Not supported by this browser');
      setState(prev => ({
        ...prev,
        error: { code: 0, message: "Geolocation is not supported by this browser" },
        loading: false,
      }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        
        console.log('🔄 Geolocation: Position updated', locationData);
        
        // Get address from coordinates
        reverseGeocode(locationData.lat, locationData.lng)
          .then(address => {
            console.log('📍 Geolocation: Address resolved (watch)', address);
            console.log('📍 Geolocation: Location details (watch):', {
              region: address?.region,
              province: address?.province,
              city: address?.city || address?.municipality,
              barangay: address?.barangay,
              fullAddress: address?.formattedAddress
            });
            setState({
              position: locationData,
              address,
              error: null,
              loading: false,
              permissionGranted: true,
              permissionDenied: false,
            });
          })
          .catch(error => {
            console.warn('⚠️ Geolocation: Could not resolve address', error);
            // Still set position even if address resolution fails
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
        const errorMessage = getErrorMessage(error);
        console.log('ℹ️ Geolocation: Location watching failed', {
          code: error.code,
          message: errorMessage,
          timestamp: new Date().toISOString()
        });
        
        setState(prev => ({
          ...prev,
          error: { code: error.code, message: errorMessage },
          loading: false,
          permissionGranted: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    );

    console.log('🗺️ Geolocation: Watch started with ID:', watchId);
    return watchId;
  }, [options]);

  const clearWatch = useCallback((watchId: number) => {
    console.log('🗺️ Geolocation: Clearing watch with ID:', watchId);
    navigator.geolocation.clearWatch(watchId);
  }, []);

  // Request location permission specifically
  const requestLocationPermission = useCallback(() => {
    console.log('🔐 Geolocation: Requesting location permission...');
    
    // Reset permission denied state when requesting
    setState(prev => ({
      ...prev,
      permissionDenied: false,
      error: null,
    }));
    
    getCurrentPosition();
  }, [getCurrentPosition]);

  // Check permission status on mount
  useEffect(() => {
    console.log('🗺️ Geolocation: Checking permission status...');
    
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        console.log('🔐 Geolocation: Permission status:', result.state);
        const isGranted = result.state === 'granted';
        const isDenied = result.state === 'denied';
        
        setState(prev => ({
          ...prev,
          permissionGranted: isGranted,
          permissionDenied: isDenied,
        }));
      }).catch((error) => {
        console.warn('⚠️ Geolocation: Could not check permissions', error);
      });
    } else {
      console.log('ℹ️ Geolocation: Permissions API not supported');
    }
  }, []);

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    requestLocationPermission,
  };
}

function getErrorMessage(error: GeolocationPositionError): string {
  // Handle cases where error might be undefined or malformed
  if (!error) {
    return "Unknown geolocation error occurred";
  }
  
  // Log the full error for debugging
  console.log('🔍 Geolocation: Full error object:', error);
  
  switch (error.code) {
    case 1: // PERMISSION_DENIED
      return "Location access denied. Please enable location permissions in your browser settings.";
    case 2: // POSITION_UNAVAILABLE
      return "Location information is unavailable. Please check your device's location services.";
    case 3: // TIMEOUT
      return "Location request timed out. Please try again.";
    default:
      return error.message || "An unknown error occurred while getting your location.";
  }
}
