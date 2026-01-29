/**
 * PWA Service
 * Centralized export for all PWA functionality
 * 
 * Usage:
 * import { PushNotificationManager, InstallPrompt } from '@/lib/pwaService'
 * import { subscribeUser, unsubscribeUser, sendNotification } from '@/lib/pwaService/actions'
 */

// Components
export { PushNotificationManager, InstallPrompt } from './components'

// Utilities
export {
  urlBase64ToUint8Array,
  isIOSDevice,
  isStandaloneMode,
  isPushNotificationSupported,
} from './utils'

// Types
export type {
  SerializedPushSubscription,
  PushActionResponse,
  PushNotificationPayload,
} from './types'
