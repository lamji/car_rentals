'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { showAlert } from '@/lib/slices/alertSlice'
import {
  getDeviceId,
  isDeviceSubscribedLocally,
  setLocalSubscriptionStatus
} from '@/lib/utils/deviceId'
import { Bell, CheckCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

/**
 * Smart subscription alert that checks local storage and database
 * Only shows subscription prompt if device is not already subscribed
 */
export function SmartSubscriptionAlert() {
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const dispatch = useDispatch()

  /**
   * Check if device should show subscription alert
   * Validates both local storage and database to prevent duplicates
   */

  /**
   * Check if notification permission has been revoked and show alert if needed
   */
  async function checkPermissionStatus() {
    try {
      // Only check if we think we're subscribed locally
      if (isDeviceSubscribedLocally()) {
        const permission = Notification.permission
        console.log('🔍 Periodic permission check:', permission)
        
        // If permission was revoked, show the alert again
        if (permission === 'denied' || permission === 'default') {
          console.log('⚠️ Permission revoked - showing subscription alert again')
          setShowSubscriptionPrompt(true)
        }
      }
    } catch (error) {
      console.error('Error checking permission status:', error)
    }
  }

  useEffect(() => {
    async function checkSubscriptionStatus() {
      try {
        // First check local storage for quick response
        const isLocallySubscribed = isDeviceSubscribedLocally()
        
        if (isLocallySubscribed) {
          setIsChecking(false)
          return // Don't show alert if locally subscribed
        }

        // Check database for definitive status
        const deviceId = getDeviceId()
        const response = await fetch('/api/subscriptions/check-device', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deviceId })
        })

        const result = await response.json()

        if (result.success) {
          if (result.isSubscribed) {
            // Device is subscribed in database but not locally - sync local storage
            setLocalSubscriptionStatus(true, result.subscriptionId)
            setShowSubscriptionPrompt(false)
          } else {
            // Device is not subscribed anywhere - show alert
            setShowSubscriptionPrompt(true)
          }
        } else {
          // Error checking database - show alert as fallback
          setShowSubscriptionPrompt(true)
        }
      } catch (error) {
        console.error('Error checking subscription status:', error)
        // Show alert on error as fallback
        setShowSubscriptionPrompt(true)
      } finally {
        setIsChecking(false)
      }
    }

    // Only check if browser supports service workers
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      checkSubscriptionStatus()
      
      // Set up periodic permission check (every 30 seconds)
      const permissionCheckInterval = setInterval(checkPermissionStatus, 30000)
      
      return () => clearInterval(permissionCheckInterval)
    } else {
      setIsChecking(false)
    }
  }, [])

  /**
   * Check notification permission status and request if not granted
   * @returns {Promise<boolean>} True if permission is granted, false otherwise
   */
  async function checkAndRequestPermission(): Promise<boolean> {
    console.log('🔐 Checking notification permission status...')
    
    // Check current permission status
    let permission = Notification.permission
    console.log('🔐 Current permission:', permission)
    
    if (permission === 'granted') {
      console.log('✅ Notification permission already granted')
      return true
    }
    
    if (permission === 'denied') {
      console.log('❌ Notification permission denied - cannot request again')
      dispatch(showAlert({
        type: 'warning',
        title: 'Notifications Blocked',
        message: 'Notifications are blocked. Please enable them in your browser settings to receive updates.',
        duration: 6000
      }))
      return false
    }
    
    // Permission is 'default' - request permission
    console.log('🔐 Requesting notification permission...')
    permission = await Notification.requestPermission()
    console.log('🔐 Permission result:', permission)
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted')
      return true
    } else {
      console.log('❌ Notification permission denied by user')
      dispatch(showAlert({
        type: 'warning',
        title: 'Notifications Denied',
        message: 'Notifications were denied. You can enable them later in your browser settings.',
        duration: 5000
      }))
      return false
    }
  }

  /**
   * Handle subscription process with device ID validation
   */
  async function handleSubscribe() {
    console.log('🔔 Starting subscription process...')
    setIsSubscribing(true)

    try {
      // Check if service worker is supported
      console.log('📋 Checking service worker support...')
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('❌ Push notifications not supported')
        dispatch(showAlert({
          type: 'error',
          title: 'Notifications Not Supported',
          message: 'Push notifications are not supported in this browser. Please try a modern browser.',
          duration: 5000
        }))
        return
      }
      console.log('✅ Service worker supported')

      // Register service worker with push handling
      console.log('🔧 Registering service worker...')
      const registration = await navigator.serviceWorker.register('/push-sw.js')
      console.log('✅ Service worker registered:', registration)
      
      console.log('⏳ Waiting for service worker to be ready...')
      await navigator.serviceWorker.ready
      console.log('✅ Service worker ready')

      // Check and request notification permission
      const hasPermission = await checkAndRequestPermission()
      if (!hasPermission) {
        return
      }

      // Get device ID
      console.log('📱 Getting device ID...')
      const deviceId = getDeviceId()
      console.log('📱 Device ID:', deviceId)

      // Check VAPID key
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      console.log('🔑 VAPID key available:', !!vapidKey)
      console.log('🔑 VAPID key length:', vapidKey?.length || 0)

      if (!vapidKey) {
        console.log('❌ VAPID key missing')
        dispatch(showAlert({
          type: 'error',
          title: 'Configuration Error',
          message: 'Push notification configuration is missing. Please contact support.',
          duration: 5000
        }))
        return
      }

      // Subscribe to push notifications
      console.log('📡 Subscribing to push notifications...')
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      })
      console.log('✅ Push subscription created:', subscription)

      // Send subscription to server with device ID
      console.log('🌐 Sending subscription to server...')
      const response = await fetch('/api/pwa/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          deviceId,
          userAgent: navigator.userAgent
        })
      })
      console.log('🌐 Server response status:', response.status)

      const result = await response.json()
      console.log('🌐 Server response:', result)

      if (result.success) {
        // Store subscription status locally
        setLocalSubscriptionStatus(true, result.subscriptionId)
        
        // Hide alert
        setShowSubscriptionPrompt(false)
        
        // Show success message
        console.log('🎉 Subscription successful!')
        dispatch(showAlert({
          type: 'success',
          title: 'Notifications Enabled!',
          message: 'You will now receive push notifications from Car Rentals.',
          duration: 4000
        }))
      } else {
        console.log('❌ Subscription failed:', result.error)
        dispatch(showAlert({
          type: 'error',
          title: 'Subscription Failed',
          message: result.error || 'Failed to subscribe to notifications. Please try again.',
          duration: 5000
        }))
      }
    } catch (error: unknown) {
      console.error('💥 Subscription error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while subscribing to notifications.'
      dispatch(showAlert({
        type: 'error',
        title: 'Subscription Error',
        message: errorMessage,
        duration: 5000
      }))
    } finally {
      console.log('🏁 Subscription process completed')
      setIsSubscribing(false)
    }
  }

  /**
   * Handle dismissing the alert (don't show again for this session)
   */
  function handleDismiss() {
    setShowSubscriptionPrompt(false)
    // Store dismissal in session storage (not persistent across browser restarts)
    sessionStorage.setItem('car_rentals_subscription_dismissed', 'true')
  }

  // Don't render anything while checking or if alert shouldn't be shown
  if (isChecking || !showSubscriptionPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="border-primary/20 bg-white shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">Stay Updated</h3>
                <Badge variant="secondary" className="text-xs">New</Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                Get instant notifications about your bookings, special offers, and car availability updates.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  size="sm"
                  className="flex-1"
                >
                  {isSubscribing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Enable Notifications
                    </>
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="px-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
