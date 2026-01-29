/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDatabase } from '@/lib/mongodb';
import {
    PUSH_SUBSCRIPTIONS_COLLECTION,
    PushSubscriptionDocument
} from '@/lib/npm-ready-stack/pwaService/models/PushSubscription';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Send heartbeat to keep subscription active
 * POST /api/subscriptions/heartbeat
 * @param request - Request with subscriptionId and timestamp
 * @returns Response with heartbeat result
 */
export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, timestamp } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Get subscription from database
    const db = await getDatabase();
    const collection = db.collection<PushSubscriptionDocument>(PUSH_SUBSCRIPTIONS_COLLECTION);
    
    const subscription = await collection.findOne({ 
      subscriptionId, 
      isActive: true 
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found or inactive' },
        { status: 404 }
      );
    }

    // Update heartbeat timestamp
    const result = await collection.updateOne(
      { subscriptionId },
      { 
        $set: { 
          lastHeartbeat: new Date(),
          updatedAt: new Date(),
          clientTimestamp: timestamp ? new Date(timestamp) : new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to update heartbeat' },
        { status: 500 }
      );
    }

    console.log(`💓 Heartbeat received from: ${subscriptionId}`);
    
    return NextResponse.json({
      success: true,
      subscriptionId,
      heartbeatTime: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Heartbeat endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
