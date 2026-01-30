/**
 * Browser detection utilities for providing specific user guidance
 * Detects browser type, version, and platform for targeted instructions
 */

export interface BrowserInfo {
  name: string;
  version: string;
  platform: string;
  isMobile: boolean;
  isIOS: boolean;
  isPWA: boolean;
}

/**
 * Detect current browser and platform information
 * @returns {BrowserInfo} Comprehensive browser information
 */
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  // Detect mobile
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    );

  // Detect iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (platform === "MacIntel" && navigator.maxTouchPoints > 1);

  // Detect PWA
  const isPWA =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true;

  // Browser detection
  let browserName = "Unknown";
  let browserVersion = "Unknown";

  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    browserName = "Chrome";
    const match = userAgent.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  } else if (userAgent.includes("Firefox")) {
    browserName = "Firefox";
    const match = userAgent.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browserName = "Safari";
    const match = userAgent.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  } else if (userAgent.includes("Edg")) {
    browserName = "Edge";
    const match = userAgent.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
    browserName = "Opera";
    const match = userAgent.match(/(?:Opera|OPR)\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  }

  return {
    name: browserName,
    version: browserVersion,
    platform: platform,
    isMobile,
    isIOS,
    isPWA,
  };
}

/**
 * Get browser-specific location permission instructions
 * @param browserInfo - Browser information from detectBrowser()
 * @returns {string[]} Array of step-by-step instructions
 */
export function getLocationPermissionInstructions(
  browserInfo: BrowserInfo,
): string[] {
  const { name, isMobile, isIOS, isPWA } = browserInfo;

  if (isIOS) {
    // ALL iOS PWAs use Safari WebView, regardless of installation browser
    return [
      "Go to iPhone Settings → Privacy & Security",
      'Tap "Location Services"',
      'Scroll down to "Safari Websites"',
      'Find your site and set to "While Using App"',
      "Return to the app and try again",
      "⚠️ Note: All iOS PWAs use Safari permissions",
    ];
  }

  if (isMobile) {
    switch (name) {
      case "Chrome":
        return [
          "Tap the three dots (⋮) in Chrome",
          "Go to Settings → Site Settings",
          'Tap "Location"',
          'Find this site and set to "Allow"',
          "Refresh the page",
        ];
      case "Firefox":
        return [
          "Tap the three lines (☰) in Firefox",
          "Go to Settings → Privacy",
          'Tap "Permissions"',
          'Select "Location" and allow for this site',
          "Refresh the page",
        ];
      default:
        return [
          "Open browser settings",
          'Find "Site Settings" or "Permissions"',
          'Look for "Location" permissions',
          "Allow location access for this site",
          "Refresh the page",
        ];
    }
  }

  // Desktop browsers
  switch (name) {
    case "Chrome":
      return [
        "Click the lock icon (🔒) in the address bar",
        'Click "Location"',
        'Select "Always allow on this site"',
        "Refresh the page",
      ];
    case "Firefox":
      return [
        "Click the shield icon (🛡️) in the address bar",
        'Click "Permissions"',
        'Set Location to "Allow"',
        "Refresh the page",
      ];
    case "Safari":
      return [
        "Go to Safari → Settings (or Preferences)",
        'Click "Websites" tab',
        'Select "Location" from the left sidebar',
        'Set this website to "Allow"',
        "Refresh the page",
      ];
    case "Edge":
      return [
        "Click the lock icon (🔒) in the address bar",
        'Click "Permissions for this site"',
        'Set Location to "Allow"',
        "Refresh the page",
      ];
    default:
      return [
        "Look for a lock or shield icon in the address bar",
        "Click it and find location permissions",
        'Set location access to "Allow"',
        "Refresh the page",
      ];
  }
}
