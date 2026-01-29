'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  Users, 
  Car, 
  TrendingUp,
  Activity,
  Database
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

/**
 * Admin Dashboard Overview Page
 * Displays key metrics and quick access to admin functions
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalNotificationsSent: 0,
    recentActivity: []
  })

  /**
   * Load dashboard statistics
   */
  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/subscriptions')
        const result = await response.json()
        
        if (result.success && result.data) {
          const total = result.data.length
          const active = result.data.filter((sub: { isActive: boolean }) => sub.isActive).length
          
          setStats(prev => ({
            ...prev,
            totalSubscriptions: total,
            activeSubscriptions: active
          }))
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
      }
    }
    
    loadStats()
  }, [])

  const quickActions = [
    {
      title: 'Send Notification',
      description: 'Send targeted or broadcast notifications',
      href: '/admin/notifications',
      icon: Bell,
      color: 'bg-blue-500'
    },
    {
      title: 'Manage Subscriptions',
      description: 'View and manage push subscriptions',
      href: '/admin/subscriptions',
      icon: Database,
      color: 'bg-green-500'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      href: '/admin/users',
      icon: Users,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your car rental application and push notifications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              All registered devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Currently receiving notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications Sent</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNotificationsSent}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <p className="text-xs text-muted-foreground">
              Delivery success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card key={action.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={action.href}>
                    <Button className="w-full">
                      Access {action.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Bell className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">System notification sent</p>
                <p className="text-xs text-gray-500">Broadcast to {stats.activeSubscriptions} active users</p>
              </div>
              <Badge variant="secondary">2 min ago</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">New subscription registered</p>
                <p className="text-xs text-gray-500">Device subscribed to push notifications</p>
              </div>
              <Badge variant="secondary">5 min ago</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Car className="w-5 h-5 text-purple-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Car rental booking notification</p>
                <p className="text-xs text-gray-500">Booking confirmation sent to user</p>
              </div>
              <Badge variant="secondary">12 min ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
