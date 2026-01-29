/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDatabase } from '@/lib/mongodb';
import {
    PUSH_SUBSCRIPTIONS_COLLECTION,
    PushSubscriptionDocument
} from '@/lib/pwaService/models/PushSubscription';
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

/**
 * Configure VAPID details for web push validation
 */
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@carrentals.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Validate a push subscription by sending a silent test notification
 * POST /api/subscriptions/validate
 * @param request - Request with subscriptionId and optional silent flag
 * @returns Response with validation result
 */
export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, silent = true } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { valid: false, error: 'Subscription ID is required' },
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
        { valid: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Convert to webpush format
    const webpushSubscription = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      expirationTime: subscription.expirationTime
    };

    try {
      // Send silent test notification
      await webpush.sendNotification(
        webpushSubscription as unknown as webpush.PushSubscription,
        JSON.stringify({
          title: silent ? '' : 'Connection Test',
          body: silent ? '' : 'Your notifications are working!',
          silent: silent,
          tag: 'validation-test',
          data: {
            type: 'validation',
            subscriptionId,
            timestamp: Date.now()
          }
        }),
        {
          TTL: silent ? 0 : 60 // Don't store silent notifications
        }
      );

      // Update last validated timestamp
      await collection.updateOne(
        { subscriptionId },
        { 
          $set: { 
            lastValidated: new Date(),
            updatedAt: new Date()
          } 
        }
      );

      console.log(`✅ Subscription validated: ${subscriptionId}`);
      
      return NextResponse.json({
        valid: true,
        subscriptionId,
        lastValidated: new Date().toISOString()
      });

    } catch (pushError: any) {
      // Handle expired subscription (410 error)
      if (pushError.statusCode === 410) {
        console.log(`🗑️ Subscription expired during validation: ${subscriptionId}`);
        
        // Mark as inactive
        await collection.updateOne(
          { subscriptionId },
          { 
            $set: { 
              isActive: false, 
              updatedAt: new Date(),
              expiredAt: new Date()
            } 
          }
        );

        return NextResponse.json({
          valid: false,
          error: 'Subscription expired',
          statusCode: 410
        });
      }

      // Other push errors
      console.error('Push validation error:', pushError);
      return NextResponse.json({
        valid: false,
        error: 'Push validation failed',
        statusCode: pushError.statusCode || 500
      });
    }

  } catch (error: any) {
    console.error('Validation endpoint error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
