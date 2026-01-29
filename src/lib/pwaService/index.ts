/**
 * PWA Service
 * Centralized export for all PWA functionality
 * 
 * Usage:
 * import { PushNotificationManager, InstallPrompt } from '@/lib/pwaService'
 * import { subscribeUser, unsubscribeUser, sendNotification } from '@/lib/pwaService/actions'
 */

// Components
export { InstallPrompt, PWAAutoLauncher, PushNotificationManager } from './components'

// Providers
export { SubscriptionPersistenceProvider } from './providers/SubscriptionPersistenceProvider'

// Hooks
export { useSubscriptionPersistence } from './hooks/useSubscriptionPersistence'

// Database Actions
export {
    getAllSubscriptionIdsDB, sendNotificationDB,
    sendNotificationToAllDB, subscribeUserDB,
    unsubscribeUserDB
} from './db-actions'

// Persistence Service
export {
    getSubscriptionStatus, initializeSubscriptionPersistence,
    manualRefreshSubscription
} from './subscription-persistence'

// Utilities
export {
    isIOSDevice, isPushNotificationSupported, isStandaloneMode, urlBase64ToUint8Array
} from './utils'

// Types
export type {
    PushActionResponse,
    PushNotificationPayload, SerializedPushSubscription
} from './types'

// Models
export {
    PUSH_SUBSCRIPTIONS_COLLECTION,
    PUSH_SUBSCRIPTION_INDEXES
} from './models/PushSubscription'
export type {
    PushSubscriptionDocument
} from './models/PushSubscription'

