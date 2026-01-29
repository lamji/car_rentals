'use server'

import webpush from 'web-push'
import { getDatabase } from '@/lib/mongodb'
import { 
  PushSubscriptionDocument, 
  PUSH_SUBSCRIPTIONS_COLLECTION 
} from '@/lib/models/PushSubscription'
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
 * Subscribe a user to push notifications (Database version)
 * Stores the subscription in MongoDB with a custom ID for targeting
 * @param sub - The serialized push subscription
 * @param subscriptionId - Custom ID for this subscription (optional)
 * @param userId - User ID for association (optional)
 * @returns Success response with subscription ID
 */
export async function subscribeUserDB(
  sub: SerializedPushSubscription, 
  subscriptionId?: string,
  userId?: string
): Promise<PushActionResponse & { subscriptionId?: string }> {
  try {
    // Generate ID from endpoint if not provided
    const id = subscriptionId || sub.endpoint.split('/').pop()?.substring(0, 8) || 'unknown'
    
    const db = await getDatabase()
    const collection = db.collection<PushSubscriptionDocument>(PUSH_SUBSCRIPTIONS_COLLECTION)
    
    const now = new Date()
    const subscriptionDoc: Omit<PushSubscriptionDocument, '_id'> = {
      subscriptionId: id,
      userId,
      endpoint: sub.endpoint,
      keys: sub.keys,
      expirationTime: sub.expirationTime,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      createdAt: now,
      updatedAt: now,
      isActive: true
    }
    
    // Upsert subscription (update if exists, create if not)
    await collection.replaceOne(
      { subscriptionId: id },
      subscriptionDoc,
      { upsert: true }
    )
    
    console.log(`📱 Subscription stored in DB with ID: ${id}`)
    
    return { success: true, subscriptionId: id }
  } catch (error) {
    console.error('Error storing subscription in database:', error)
    return { success: false, error: 'Failed to store subscription' }
  }
}

/**
 * Unsubscribe a user from push notifications (Database version)
 * Removes the stored subscription by ID from MongoDB
 * @param subscriptionId - The subscription ID to remove
 * @returns Success response
 */
export async function unsubscribeUserDB(subscriptionId?: string): Promise<PushActionResponse> {
  try {
    const db = await getDatabase()
    const collection = db.collection<PushSubscriptionDocument>(PUSH_SUBSCRIPTIONS_COLLECTION)
    
    if (subscriptionId) {
      // Soft delete specific subscription
      const result = await collection.updateOne(
        { subscriptionId },
        { 
          $set: { 
            isActive: false, 
            updatedAt: new Date() 
          } 
        }
      )
      
      if (result.matchedCount > 0) {
        console.log(`🗑️ Removed subscription from DB: ${subscriptionId}`)
      } else {
        console.log(`❌ Subscription not found in DB: ${subscriptionId}`)
      }
    } else {
      // Deactivate all subscriptions (fallback)
      await collection.updateMany(
        { isActive: true },
        { 
          $set: { 
            isActive: false, 
            updatedAt: new Date() 
          } 
        }
      )
      console.log(`🗑️ Deactivated all subscriptions in DB`)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error removing subscription from database:', error)
    return { success: false, error: 'Failed to remove subscription' }
  }
}

/**
 * Send a push notification to a specific subscription ID (Database version)
 * @param message - The notification message body
 * @param subscriptionId - The target subscription ID (optional - uses any available if not provided)
 * @returns Success or error response
 */
export async function sendNotificationDB(message: string, subscriptionId?: string): Promise<PushActionResponse> {
  try {
    const db = await getDatabase()
    const collection = db.collection<PushSubscriptionDocument>(PUSH_SUBSCRIPTIONS_COLLECTION)
    
    let targetSubscription: PushSubscriptionDocument | null = null
    
    if (subscriptionId) {
      // Find specific subscription
      targetSubscription = await collection.findOne({ 
        subscriptionId, 
        isActive: true 
      })
    } else {
      // Find any active subscription as fallback
      targetSubscription = await collection.findOne({ 
        isActive: true 
      })
      if (targetSubscription) {
        subscriptionId = targetSubscription.subscriptionId
        console.log(`📱 No target ID specified, using: ${subscriptionId}`)
      }
    }
    
    if (!targetSubscription) {
      // Get available subscription IDs for error message
      const availableSubs = await collection
        .find({ isActive: true }, { projection: { subscriptionId: 1 } })
        .toArray()
      const availableIds = availableSubs.map(sub => sub.subscriptionId)
      
      console.log(`❌ Subscription not found: ${subscriptionId}`)
      console.log(`📋 Available subscriptions: ${availableIds.join(', ') || 'none'}`)
      
      return { 
        success: false, 
        error: `Subscription '${subscriptionId}' not found. Available: ${availableIds.join(', ') || 'none'}` 
      }
    }
    
    console.log(`🎯 Sending to subscription ID: ${subscriptionId}`)
    console.log(`📱 Target endpoint: ${targetSubscription.endpoint.substring(0, 50)}...`)
    
    // Convert to webpush format
    const webpushSubscription = {
      endpoint: targetSubscription.endpoint,
      keys: targetSubscription.keys,
      expirationTime: targetSubscription.expirationTime
    }
    
    await webpush.sendNotification(
      webpushSubscription as unknown as webpush.PushSubscription,
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
 * Send notification to all subscribed users (Database version)
 * @param message - The notification message body
 * @returns Success response with details
 */
export async function sendNotificationToAllDB(message: string): Promise<PushActionResponse & { sentCount?: number }> {
  try {
    const db = await getDatabase()
    const collection = db.collection<PushSubscriptionDocument>(PUSH_SUBSCRIPTIONS_COLLECTION)
    
    const activeSubscriptions = await collection
      .find({ isActive: true })
      .toArray()
    
    if (activeSubscriptions.length === 0) {
      return { success: false, error: 'No active subscriptions available' }
    }
    
    let sentCount = 0
    const errors: string[] = []
    
    for (const subscription of activeSubscriptions) {
      try {
        const result = await sendNotificationDB(message, subscription.subscriptionId)
        if (result.success) {
          sentCount++
        } else {
          errors.push(`${subscription.subscriptionId}: ${result.error}`)
        }
      } catch (error) {
        errors.push(`${subscription.subscriptionId}: ${error}`)
      }
    }
    
    console.log(`📊 Sent to ${sentCount}/${activeSubscriptions.length} subscriptions`)
    
    return {
      success: sentCount > 0,
      sentCount,
      error: errors.length > 0 ? `Some failed: ${errors.join(', ')}` : undefined
    }
  } catch (error) {
    console.error('Error broadcasting notifications:', error)
    return { success: false, error: 'Failed to broadcast notifications' }
  }
}

/**
 * Get all stored subscription IDs (Database version)
 * @returns Array of subscription IDs
 */
export async function getAllSubscriptionIdsDB(): Promise<{ success: boolean; ids?: string[] }> {
  try {
    const db = await getDatabase()
    const collection = db.collection<PushSubscriptionDocument>(PUSH_SUBSCRIPTIONS_COLLECTION)
    
    const subscriptions = await collection
      .find({ isActive: true }, { projection: { subscriptionId: 1 } })
      .toArray()
    
    const ids = subscriptions.map(sub => sub.subscriptionId)
    
    return { 
      success: true, 
      ids 
    }
  } catch (error) {
    console.error('Error fetching subscription IDs:', error)
    return { success: false, ids: [] }
  }
}
