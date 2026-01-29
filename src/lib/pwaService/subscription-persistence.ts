"use client";

/**
 * Subscription Persistence Service
 * Handles automatic subscription renewal and validation to prevent expiration
 */

/**
 * Check if current subscription is still valid by sending a test notification
 * @param subscriptionId - The subscription ID to validate
 * @returns Promise<boolean> - Whether the subscription is still valid
 */
async function validateSubscription(subscriptionId: string): Promise<boolean> {
  try {
    // Send a silent test notification to validate subscription
    const response = await fetch('/api/subscriptions/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        subscriptionId,
        silent: true 
      })
    });

    const result = await response.json();
    return result.valid === true;
  } catch (error) {
    console.log('🔍 Subscription validation failed:', error);
    return false;
  }
}

/**
 * Get current push subscription from service worker
 * @returns Promise<PushSubscription | null> - Current subscription or null
 */
async function getCurrentSubscription(): Promise<PushSubscription | null> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.log('🔍 Could not get current subscription:', error);
    return null;
  }
}

/**
 * Subscribe to push notifications with automatic persistence
 * @returns Promise<string | null> - Subscription ID or null if failed
 */
async function subscribeWithPersistence(): Promise<string | null> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('❌ Push notifications not supported');
      return null;
    }

    // Check if already subscribed
    const existingSubscription = await getCurrentSubscription();
    if (existingSubscription) {
      console.log('✅ Already subscribed to push notifications');
      return localStorage.getItem('pwa-subscription-id');
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('❌ Notification permission denied');
      return null;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    });

    // Send subscription to server
    const response = await fetch('/api/pwa/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      })
    });

    const result = await response.json();
    
    if (result.success && result.subscriptionId) {
      // Store subscription ID locally for persistence tracking
      localStorage.setItem('pwa-subscription-id', result.subscriptionId);
      localStorage.setItem('pwa-subscription-created', Date.now().toString());
      
      console.log('✅ Subscribed with persistence:', result.subscriptionId);
      return result.subscriptionId;
    }

    return null;
  } catch (error) {
    console.error('❌ Subscription with persistence failed:', error);
    return null;
  }
}

/**
 * Refresh subscription if it's expired or invalid
 * @returns Promise<string | null> - New subscription ID or null if failed
 */
async function refreshSubscriptionIfNeeded(): Promise<string | null> {
  try {
    const storedSubscriptionId = localStorage.getItem('pwa-subscription-id');
    const currentSubscription = await getCurrentSubscription();

    // If no stored ID or no current subscription, create new one
    if (!storedSubscriptionId || !currentSubscription) {
      console.log('🔄 No valid subscription found, creating new one...');
      return await subscribeWithPersistence();
    }

    // Validate current subscription
    const isValid = await validateSubscription(storedSubscriptionId);
    
    if (!isValid) {
      console.log('🔄 Subscription expired, refreshing...');
      
      // Unsubscribe old subscription
      await currentSubscription.unsubscribe();
      
      // Clear old data
      localStorage.removeItem('pwa-subscription-id');
      localStorage.removeItem('pwa-subscription-created');
      
      // Create new subscription
      return await subscribeWithPersistence();
    }

    console.log('✅ Subscription is still valid:', storedSubscriptionId);
    return storedSubscriptionId;
  } catch (error) {
    console.error('❌ Subscription refresh failed:', error);
    return null;
  }
}

/**
 * Send periodic heartbeat to keep subscription alive
 * @param subscriptionId - The subscription ID to ping
 * @returns Promise<boolean> - Whether heartbeat was successful
 */
async function sendHeartbeat(subscriptionId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/subscriptions/heartbeat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        subscriptionId,
        timestamp: Date.now()
      })
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.log('💓 Heartbeat failed:', error);
    return false;
  }
}

/**
 * Initialize subscription persistence system
 * Sets up automatic validation and renewal
 * @returns Promise<void>
 */
export async function initializeSubscriptionPersistence(): Promise<void> {
  try {
    console.log('🚀 Initializing subscription persistence...');

    // Initial subscription check/creation
    await refreshSubscriptionIfNeeded();

    // Set up periodic validation (every 24 hours)
    const validationInterval = setInterval(async () => {
      const subscriptionId = await refreshSubscriptionIfNeeded();
      
      if (subscriptionId) {
        // Send heartbeat to keep subscription active
        await sendHeartbeat(subscriptionId);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Set up heartbeat (every 6 hours)
    const heartbeatInterval = setInterval(async () => {
      const subscriptionId = localStorage.getItem('pwa-subscription-id');
      if (subscriptionId) {
        await sendHeartbeat(subscriptionId);
      }
    }, 6 * 60 * 60 * 1000); // 6 hours

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(validationInterval);
      clearInterval(heartbeatInterval);
    });

    console.log('✅ Subscription persistence initialized');
  } catch (error) {
    console.error('❌ Failed to initialize subscription persistence:', error);
  }
}

/**
 * Manual subscription refresh (for user-triggered actions)
 * @returns Promise<boolean> - Whether refresh was successful
 */
export async function manualRefreshSubscription(): Promise<boolean> {
  const subscriptionId = await refreshSubscriptionIfNeeded();
  return subscriptionId !== null;
}

/**
 * Get current subscription status
 * @returns Promise<{subscribed: boolean, subscriptionId: string | null, valid: boolean}>
 */
export async function getSubscriptionStatus(): Promise<{
  subscribed: boolean;
  subscriptionId: string | null;
  valid: boolean;
}> {
  try {
    const subscriptionId = localStorage.getItem('pwa-subscription-id');
    const currentSubscription = await getCurrentSubscription();
    
    if (!subscriptionId || !currentSubscription) {
      return { subscribed: false, subscriptionId: null, valid: false };
    }

    const valid = await validateSubscription(subscriptionId);
    
    return {
      subscribed: true,
      subscriptionId,
      valid
    };
  } catch (error) {
    console.error('❌ Failed to get subscription status:', error);
    return { subscribed: false, subscriptionId: null, valid: false };
  }
}
