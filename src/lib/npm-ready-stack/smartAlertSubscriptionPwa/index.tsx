'use client'

import type { SmartSubscriptionConfig } from './bl/useSmartSubscription'
import { useSmartSubscription } from './bl/useSmartSubscription'
import { SmartSubscriptionAlertUI } from './ui/SmartSubscriptionAlert'

/**
 * Smart subscription alert that checks local storage and database
 * Only shows subscription prompt if device is not already subscribed
 * Combines business logic hook with UI component for easy integration
 */
export function SmartSubscriptionAlert({ config }: { config?: SmartSubscriptionConfig } = {}) {
  const {
    showSubscriptionPrompt,
    isChecking,
    isSubscribing,
    handleSubscribe,
    handleDismiss
  } = useSmartSubscription(config)

  return (
    <SmartSubscriptionAlertUI
      showSubscriptionPrompt={showSubscriptionPrompt}
      isChecking={isChecking}
      isSubscribing={isSubscribing}
      onSubscribe={handleSubscribe}
      onDismiss={handleDismiss}
    />
  )
}

// Export individual components for advanced usage
export { useSmartSubscription } from './bl/useSmartSubscription'
export { SmartSubscriptionAlertUI } from './ui/SmartSubscriptionAlert'

// Export types for external configuration
export type { AlertConfig, SmartSubscriptionConfig } from './bl/useSmartSubscription'
export type { SmartSubscriptionAlertUIProps } from './ui/SmartSubscriptionAlert'

