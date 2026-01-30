/**
 * iOS Settings utilities for attempting to open device settings
 * Note: iOS has strict limitations on programmatic settings access
 */

/**
 * Attempt to open iOS Settings app programmatically
 * This may not work on all iOS versions due to security restrictions
 * @returns {boolean} Whether the attempt was made (not whether it succeeded)
 */
export function attemptOpenIOSSettings(): boolean {
  if (typeof window === 'undefined') return false;
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  if (!isIOS) return false;
  
  try {
    // Attempt various iOS Settings URL schemes
    const settingsUrls = [
      'App-Prefs:Privacy&path=LOCATION', // Location Services
      'App-Prefs:Privacy', // Privacy & Security
      'App-Prefs:', // General Settings
      'prefs:root=Privacy&path=LOCATION_SERVICES', // Alternative format
      'prefs:root=Privacy', // Alternative Privacy
      'prefs:', // Alternative general
    ];
    
    // Try each URL scheme
    for (const url of settingsUrls) {
      try {
        const link = document.createElement('a');
        link.href = url;
        link.click();
        console.log('🔧 Attempted to open iOS Settings:', url);
        return true;
      } catch (error) {
        console.log('❌ Settings URL failed:', url, error);
        continue;
      }
    }
    
    // Fallback: Try window.open
    window.open('App-Prefs:Privacy&path=LOCATION', '_system');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to open iOS Settings:', error);
    return false;
  }
}

/**
 * Check if the device supports programmatic settings access
 * @returns {boolean} Whether settings access might be available
 */
export function canAttemptOpenSettings(): boolean {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  
  // More likely to work in PWA mode
  return isIOS && isPWA;
}

/**
 * Get user-friendly message about settings access
 * @returns {string} Message explaining settings access limitations
 */
export function getSettingsAccessMessage(): string {
  const canAttempt = canAttemptOpenSettings();
  
  if (canAttempt) {
    return "Attempting to open Settings... If it doesn't work, please open Settings manually.";
  } else {
    return "iOS restricts automatic Settings access. Please open Settings manually.";
  }
}
