'use client'

import { NotificationsTable } from '@/components/admin/NotificationsTable'
import {
  Bell
} from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Subscription data type for the page
 */
interface SubscriptionRow {
  id: string
  subscriptionId: string
  userId?: string
  endpoint: string
  userAgent?: string
  createdAt: string
  isActive: boolean
}

/**
 * Admin Portal for Push Notification Management with TanStack Table
 * Displays all subscriptions in a table with individual send actions
 */
export default function NotificationAdminPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([])

  /**
   * Load all subscriptions from the database
   */
  async function loadSubscriptions() {
    try {
      const response = await fetch('/api/subscriptions')
      const result = await response.json()
      
      if (result.success && result.data) {
        const formattedData: SubscriptionRow[] = result.data.map((sub: any) => ({
          id: sub._id,
          subscriptionId: sub.subscriptionId,
          userId: sub.userId,
          endpoint: sub.endpoint,
          userAgent: sub.userAgent,
          createdAt: new Date(sub.createdAt).toLocaleString(),
          isActive: sub.isActive
        }))
        setSubscriptions(formattedData)
      }
    } catch (_error) {
      // Error will be handled by the NotificationsTable component
      console.error('Failed to load subscriptions:', _error)
    }
  }

  /**
   * Delete a subscription
   */
  async function deleteSubscription(subscriptionId: string) {
    try {
      const response = await fetch(`/api/subscriptions?subscriptionId=${subscriptionId}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.success) {
        loadSubscriptions() // Refresh the table
      }
    } catch (_error) {
      // Error will be handled by the NotificationsTable component
      console.error('Failed to delete subscription:', _error)
    }
  }

  // Load subscriptions on component mount
  useEffect(() => {
    loadSubscriptions()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Push Notification Admin</h1>
        </div>
        <p className="text-gray-600">Manage push subscriptions and send targeted notifications</p>
      </div>

      {/* Notifications Table */}
      <NotificationsTable
        subscriptions={subscriptions}
        onRefresh={loadSubscriptions}
        onDelete={deleteSubscription}
      />
    </div>
  )
}
