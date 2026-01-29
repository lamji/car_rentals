import { getDatabase } from '@/lib/mongodb'
import {
    PUSH_SUBSCRIPTIONS_COLLECTION,
    PushSubscriptionDocument
} from '@/lib/npm-ready-stack/pwaService/models/PushSubscription'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/subscriptions/[id]
 * Get a specific push subscription by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const subscriptionId = id
    
    const db = await getDatabase()
    const collection = db.collection<PushSubscriptionDocument>(PUSH_SUBSCRIPTIONS_COLLECTION)
    
    const subscription = await collection.findOne({ 
      subscriptionId,
      isActive: true 
    })
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: subscription
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/subscriptions/[id]
 * Update a specific push subscription
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const subscriptionId = id
    const body = await request.json()
    const { userId, userAgent, isActive } = body
    
    const db = await getDatabase()
    const collection = db.collection<PushSubscriptionDocument>(PUSH_SUBSCRIPTIONS_COLLECTION)
    
    const updateData: Partial<PushSubscriptionDocument> = {
      updatedAt: new Date()
    }
    
    if (userId !== undefined) updateData.userId = userId
    if (userAgent !== undefined) updateData.userAgent = userAgent
    if (isActive !== undefined) updateData.isActive = isActive
    
    const result = await collection.updateOne(
      { subscriptionId },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: { subscriptionId, updated: true }
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/subscriptions/[id]
 * Delete a specific push subscription
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const subscriptionId = id
    
    const db = await getDatabase()
    const collection = db.collection<PushSubscriptionDocument>(PUSH_SUBSCRIPTIONS_COLLECTION)
    
    // Soft delete by setting isActive to false
    const result = await collection.updateOne(
      { subscriptionId },
      { 
        $set: { 
          isActive: false, 
          updatedAt: new Date() 
        } 
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: { subscriptionId, deleted: true }
    })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete subscription' },
      { status: 500 }
    )
  }
}
