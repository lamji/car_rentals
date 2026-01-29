'use client'

import { useAlerts } from '@/hooks/useAlerts'
import { SmartSubscriptionAlert } from '@/lib/npm-ready-stack/smartAlertSubscriptionPwa'

/**
 * Wrapper component that provides the alert handler to SmartSubscriptionAlert
 * Uses the global alert system from useAlerts hook
 */
export function SmartSubscriptionAlertWrapper() {
  const alerts = useAlerts()

  // Create alert handler that maps to the global alert system
  const alertHandler = (alert: {
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
  }) => {
    switch (alert.type) {
      case 'success':
        alerts.showSuccessAlert(alert.title, alert.message, alert.duration)
        break
      case 'error':
        alerts.showErrorAlert(alert.title, alert.message, alert.duration)
        break
      case 'warning':
        alerts.showWarningAlert(alert.title, alert.message, alert.duration)
        break
      case 'info':
        alerts.showInfoAlert(alert.title, alert.message, alert.duration)
        break
    }
  }

  return (
    <SmartSubscriptionAlert 
      config={{
        alertHandler
      }} 
    />
  )
}
