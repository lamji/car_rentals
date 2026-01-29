/**
 * PWA Service Types
 * Type definitions for PWA functionality
 */

/**
 * Serialized push subscription for server-side storage
 */
export interface SerializedPushSubscription {
  endpoint: string
  expirationTime: number | null
  keys: {
    p256dh: string
    auth: string
  }
}

/**
 * Response from push notification actions
 */
export interface PushActionResponse {
  success: boolean
  error?: string
  statusCode?: number
}

/**
 * Push notification payload
 */
export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  vibrate?: number[]
  data?: Record<string, unknown>
}
