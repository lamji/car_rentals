"use client";

import { useState } from "react";
import { MapPin, Minimize2, Loader2, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeolocationContext } from "@/contexts/GeolocationContext";

export function GeolocationTest() {
  const { 
    position, 
    address, 
    loading, 
    permissionGranted, 
    permissionDenied,
    requestLocation,
    requestLocationPermission
  } = useGeolocationContext();

  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleRequestLocation = () => {
    if (permissionDenied) {
      requestLocationPermission();
    } else {
      requestLocation();
    }
  };

  // Floating icon only
  if (!isExpanded) {
    // Determine icon color and state
    let iconColor = "bg-gray-400 hover:bg-gray-500"; // default gray
    let IconComponent = MapPin;
    
    if (loading) {
      IconComponent = Loader2;
      iconColor = "bg-blue-600 hover:bg-blue-700";
    } else if (permissionGranted === true && address) {
      iconColor = "bg-green-600 hover:bg-green-700";
    } else if (permissionGranted === false || permissionDenied) {
      iconColor = "bg-red-600 hover:bg-red-700";
    } else if (permissionGranted === true) {
      iconColor = "bg-blue-600 hover:bg-blue-700";
    }

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleToggle}
          size="sm"
          className={`${iconColor} text-white rounded-full p-3 shadow-lg`}
        >
          <IconComponent className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    );
  }

  // Expanded panel
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-lg shadow-xl border">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold">Geolocation</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-6 w-6 p-0"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
        {/* Permission Status */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-700">Permission Status:</div>
          <div className="text-xs">
            {permissionGranted === null && (
              <span className="text-yellow-600">Unknown</span>
            )}
            {permissionGranted === true && (
              <span className="text-green-600">Granted ✅</span>
            )}
            {permissionGranted === false && (
              <span className="text-red-600">Denied ❌</span>
            )}
          </div>
        </div>

        {/* Loading Status */}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <Loader2 className="h-3 w-3 animate-spin" />
            Getting location...
          </div>
        )}

        {/* Position Data */}
        {position && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-700">Position:</div>
            <div className="text-xs font-mono bg-gray-100 p-2 rounded">
              <div>Accuracy: {position.accuracy.toFixed(0)}m</div>
            </div>
          </div>
        )}

        {/* Address Data */}
        {address && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-700">Address:</div>
            <div className="text-xs bg-gray-100 p-2 rounded">
              <div><strong>Formatted:</strong> {address.formattedAddress}</div>
              {address.region && <div><strong>Region:</strong> {address.region}</div>}
              {address.province && <div><strong>Province:</strong> {address.province}</div>}
              {address.city && <div><strong>City:</strong> {address.city}</div>}
              {address.municipality && <div><strong>Municipality:</strong> {address.municipality}</div>}
              {address.barangay && <div><strong>Barangay:</strong> {address.barangay}</div>}
            </div>
          </div>
        )}

        {/* Error State */}
        {permissionDenied && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            Location access denied. Enable in browser settings.
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 border-t">
          <Button
            onClick={handleRequestLocation}
            disabled={loading}
            className="w-full text-xs"
            size="sm"
          >
            <Crosshair className="h-3 w-3 mr-1" />
            {permissionDenied ? "Request Permission" : "Get Location"}
          </Button>
        </div>
      </div>
    </div>
  );
}
