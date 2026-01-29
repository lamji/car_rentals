import { getDatabase } from '@/lib/mongodb'
import { NextRequest, NextResponse } from 'next/server'
import { subscribeUserDB } from '../../../../lib/npm-ready-stack/pwaService/db-actions'

/**
 * POST /api/pwa/subscribe
 * Subscribe a user to push notifications
 */
export async function POST(request: NextRequest) {
  try {
    const { subscription, deviceId, userAgent } = await request.json()
    
    if (!subscription) {
      return NextResponse.json({
        success: false,
        error: 'Subscription data is required'
      }, { status: 400 })
    }

    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 })
    }

    // Check if device is already subscribed
    const db = await getDatabase()
    const collection = db.collection('pushSubscriptions')
    
    const existingSubscription = await collection.findOne({
      deviceId: deviceId,
      isActive: true
    })

    if (existingSubscription) {
      return NextResponse.json({
        success: true,
        subscriptionId: existingSubscription.subscriptionId,
        message: 'Device already subscribed'
      })
    }

    // Create new subscription with device ID
    const result = await subscribeUserDB(subscription, deviceId, userAgent)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in subscribe route:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
