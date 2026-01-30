"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAlerts } from "@/hooks/useAlerts";
import { useSmartSubscription } from "@/lib/npm-ready-stack/smartAlertSubscriptionPwa";
import type { BrowserInfo } from "@/lib/utils/browserDetection";
import {
  detectBrowser,
  getLocationPermissionInstructions,
} from "@/lib/utils/browserDetection";
import {
  Bell,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";

interface WelcomeGuideProps {
  isVisible: boolean;
  onComplete: () => void;
}

/**
 * Welcome guide component for mobile users
 * Provides step-by-step onboarding with app introduction, installation, and permissions
 * @param isVisible - Whether the guide is visible
 * @param onComplete - Callback when guide is completed
 * @returns {JSX.Element} Welcome guide component
 */
export function WelcomeGuide({ isVisible, onComplete }: WelcomeGuideProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const alerts = useAlerts();

  // Smart subscription hook for notification functionality
  const { handleSubscribe, isSubscribing } = useSmartSubscription({
    alertHandler: (alert) => {
      switch (alert.type) {
        case "success":
          alerts.showSuccessAlert(alert.title, alert.message, alert.duration);
          setIsNotificationEnabled(true); // Disable button on success
          break;
        case "error":
          alerts.showErrorAlert(alert.title, alert.message, alert.duration);
          break;
        case "warning":
          alerts.showWarningAlert(alert.title, alert.message, alert.duration);
          break;
        case "info":
          alerts.showInfoAlert(alert.title, alert.message, alert.duration);
          break;
      }
    },
  });

  // Detect browser information on component mount
  useEffect(() => {
    const info = detectBrowser();
    setBrowserInfo(info);
  }, []);

  /**
   * Handle next step navigation
   * @returns {void}
   */
  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  /**
   * Handle previous step navigation
   * @returns {void}
   */
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Handle guide completion and save to localStorage
   * @returns {void}
   */
  const handleComplete = () => {
    localStorage.setItem("car-rental-welcome-guide-completed", "true");
    onComplete();
  };

  /**
   * Handle skip installation step
   * @returns {void}
   */
  const handleSkipInstall = () => {
    setCurrentStep(3); // Skip to notifications step
  };

  /**
   * Handle skipping notifications step
   * @returns {void}
   */
  const handleSkipNotifications = () => {
    setCurrentStep(4); // Skip to permissions step
  };

  /**
   * Handle location permission request
   * For Safari, shows settings navigation instructions
   * For other browsers, requests geolocation permission directly
   * @returns {void}
   */
  const handleLocationPermission = async () => {
    if (!browserInfo) return;

    setIsRequestingLocation(true);

    try {
      if (browserInfo.name === "Safari") {
        // For Safari, show instructions to navigate to settings
        alerts.showInfoAlert(
          "Safari Location Settings",
          'Please go to Settings > Privacy & Security > Location Services > Safari > AutoGo and select "While Using App"',
          8000,
        );
        setIsLocationEnabled(true);
      } else {
        // For other browsers, request permission directly
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            () => {
              alerts.showSuccessAlert(
                "Location Enabled",
                "Location permission granted successfully!",
                3000,
              );
              setIsLocationEnabled(true);
            },
            (error) => {
              let message =
                "Please enable location permissions in your browser settings.";
              if (error.code === error.PERMISSION_DENIED) {
                message =
                  "Location permission denied. You can enable it later in browser settings.";
              }
              alerts.showWarningAlert("Location Permission", message, 5000);
            },
          );
        } else {
          alerts.showErrorAlert(
            "Location Not Supported",
            "Your browser does not support location services.",
            3000,
          );
        }
      }
    } catch (error) {
      alerts.showErrorAlert(
        "Location Error",
        "Failed to request location permission. Please try again.",
        3000,
      );
    } finally {
      setIsRequestingLocation(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1">
        <div
          className="bg-blue-600 h-1 transition-all duration-300"
          style={{ width: `${(currentStep / 5) * 100}%` }}
        />
      </div>

      {/* Content Container */}
      <div className="flex flex-col h-full z-110">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              {/* Step 1: Welcome */}
              {currentStep === 1 && (
                <Card className="border-0 shadow-none">
                  <CardContent className="text-center space-y-6 p-6">
                    <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                      <img
                        src="/android-chrome-192x192.png"
                        alt="AutoGo Logo"
                        className="h-12 w-12 rounded-lg"
                      />
                    </div>

                    <div className="space-y-4">
                      <h1 className="text-2xl font-bold text-gray-900">
                        Welcome to AutoGo
                      </h1>
                      <p className="text-gray-600 leading-relaxed">
                        Find and rent cars near you with ease. AutoGo helps you
                        locate available vehicles, compare prices, and book your
                        perfect ride in just a few taps.
                      </p>
                    </div>

                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">
                          Find cars near your location
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Car className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">
                          Compare prices and features
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">
                          Quick and secure booking
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: App Installation */}
              {currentStep === 2 && (
                <Card className="border-0 shadow-none">
                  <CardContent className="text-center space-y-6 p-6">
                    <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                      <Download className="h-10 w-10 text-purple-600" />
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Install Our App
                      </h2>
                      <p className="text-gray-600 leading-relaxed">
                        Get the best experience by installing our app on your
                        device. It's fast, works offline, and gives you instant
                        access to car rentals.
                      </p>
                    </div>

                    {browserInfo && (
                      <div className="bg-blue-50 p-4 rounded-lg text-left">
                        <h3 className="font-semibold text-blue-900 mb-2">
                          {browserInfo.isIOS
                            ? "iOS Installation:"
                            : "Android Installation:"}
                        </h3>
                        {browserInfo.isIOS ? (
                          <div className="space-y-2 text-sm text-blue-800">
                            <div>
                              1. Tap the Share button{" "}
                              <span className="font-mono">⎋</span>
                            </div>
                            <div>
                              2. Scroll down and tap "Add to Home Screen"
                            </div>
                            <div>3. Tap "Add" to install the app</div>
                          </div>
                        ) : (
                          <div className="space-y-2 text-sm text-blue-800">
                            <div>1. Tap the menu (⋮) in your browser</div>
                            <div>
                              2. Select "Add to Home screen" or "Install app"
                            </div>
                            <div>3. Tap "Add" or "Install" to confirm</div>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      Installing the app is optional but recommended for the
                      best experience.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Notification Subscription */}
              {currentStep === 3 && (
                <Card className="border-0 shadow-none">
                  <CardContent className="text-center space-y-6 p-6">
                    <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <Bell className="h-10 w-10 text-green-600" />
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Stay Updated
                      </h2>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg text-left">
                      <h3 className="font-semibold text-green-900 mb-3">
                        What you'll receive:
                      </h3>
                      <div className="space-y-2 text-sm text-green-800">
                        <div>• Booking confirmations and updates</div>
                        <div>• Car availability alerts</div>
                        <div>• Special offers and discounts</div>
                        <div>• Important service notifications</div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg text-left">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        How to enable notifications:
                      </h3>
                      <div className="space-y-1 text-sm text-blue-800">
                        <div>
                          1. Click "Allow" when prompted by your browser
                        </div>
                        <div>2. Or enable in browser settings later</div>
                        <div>
                          3. You can customize notification types in app
                          settings
                        </div>
                      </div>
                    </div>

                    {/* <p className="text-xs text-gray-500">
                      Notifications are optional but help you stay informed
                      about your AutoGo bookings and offers.
                    </p> */}

                    {/* Enable Notifications Button */}
                    <div className="mt-4">
                      <Button
                        onClick={handleSubscribe}
                        disabled={isSubscribing || isNotificationEnabled}
                        className={`w-full ${
                          isNotificationEnabled
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {isSubscribing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enabling Notifications...
                          </>
                        ) : isNotificationEnabled ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Notifications Enabled
                          </>
                        ) : (
                          <>
                            <Bell className="h-4 w-4 mr-2" />
                            Enable Notifications
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Location Permissions */}
              {currentStep === 4 && (
                <Card className="border-0 shadow-none">
                  <CardContent className="text-center space-y-6 p-6">
                    <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-10 w-10 text-orange-600" />
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Location Permission
                      </h2>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg text-left">
                      <h3 className="font-semibold text-orange-900 mb-3">
                        Why we need location:
                      </h3>
                      <div className="space-y-2 text-sm text-orange-800">
                        <div>• Find available cars near you</div>
                        <div>• Calculate distances and travel times</div>
                        <div>• Show pickup locations on the map</div>
                        <div>• Provide location-based recommendations</div>
                      </div>
                    </div>

                    {browserInfo && (
                      <div className="bg-gray-50 p-4 rounded-lg text-left">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {browserInfo.name} - How to enable:
                        </h3>
                        <div className="space-y-1 text-sm text-gray-700">
                          {getLocationPermissionInstructions(browserInfo).map(
                            (instruction, index) => (
                              <div key={index}>
                                {index + 1}. {instruction}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {/* Enable Location Button */}
                    <div className="mt-4">
                      <Button
                        onClick={handleLocationPermission}
                        disabled={isRequestingLocation || isLocationEnabled}
                        className={`w-full ${
                          isLocationEnabled
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-orange-600 hover:bg-orange-700"
                        }`}
                      >
                        {isRequestingLocation ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {browserInfo?.name === "Safari"
                              ? "Opening Settings Guide..."
                              : "Requesting Permission..."}
                          </>
                        ) : isLocationEnabled ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Location Enabled
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 mr-2" />
                            {browserInfo?.name === "Safari"
                              ? "Go to Settings"
                              : "Enable Location"}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 5: Finish */}
              {currentStep === 5 && (
                <Card className="border-0 shadow-none">
                  <CardContent className="text-center space-y-6 p-6">
                    <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-10 w-10 text-green-600" />
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        You're All Set!
                      </h2>
                      <p className="text-gray-600 leading-relaxed">
                        Welcome to AutoGo! You're now ready to find and book
                        your perfect car. Start by exploring available vehicles
                        in your area.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">
                        Quick Tips:
                      </h3>
                      <div className="space-y-2 text-sm text-green-800 text-left">
                        <div>• Use the search to find specific car types</div>
                        <div>
                          • Check availability and pricing before booking
                        </div>
                        <div>
                          • Save your favorite locations for quick access
                        </div>
                        <div>• Contact support if you need any help</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <div className="max-w-md mx-auto flex items-center justify-between">
              {/* Previous Button */}
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                variant="ghost"
                className="flex items-center gap-2 text-gray-600"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {/* Step Indicator */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full ${
                      step === currentStep
                        ? "bg-blue-600"
                        : step < currentStep
                          ? "bg-green-600"
                          : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Next/Skip/Finish Button */}
              <div className="flex gap-2">
                {currentStep === 2 && (
                  <Button
                    onClick={handleSkipInstall}
                    variant="ghost"
                    className="text-gray-600"
                  >
                    Skip
                  </Button>
                )}
                {currentStep === 3 && (
                  <Button
                    onClick={handleSkipNotifications}
                    variant="ghost"
                    className="text-gray-600"
                  >
                    Skip
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {currentStep === 5 ? "Get Started" : "Next"}
                  {currentStep !== 5 && <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
