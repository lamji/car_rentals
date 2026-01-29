import { getDatabase } from '@/lib/mongodb'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Check if a device is already subscribed to push notifications
 * Prevents duplicate subscriptions by validating device ID
 */
export async function POST(request: NextRequest) {
  try {
    const { deviceId } = await request.json()
    
    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 })
    }

    // Connect to database
    const db = await getDatabase()
    const collection = db.collection('pushSubscriptions')

    // Check if device already has an active subscription
    const existingSubscription = await collection.findOne({
      deviceId: deviceId,
      isActive: true
    })

    return NextResponse.json({
      success: true,
      isSubscribed: !!existingSubscription,
      subscriptionId: existingSubscription?.subscriptionId || null,
      data: existingSubscription ? {
        subscriptionId: existingSubscription.subscriptionId,
        createdAt: existingSubscription.createdAt,
        endpoint: existingSubscription.endpoint
      } : null
    })

  } catch (error) {
    console.error('Error checking device subscription:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check device subscription status'
    }, { status: 500 })
  }
}
