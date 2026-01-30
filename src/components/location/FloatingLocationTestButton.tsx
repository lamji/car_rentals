"use client";

import { MapPin, Settings, X } from "lucide-react";
import { useState } from "react";
import { useGeolocation } from "../../lib/npm-ready-stack/locationPicker";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { IOSLocationPermissionGuide } from "./IOSLocationPermissionGuide";

/**
 * Floating location test button for manual permission testing
 * Provides easy access to location permission testing and debugging
 * @returns {JSX.Element} Floating location test interface
 */
export function FloatingLocationTestButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const {
    position,
    address,
    error,
    loading,
    permissionGranted,
    permissionDenied,
    userInteractionRequired,
    isIOSDevice,
    isIOSPWA,
    getCurrentPosition,
    requestLocationPermission,
    resetPermissionState,
  } = useGeolocation();

  /**
   * Handle location permission request with iOS guide fallback
   * Shows iOS guide if permission fails on iOS devices
   * @returns {void}
   */
  const handleLocationRequest = () => {
    if (isIOSDevice && permissionDenied) {
      setShowIOSGuide(true);
    } else {
      requestLocationPermission();
    }
  };

  /**
   * Handle manual location request
   * Directly calls getCurrentPosition for testing
   * @returns {void}
   */
  const handleManualRequest = () => {
    getCurrentPosition();
  };

  /**
   * Handle permission retry after accidental denial
   * Resets permission state and requests again
   * @returns {void}
   */
  const handleRetryPermission = () => {
    console.log("🔄 Retrying location permission...");
    resetPermissionState();
    // Small delay to ensure state is reset before requesting again
    setTimeout(() => {
      console.log("🔄 Requesting permission after reset...");
      requestLocationPermission();
    }, 100);
  };

  /**
   * Force a fresh location request bypassing permission checks
   * Useful when browser permission state is stuck
   * @returns {void}
   */
  const handleForceRequest = () => {
    console.log("🚀 Force requesting location...");
    resetPermissionState();
    // Force a direct getCurrentPosition call
    setTimeout(() => {
      console.log("🚀 Direct getCurrentPosition call...");
      getCurrentPosition();
    }, 100);
  };

  /**
   * Nuclear option - completely bypass all checks and force location request
   * Directly calls navigator.geolocation.getCurrentPosition
   * @returns {void}
   */
  const handleNuclearRequest = () => {
    console.log("💥 Nuclear location request - bypassing all checks...");

    if (!navigator.geolocation) {
      console.error("❌ Geolocation not supported");
      return;
    }

    // Direct call to browser API
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("✅ Nuclear request successful:", position);
        // Manually update state since we're bypassing the hook
        resetPermissionState();
      },
      (error) => {
        console.error("❌ Nuclear request failed:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-4 right-4 z-100">
        {!isExpanded ? (
          <Button
            onClick={() => setIsExpanded(true)}
            className="rounded-full w-12 h-12 shadow-lg bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <MapPin className="h-5 w-5" />
          </Button>
        ) : (
          <Card className="w-80 shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-sm">Location Test</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <CardDescription className="text-xs">
                Test location permissions and requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Device Info */}
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">iOS Device:</span>
                  <span
                    className={isIOSDevice ? "text-green-600" : "text-gray-500"}
                  >
                    {isIOSDevice ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">iOS PWA:</span>
                  <span
                    className={isIOSPWA ? "text-green-600" : "text-gray-500"}
                  >
                    {isIOSPWA ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              {/* Permission Status */}
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Permission:</span>
                  <span
                    className={
                      permissionGranted
                        ? "text-green-600"
                        : permissionDenied
                          ? "text-red-600"
                          : "text-yellow-600"
                    }
                  >
                    {permissionGranted
                      ? "Granted"
                      : permissionDenied
                        ? "Denied"
                        : "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    User Interaction:
                  </span>
                  <span
                    className={
                      userInteractionRequired
                        ? "text-yellow-600"
                        : "text-gray-500"
                    }
                  >
                    {userInteractionRequired ? "Required" : "Not Required"}
                  </span>
                </div>
              </div>

              {/* Location Data */}
              {position && (
                <div className="text-xs space-y-1 bg-green-50 p-2 rounded">
                  <div className="font-medium text-green-700">
                    Location Found:
                  </div>
                  <div>Lat: {position.lat.toFixed(6)}</div>
                  <div>Lng: {position.lng.toFixed(6)}</div>
                  <div>Accuracy: {position.accuracy}m</div>
                  {address && (
                    <div className="text-green-600 text-xs mt-1">
                      {address.formattedAddress}
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="text-xs bg-red-50 p-2 rounded">
                  <div className="font-medium text-red-700">Error:</div>
                  <div className="text-red-600">{error.message}</div>
                  <div className="text-red-500">Code: {error.code}</div>
                  {error.code === 1 && (
                    <div className="text-red-600 mt-2 text-xs space-y-1">
                      <div className="font-medium">
                        🔒 Permission Permanently Blocked
                      </div>
                      <div>Manual reset required:</div>
                      <div>
                        • Chrome: Click 🔒 in address bar → Location → Allow
                      </div>
                      <div>
                        • Firefox: Click 🛡️ in address bar → Permissions
                      </div>
                      <div>
                        • Safari: Safari → Settings → Websites → Location
                      </div>
                      <div>
                        • Mobile: Browser Settings → Site Settings → Location
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-xs bg-blue-50 p-2 rounded text-blue-600">
                  Requesting location...
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleLocationRequest}
                  disabled={loading}
                  className="w-full"
                  size="sm"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Request Permission
                </Button>

                <Button
                  onClick={handleManualRequest}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  Get Current Location
                </Button>

                {/* Retry Buttons - Show when permission is denied */}
                {permissionDenied && (
                  <>
                    <Button
                      onClick={handleRetryPermission}
                      disabled={loading}
                      variant="destructive"
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      size="sm"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      Retry Permission
                    </Button>

                    <Button
                      onClick={handleForceRequest}
                      disabled={loading}
                      variant="outline"
                      className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                      size="sm"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      Force Request
                    </Button>

                    <Button
                      onClick={handleNuclearRequest}
                      disabled={loading}
                      variant="outline"
                      className="w-full border-red-300 text-red-700 hover:bg-red-50"
                      size="sm"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      Nuclear Request
                    </Button>
                  </>
                )}

                {isIOSDevice && (
                  <Button
                    onClick={() => setShowIOSGuide(true)}
                    variant="secondary"
                    className="w-full"
                    size="sm"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    iOS Guide
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* iOS Permission Guide */}
      <IOSLocationPermissionGuide
        isVisible={showIOSGuide}
        onRequestPermission={() => {
          setShowIOSGuide(false);
          requestLocationPermission();
        }}
        onDismiss={() => setShowIOSGuide(false)}
      />
    </>
  );
}
