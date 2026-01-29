'use client'

import { Badge } from '@/components/ui/badge'
import {
    BarChart3,
    Bell,
    Car,
    Database,
    Settings,
    Users
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Admin Sidebar Navigation Component
 * Provides navigation for admin dashboard with active state management
 */
export function AdminSidebar() {
  const pathname = usePathname()
  const [subscriptionCount, setSubscriptionCount] = useState(0)

  /**
   * Load subscription count for display in sidebar
   */
  useEffect(() => {
    async function loadCount() {
      try {
        const response = await fetch('/api/subscriptions')
        const result = await response.json()
        if (result.success && result.data) {
          setSubscriptionCount(result.data.filter((sub: { isActive: boolean }) => sub.isActive).length)
        }
      } catch (error) {
        console.error('Failed to load subscription count:', error)
      }
    }
    loadCount()
  }, [])

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: BarChart3,
      current: pathname === '/admin'
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
      current: pathname === '/admin/notifications',
      badge: subscriptionCount > 0 ? subscriptionCount : undefined
    },
    {
      name: 'Subscriptions',
      href: '/admin/subscriptions',
      icon: Database,
      current: pathname === '/admin/subscriptions'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      current: pathname === '/admin/users'
    },
    {
      name: 'Car Rentals',
      href: '/',
      icon: Car,
      current: false
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      current: pathname === '/admin/settings'
    }
  ]

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Admin</h1>
            <p className="text-xs text-gray-500">Car Rentals</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${item.current
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
            <p className="text-xs text-gray-500 truncate">admin@carrentals.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
