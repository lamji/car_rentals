/**
 * PWA Service Utilities
 * Contains helper functions for PWA functionality
 */

/**
 * Converts a base64 URL-safe string to a Uint8Array
 * Required for VAPID key conversion in push subscriptions
 * @param base64String - The base64 URL-safe encoded string
 * @returns Uint8Array representation of the input
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Checks if the current device is iOS
 * @returns boolean indicating if device is iOS
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
}

/**
 * Checks if the app is running in standalone mode (installed as PWA)
 * @returns boolean indicating if app is in standalone mode
 */
export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
}

/**
 * Checks if push notifications are supported in the current browser
 * @returns boolean indicating push notification support
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'serviceWorker' in navigator && 'PushManager' in window
}
