'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, BellOff, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { SerializedPushSubscription } from '../types'
import { isPushNotificationSupported, urlBase64ToUint8Array } from '../utils'

/**
 * PushNotificationManager Component
 * Handles push notification subscription, unsubscription, and sending test notifications
 * Isolated component for PWA push notification functionality
 */
export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [message, setMessage] = useState('')
  const [subscriberId, setSubscriberId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Generate a simple ID from subscription endpoint for display
  const currentDeviceId = subscription ? 
    subscription.endpoint.split('/').pop()?.substring(0, 8) || 'unknown' : 
    'not-subscribed'

  useEffect(() => {
    // Check if push notifications are supported
    if (isPushNotificationSupported()) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  /**
   * Register the service worker and get existing subscription
   */
  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/push-sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error('Service worker registration failed:', error)
    }
  }

  /**
   * Subscribe the user to push notifications
   */
  async function subscribeToPush() {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ) as BufferSource,
      })
      setSubscription(sub)
      
      // Serialize subscription for server storage
      const serializedSub: SerializedPushSubscription = JSON.parse(JSON.stringify(sub))
      
      // Subscribe with the current device ID via API
      const response = await fetch('/api/pwa/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: serializedSub,
          subscriptionId: currentDeviceId,
          userId: undefined // Can be set later for user association
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.subscriptionId) {
        console.log(`✅ Subscribed with ID: ${result.subscriptionId}`)
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Unsubscribe the user from push notifications
   */
  async function unsubscribeFromPush() {
    setIsLoading(true)
    try {
      await subscription?.unsubscribe()
      setSubscription(null)
      
      // Unsubscribe using the current device ID via API
      const response = await fetch('/api/pwa/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: currentDeviceId
        })
      })
      
      const result = await response.json()
      if (result.success) {
        console.log(`✅ Unsubscribed: ${currentDeviceId}`)
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Send a test notification to the subscribed user
   */
  async function sendTestNotification() {
    if (!subscription || !message.trim()) return
    
    setIsLoading(true)
    try {
      // Pass the subscription ID for experimentation
      const targetId = subscriberId || currentDeviceId
      console.log('🔔 Sending notification to subscriber ID:', targetId)
      console.log('📱 Message:', message)
      
      // Send notification via API
      const response = await fetch('/api/pwa/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          subscriptionId: targetId
        })
      })
      
      const result = await response.json()
      if (result.success) {
        console.log(`✅ Notification sent successfully`)
        setMessage('')
      } else {
        console.error('Failed to send notification:', result.error)
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render if push notifications are not supported
  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          Push notifications are not supported in this browser.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-gray-900">Push Notifications</h3>
      </div>

      {subscription ? (
        <div className="space-y-3">
          <p className="text-sm text-green-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            You are subscribed to push notifications.
          </p>
          
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Current Device ID:</p>
            <p className="text-sm font-mono text-gray-900 break-all">
              {currentDeviceId}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Full endpoint: {subscription.endpoint.substring(0, 50)}...
            </p>
          </div>
          
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Subscriber ID (for experimentation)"
              value={subscriberId}
              onChange={(e) => setSubscriberId(e.target.value)}
              className="w-full"
            />
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter notification message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={sendTestNotification}
                disabled={isLoading || !message.trim()}
                size="sm"
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </div>

          <Button
            onClick={unsubscribeFromPush}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <BellOff className="h-4 w-4 mr-2" />
            Unsubscribe
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            You are not subscribed to push notifications.
          </p>
          <Button
            onClick={subscribeToPush}
            disabled={isLoading}
            className="w-full"
          >
            <Bell className="h-4 w-4 mr-2" />
            Subscribe to Notifications
          </Button>
        </div>
      )}
    </div>
  )
}
