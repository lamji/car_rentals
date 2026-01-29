"use client";

import { useEffect } from "react";

/**
 * PWA Auto Launcher Component
 * Handles automatic launching of PWA after installation on mobile devices
 * Implements various strategies for different browsers and platforms
 */
export function PWAAutoLauncher() {
  useEffect(() => {
    /**
     * Handle PWA launch after installation
     * Uses multiple strategies to ensure the app opens after installation
     */
    function handlePWALaunch() {
      // Check if app was just installed
      const justInstalled = localStorage.getItem("pwa-just-installed");
      if (!justInstalled) return;

      console.log("🚀 Attempting to auto-launch PWA...");

      // Clear the flag
      localStorage.removeItem("pwa-just-installed");

      // Strategy 1: Use Web App Manifest start_url (most reliable)
      if (
        "serviceWorker" in navigator &&
        "getRegistrations" in navigator.serviceWorker
      ) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          if (registrations.length > 0) {
            // PWA is installed, try to launch it
            const manifestUrl = "/manifest.webmanifest";
            fetch(manifestUrl)
              .then((response) => response.json())
              .then((manifest) => {
                if (manifest.start_url) {
                  console.log(
                    "📱 Launching PWA with start_url:",
                    manifest.start_url,
                  );
                  window.location.href = manifest.start_url;
                }
              })
              .catch(() => {
                // Fallback to current URL
                console.log("📱 Launching PWA with current URL");
                window.location.href = window.location.origin;
              });
          }
        });
      }

      // Strategy 2: For Android Chrome - use custom URL scheme (if configured)
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isChrome = /Chrome/i.test(navigator.userAgent);

      if (isAndroid && isChrome) {
        setTimeout(() => {
          // Try to open the app using intent URL
          const intentUrl = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.android.chrome;end`;
          console.log("🤖 Attempting Android Chrome intent launch");

          try {
            window.location.href = intentUrl;
          } catch (error) {
            console.log("Intent launch failed, using fallback", error);
            window.location.href = window.location.href;
          }
        }, 500);
      }

      // Strategy 3: iOS Safari - limited options due to security restrictions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari =
        /Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent);

      if (isIOS && isSafari) {
        // iOS doesn't allow programmatic app launching after installation
        // Show a message or notification instead
        console.log(
          "🍎 iOS detected - auto-launch not supported, showing notification",
        );

        // You could show a toast notification here
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Car Rentals Installed!", {
            body: "Tap here to open your new app",
            icon: "/android-chrome-192x192.png",
            badge: "/favicon-32x32.png",
          });
        }
      }
    }

    /**
     * Listen for visibility change to detect app launch
     * This helps detect when the user returns to the browser after PWA installation
     */
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        // Small delay to ensure the page is fully loaded
        setTimeout(handlePWALaunch, 100);
      }
    }

    /**
     * Listen for focus events to detect app activation
     */
    function handleWindowFocus() {
      setTimeout(handlePWALaunch, 100);
    }

    // Set up event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    // Run launch check on component mount
    handlePWALaunch();

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
