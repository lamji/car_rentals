'use client'

import { Badge } from '@/components/ui/badge'
import { restoreGuestToken, clearAuthenticatedSession } from '@/lib/auth/session'
import { clearAuthSession } from '@/lib/slices/authSlice'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import {
  BarChart3,
  Bell,
  Car,
  Database,
  LogOut,
  Settings,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Admin Sidebar Navigation Component
 * Provides navigation for admin dashboard with active state management
 */
export function AdminSidebar() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const [subscriptionCount, setSubscriptionCount] = useState(0)
  const { role, user, guestToken } = useAppSelector((state) => state.auth)
  const isOwner = role === 'owner'

  /**
   * Load subscription count for display in sidebar
   */
  useEffect(() => {
    if (isOwner) {
      setSubscriptionCount(0)
      return
    }

    async function loadCount() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) return

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const result = await response.json()
        if (result.success && result.data) {
          setSubscriptionCount(result.data.filter((sub: { isActive: boolean }) => sub.isActive).length)
        }
      } catch (error) {
        console.error('Failed to load subscription count:', error)
      }
    }
    loadCount()
  }, [isOwner, role])

  type NavigationItem = {
    name: string
    href: string
    icon: typeof BarChart3
    current: boolean
    badge?: number
  }

  const adminNavigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: BarChart3,
      current: pathname === '/admin'
    },
    {
      name: 'Bookings',
      href: '/admin/bookings',
      icon: Database,
      current: pathname === '/admin/bookings'
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
      name: 'Car Management',
      href: '/admin/cars',
      icon: Car,
      current: pathname.startsWith('/admin/cars')
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      current: pathname === '/admin/settings'
    }
  ]

  const ownerNavigation: NavigationItem[] = [
    {
      name: 'Car Management',
      href: '/admin/cars',
      icon: Car,
      current: pathname.startsWith('/admin/cars')
    },
    {
      name: 'Bookings',
      href: '/admin/bookings',
      icon: Database,
      current: pathname === '/admin/bookings'
    },
    {
      name: 'Inquiries',
      href: '/admin/notifications',
      icon: Bell,
      current: pathname === '/admin/notifications'
    }
  ]

  const navigation = isOwner ? ownerNavigation : adminNavigation

  const handleLogout = () => {
    dispatch(clearAuthSession())
    clearAuthenticatedSession()
    restoreGuestToken(guestToken)
    router.replace('/login')
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{isOwner ? 'Owner' : 'Admin'}</h1>
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
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'N/A'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
