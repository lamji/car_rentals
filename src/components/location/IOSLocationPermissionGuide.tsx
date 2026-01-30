"use client";

import { AlertCircle, MapPin, Settings, Smartphone } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface IOSLocationPermissionGuideProps {
  isVisible: boolean;
  onRequestPermission: () => void;
  onDismiss: () => void;
}

/**
 * iOS-specific location permission guide component
 * Provides step-by-step instructions for enabling location in iOS PWA
 * @param isVisible - Whether the guide should be displayed
 * @param onRequestPermission - Callback to trigger permission request
 * @param onDismiss - Callback to dismiss the guide
 * @returns {JSX.Element} iOS location permission guide
 */
export function IOSLocationPermissionGuide({
  isVisible,
  onRequestPermission,
  onDismiss,
}: IOSLocationPermissionGuideProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <CardTitle>Enable Location Access</CardTitle>
          </div>
          <CardDescription>
            To find cars near you, we need access to your location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* iOS PWA Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-medium">
              <Smartphone className="h-4 w-4" />
              For iOS Users
            </div>
            <div className="text-sm text-blue-600 space-y-2">
              <p className="font-medium">If the permission popup doesn't appear:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Go to Settings → Privacy & Security</li>
                <li>Tap "Location Services"</li>
                <li>Find this app in the list</li>
                <li>Select "While Using App"</li>
                <li>Return to this app and try again</li>
              </ol>
            </div>
          </div>

          {/* Warning for Safari */}
          <div className="bg-amber-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-amber-700 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Note:</span>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              Location permissions work best when this app is added to your home screen
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={onRequestPermission}
              className="flex-1"
              size="sm"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Request Location
            </Button>
            <Button 
              onClick={onDismiss}
              variant="outline"
              size="sm"
            >
              Skip
            </Button>
          </div>

          {/* Settings Link */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              // Try to open iOS settings (may not work in all browsers)
              if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
                window.location.href = 'App-Prefs:Privacy&path=LOCATION';
              }
            }}
          >
            <Settings className="h-3 w-3 mr-1" />
            Open Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
