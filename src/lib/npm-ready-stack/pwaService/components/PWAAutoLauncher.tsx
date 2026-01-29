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
      // Check if app was just installed (with timestamp validation)
      const justInstalled = localStorage.getItem("pwa-just-installed");
      const installTimestamp = localStorage.getItem("pwa-install-timestamp");

      if (!justInstalled) return;

      // Check if installation was recent (within last 30 seconds)
      const now = Date.now();
      const installTime = installTimestamp ? parseInt(installTimestamp) : 0;
      const timeDiff = now - installTime;

      if (timeDiff > 30000) {
        // Installation was too long ago, clear flags
        localStorage.removeItem("pwa-just-installed");
        localStorage.removeItem("pwa-install-timestamp");
        localStorage.removeItem("pwa-android-installed");
        return;
      }

      console.log("🚀 Attempting to auto-launch PWA...", {
        timeDiff,
        installTime,
      });

      // Clear the flags after successful detection
      localStorage.removeItem("pwa-just-installed");
      localStorage.removeItem("pwa-install-timestamp");

      // Detect platform
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isChrome = /Chrome/i.test(navigator.userAgent);
      const isEdge = /Edg/i.test(navigator.userAgent);
      const isSamsung = /SamsungBrowser/i.test(navigator.userAgent);

      // Strategy 1: Android Chrome/Edge/Samsung Browser - Modern approach
      if (isAndroid && (isChrome || isEdge || isSamsung)) {
        console.log(
          "🤖 Android browser detected, using modern launch strategy",
        );

        // Check if we're already in standalone mode
        if (window.matchMedia("(display-mode: standalone)").matches) {
          console.log(
            "📱 Already in standalone mode - PWA launched successfully",
          );
          localStorage.removeItem("pwa-android-installed");
          return;
        }

        // Android-specific launch sequence
        const androidLaunchSequence = async () => {
          try {
            // Method 1: Try to trigger PWA launch with location change
            console.log("📱 Android Method 1: Location change");
            window.location.href =
              window.location.origin + "/?pwa-launch=android";

            // Wait a bit and check if we're still in browser
            setTimeout(() => {
              if (!window.matchMedia("(display-mode: standalone)").matches) {
                console.log("📱 Android Method 2: History manipulation");
                // Method 2: Use history API
                window.history.pushState(
                  {},
                  "",
                  window.location.origin + "/?pwa-auto=true",
                );
                window.location.reload();
              }
            }, 800);

            // Method 3: Force close browser tab (aggressive approach)
            setTimeout(() => {
              if (!window.matchMedia("(display-mode: standalone)").matches) {
                console.log("📱 Android Method 3: Aggressive launch");
                // Try to close the browser tab to force PWA launch
                try {
                  window.close();
                } catch {
                  // If close fails, try navigation
                  window.location.href = "about:blank";
                  setTimeout(() => {
                    window.location.href = window.location.origin;
                  }, 100);
                }
              }
            }, 1500);
          } catch (error) {
            console.log("📱 Android launch sequence error:", error);
            // Fallback: Simple reload
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        };

        // Execute Android launch sequence
        androidLaunchSequence();
        return;
      }

      // Strategy 2: Generic PWA launch using manifest
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

    /**
     * Handle custom PWA installation event
     */
    function handlePWAInstallEvent(event: CustomEvent) {
      console.log("🎯 Custom PWA install event received:", event.detail);
      setTimeout(handlePWALaunch, 200);
    }

    // Set up event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener(
      "pwa-installed",
      handlePWAInstallEvent as EventListener,
    );

    // Run launch check on component mount
    handlePWALaunch();

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener(
        "pwa-installed",
        handlePWAInstallEvent as EventListener,
      );
    };
  }, []);

  // This component doesn't render anything
  return null;
}
