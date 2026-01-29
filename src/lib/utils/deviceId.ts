/**
 * Device ID utility for managing unique device identification
 * Used to prevent duplicate push notification subscriptions
 */

/**
 * Generate a unique device ID based on browser fingerprinting
 * Combines multiple browser characteristics for uniqueness
 * @returns {string} Unique device identifier
 */
export function generateDeviceId(): string {
  // Get browser characteristics
  const userAgent = navigator.userAgent
  const language = navigator.language
  const platform = navigator.platform
  const screenResolution = `${screen.width}x${screen.height}`
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  
  // Create a fingerprint string
  const fingerprint = `${userAgent}-${language}-${platform}-${screenResolution}-${timezone}`
  
  // Generate hash from fingerprint
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Convert to positive hex string and add timestamp for uniqueness
  const deviceId = Math.abs(hash).toString(16) + '-' + Date.now().toString(16)
  
  return deviceId
}

/**
 * Get or create device ID from local storage
 * Creates a persistent device ID that survives browser sessions
 * @returns {string} Device ID from storage or newly generated
 */
export function getDeviceId(): string {
  const DEVICE_ID_KEY = 'car_rentals_device_id'
  
  // Try to get existing device ID
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)
  
  // Generate new ID if none exists
  if (!deviceId) {
    deviceId = generateDeviceId()
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }
  
  return deviceId
}

/**
 * Check if device is already subscribed based on local storage
 * @returns {boolean} True if device has subscription data in local storage
 */
export function isDeviceSubscribedLocally(): boolean {
  const SUBSCRIPTION_KEY = 'car_rentals_push_subscription'
  const subscriptionData = localStorage.getItem(SUBSCRIPTION_KEY)
  
  return subscriptionData !== null && subscriptionData !== 'null'
}

/**
 * Store subscription status in local storage
 * @param {boolean} isSubscribed - Whether device is subscribed
 * @param {string} subscriptionId - Optional subscription ID to store
 */
export function setLocalSubscriptionStatus(isSubscribed: boolean, subscriptionId?: string): void {
  const SUBSCRIPTION_KEY = 'car_rentals_push_subscription'
  const SUBSCRIPTION_ID_KEY = 'car_rentals_subscription_id'
  
  if (isSubscribed && subscriptionId) {
    localStorage.setItem(SUBSCRIPTION_KEY, 'true')
    localStorage.setItem(SUBSCRIPTION_ID_KEY, subscriptionId)
  } else {
    localStorage.removeItem(SUBSCRIPTION_KEY)
    localStorage.removeItem(SUBSCRIPTION_ID_KEY)
  }
}

/**
 * Get stored subscription ID from local storage
 * @returns {string | null} Subscription ID or null if not found
 */
export function getLocalSubscriptionId(): string | null {
  const SUBSCRIPTION_ID_KEY = 'car_rentals_subscription_id'
  return localStorage.getItem(SUBSCRIPTION_ID_KEY)
}
