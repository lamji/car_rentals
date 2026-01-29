'use client'

import { Button } from '@/components/ui/button'
import { Download, Plus, Share2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isIOSDevice, isStandaloneMode } from '../utils'

/**
 * InstallPrompt Component
 * Shows one-time installation alert for PWA
 * Checks if app is installed and manages dismissal state
 */
export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check device type and installation status
    setIsIOS(isIOSDevice())
    setIsStandalone(isStandaloneMode())

    // Check if user has already dismissed the prompt this session
    const dismissed = sessionStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show prompt after a short delay if not installed and not dismissed
    const timer = setTimeout(() => {
      if (!isStandaloneMode() && !dismissed) {
        setShowPrompt(true)
      }
    }, 2000) // Show after 2 seconds

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearTimeout(timer)
    }
  }, [])

  /**
   * Trigger the native install prompt (for supported browsers)
   */
  async function handleInstallClick() {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      handleDismiss()
    }
  }

  /**
   * Dismiss the install prompt and remember for this session
   */
  function handleDismiss() {
    setIsDismissed(true)
    setShowPrompt(false)
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed, dismissed, or not ready to show
  if (isStandalone || isDismissed || !showPrompt) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-gray-900 text-sm">Install App</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {deferredPrompt ? (
          // Show install button for supported browsers
          <div className="space-y-2">
            <p className="text-xs text-gray-600">
              Install Car Rentals for quick access and offline features.
            </p>
            <Button onClick={handleInstallClick} size="sm" className="w-full">
              <Download className="h-3 w-3 mr-2" />
              Add to Home Screen
            </Button>
          </div>
        ) : isIOS ? (
          // Show iOS-specific instructions
          <div className="space-y-2">
            <p className="text-xs text-gray-600">
              Install this app on your iOS device:
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <span>1. Tap</span>
                <Share2 className="h-3 w-3 text-blue-500" />
                <span>share button</span>
              </div>
              <div className="flex items-center gap-2">
                <span>2. Select</span>
                <Plus className="h-3 w-3 text-green-500" />
                <span>&quot;Add to Home Screen&quot;</span>
              </div>
            </div>
          </div>
        ) : (
          // Generic message for other browsers
          <div className="space-y-2">
            <p className="text-xs text-gray-600">
              Install Car Rentals for better experience.
            </p>
            <p className="text-xs text-gray-500">
              Use your browser&apos;s menu to add to home screen.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Type definition for beforeinstallprompt event
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}
