"use client";

import { useState, useEffect } from "react";
import { MapPin, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeolocationContext } from "@/contexts/GeolocationContext";

export function LocationPermissionBanner() {
  const { permissionGranted, permissionDenied, requestLocationPermission, loading } = useGeolocationContext();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show banner on first render if permission not determined or denied
  useEffect(() => {
    // Show if permission is unknown or denied, and haven't been dismissed
    const shouldShow = (permissionGranted === null || permissionDenied) && !dismissed;
    
    if (shouldShow) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [permissionGranted, permissionDenied, dismissed]);

  // Hide banner if permission is granted or dismissed
  useEffect(() => {
    if (permissionGranted === true || dismissed) {
      setIsVisible(false);
    }
  }, [permissionGranted, dismissed]);

  // Don't render if not visible or permission granted or dismissed
  if (!isVisible || permissionGranted === true || dismissed) {
    return null;
  }

  const handleEnableLocation = () => {
    requestLocationPermission();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {permissionDenied ? "Location Access Denied" : "Location Required"}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {permissionDenied 
                  ? "Location access was denied. Enable location in your browser settings to find the nearest cars and calculate delivery fees."
                  : "We need your location to find the nearest cars and calculate delivery fees. Enable location for the best experience."
                }
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {!permissionDenied ? (
                  <Button
                    onClick={handleEnableLocation}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Crosshair className="h-4 w-4 mr-2" />
                    {loading ? "Requesting..." : "Enable Location"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleDismiss}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Got it
                  </Button>
                )}
                
                {!permissionDenied && (
                  <Button
                    variant="outline"
                    onClick={handleDismiss}
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Maybe Later
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
