/**
 * MongoDB Schema and Types for Push Subscriptions
 */

export interface PushSubscriptionDocument {
  _id?: string
  subscriptionId: string
  userId?: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  expirationTime?: number | null
  userAgent?: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  lastValidated?: Date
  lastHeartbeat?: Date
  expiredAt?: Date
  clientTimestamp?: Date
}

/**
 * Create indexes for the push subscriptions collection
 */
export const PUSH_SUBSCRIPTION_INDEXES = [
  { key: { subscriptionId: 1 }, unique: true },
  { key: { userId: 1 }, unique: false },
  { key: { endpoint: 1 }, unique: true },
  { key: { createdAt: 1 }, unique: false },
  { key: { isActive: 1 }, unique: false }
] as const

/**
 * Collection name for push subscriptions
 */
export const PUSH_SUBSCRIPTIONS_COLLECTION = 'pushSubscriptions'
