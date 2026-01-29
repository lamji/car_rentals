import {
  PUSH_SUBSCRIPTIONS_COLLECTION,
  PUSH_SUBSCRIPTION_INDEXES,
  PushSubscriptionDocument
} from '@/lib/models/PushSubscription'
import { getDatabase } from '@/lib/mongodb'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/subscriptions
 * Retrieve all active push subscriptions
 */
export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection<PushSubscriptionDocument>(PUSH_SUBSCRIPTIONS_COLLECTION)
    
    // Ensure indexes exist
    await createIndexes(collection)
    
    const subscriptions = await collection
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray()
    
    return NextResponse.json({
      success: true,
      data: subscriptions,
      count: subscriptions.length
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/subscriptions
 * Create or update a push subscription
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscriptionId, userId, endpoint, keys, userAgent } = body
    
    if (!subscriptionId || !endpoint || !keys) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const collection = db.collection<PushSubscriptionDocument>(PUSH_SUBSCRIPTIONS_COLLECTION)
    
    // Ensure indexes exist
    await createIndexes(collection)
    
    const now = new Date()
    const subscriptionDoc: Omit<PushSubscriptionDocument, '_id'> = {
      subscriptionId,
      userId,
      endpoint,
      keys,
      userAgent,
      createdAt: now,
      updatedAt: now,
      isActive: true
    }
    
    // Upsert subscription (update if exists, create if not)
    const result = await collection.replaceOne(
      { subscriptionId },
      subscriptionDoc,
      { upsert: true }
    )
    
    return NextResponse.json({
      success: true,
      data: {
        subscriptionId,
        upserted: result.upsertedCount > 0,
        modified: result.modifiedCount > 0
      }
    })
  } catch (error) {
    console.error('Error creating/updating subscription:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save subscription' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/subscriptions
 * Remove a push subscription
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get('subscriptionId')
    
    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, error: 'subscriptionId is required' },
        { status: 400 }
      )
    }
    
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

/**
 * Create database indexes for optimal performance
 */
async function createIndexes(collection: import('mongodb').Collection<PushSubscriptionDocument>) {
  try {
    for (const index of PUSH_SUBSCRIPTION_INDEXES) {
      await collection.createIndex(index.key, { 
        unique: index.unique || false,
        background: true 
      })
    }
  } catch (error:any) {
    // Indexes might already exist, ignore duplicate key errors
    if (!error.message?.includes('already exists')) {
      console.error('Error creating indexes:', error)
    }
  }
}
