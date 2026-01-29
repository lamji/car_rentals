'use server'

import webpush from 'web-push'
import type { SerializedPushSubscription, PushActionResponse } from './types'

/**
 * Configure VAPID details for web push
 * Uses environment variables for keys
 */
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@carrentals.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

/**
 * In-memory subscription storage
 * In production, replace with database storage
 */
let subscription: SerializedPushSubscription | null = null

/**
 * Subscribe a user to push notifications
 * Stores the subscription for later use
 * @param sub - The serialized push subscription
 * @returns Success response
 */
export async function subscribeUser(sub: SerializedPushSubscription): Promise<PushActionResponse> {
  subscription = sub
  // In production: await db.subscriptions.create({ data: sub })
  return { success: true }
}

/**
 * Unsubscribe a user from push notifications
 * Removes the stored subscription
 * @returns Success response
 */
export async function unsubscribeUser(): Promise<PushActionResponse> {
  subscription = null
  // In production: await db.subscriptions.delete({ where: { ... } })
  return { success: true }
}

/**
 * Send a push notification to the subscribed user
 * @param message - The notification message body
 * @returns Success or error response
 */
export async function sendNotification(message: string): Promise<PushActionResponse> {
  if (!subscription) {
    return { success: false, error: 'No subscription available' }
  }

  try {
    await webpush.sendNotification(
      subscription as unknown as webpush.PushSubscription,
      JSON.stringify({
        title: 'Car Rentals',
        body: message,
        icon: '/android-chrome-192x192.png',
      })
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}
