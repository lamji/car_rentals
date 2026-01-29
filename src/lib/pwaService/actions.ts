'use server'

import webpush from 'web-push'
import type { PushActionResponse, SerializedPushSubscription } from './types'

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
 * In-memory subscription storage by ID
 * In production, replace with database storage
 */
const subscriptions: Map<string, SerializedPushSubscription> = new Map()

/**
 * Subscribe a user to push notifications
 * Stores the subscription with a custom ID for targeting
 * @param sub - The serialized push subscription
 * @param subscriptionId - Custom ID for this subscription (optional)
 * @returns Success response with subscription ID
 */
export async function subscribeUser(sub: SerializedPushSubscription, subscriptionId?: string): Promise<PushActionResponse & { subscriptionId?: string }> {
  // Generate ID from endpoint if not provided
  const id = subscriptionId || sub.endpoint.split('/').pop()?.substring(0, 8) || 'unknown'
  
  subscriptions.set(id, sub)
  console.log(`📱 Subscription stored with ID: ${id}`)
  console.log(`📊 Total subscriptions: ${subscriptions.size}`)
  
  // In production: await db.subscriptions.create({ data: { id, subscription: sub } })
  return { success: true, subscriptionId: id }
}

/**
 * Unsubscribe a user from push notifications
 * Removes the stored subscription by ID
 * @param subscriptionId - The subscription ID to remove
 * @returns Success response
 */
export async function unsubscribeUser(subscriptionId?: string): Promise<PushActionResponse> {
  if (subscriptionId) {
    subscriptions.delete(subscriptionId)
    console.log(`🗑️ Removed subscription: ${subscriptionId}`)
  } else {
    // Clear all if no ID provided
    subscriptions.clear()
    console.log(`🗑️ Cleared all subscriptions`)
  }
  
  // In production: await db.subscriptions.delete({ where: { id: subscriptionId } })
  return { success: true }
}

/**
 * Send a push notification to a specific subscription ID or current device
 * @param message - The notification message body
 * @param subscriptionId - The target subscription ID (optional - uses current device if not provided)
 * @returns Success or error response
 */
export async function sendNotification(message: string, subscriptionId?: string): Promise<PushActionResponse> {
  // If no subscription ID provided, try to send to any available subscription
  if (!subscriptionId) {
    const availableIds = Array.from(subscriptions.keys())
    if (availableIds.length === 0) {
      return { success: false, error: 'No subscriptions available' }
    }
    // Use the first available subscription as fallback
    subscriptionId = availableIds[0]
    console.log(`📱 No target ID specified, using: ${subscriptionId}`)
  }

  const targetSubscription = subscriptions.get(subscriptionId)
  if (!targetSubscription) {
    const availableIds = Array.from(subscriptions.keys())
    console.log(`❌ Subscription not found: ${subscriptionId}`)
    console.log(`📋 Available subscriptions: ${availableIds.join(', ') || 'none'}`)
    return { 
      success: false, 
      error: `Subscription '${subscriptionId}' not found. Available: ${availableIds.join(', ') || 'none'}` 
    }
  }

  try {
    console.log(`🎯 Sending to subscription ID: ${subscriptionId}`)
    console.log(`📱 Target endpoint: ${targetSubscription.endpoint.substring(0, 50)}...`)
    
    await webpush.sendNotification(
      targetSubscription as unknown as webpush.PushSubscription,
      JSON.stringify({
        title: 'Car Rentals',
        body: message,
        icon: '/android-chrome-192x192.png',
        data: {
          targetId: subscriptionId,
          timestamp: Date.now(),
          source: 'admin-portal'
        }
      })
    )
    
    console.log(`✅ Notification sent successfully to: ${subscriptionId}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}

/**
 * Send notification to all subscribed users
 * @param message - The notification message body
 * @returns Success response with details
 */
export async function sendNotificationToAll(message: string): Promise<PushActionResponse & { sentCount?: number }> {
  const allIds = Array.from(subscriptions.keys())
  
  if (allIds.length === 0) {
    return { success: false, error: 'No subscriptions available' }
  }

  let sentCount = 0
  const errors: string[] = []

  for (const id of allIds) {
    try {
      const result = await sendNotification(message, id)
      if (result.success) {
        sentCount++
      } else {
        errors.push(`${id}: ${result.error}`)
      }
    } catch (error) {
      errors.push(`${id}: ${error}`)
    }
  }

  console.log(`📊 Sent to ${sentCount}/${allIds.length} subscriptions`)
  
  return {
    success: sentCount > 0,
    sentCount,
    error: errors.length > 0 ? `Some failed: ${errors.join(', ')}` : undefined
  }
}

/**
 * Get all stored subscription IDs
 * @returns Array of subscription IDs
 */
export async function getAllSubscriptionIds(): Promise<{ success: boolean; ids?: string[] }> {
  return { 
    success: true, 
    ids: Array.from(subscriptions.keys()) 
  }
}
