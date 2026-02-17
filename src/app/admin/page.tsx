/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Users,
  Car,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  MoreHorizontal,
  Eye,
  Ban
} from 'lucide-react'
import Link from 'next/link'
import { useAdminDashboard } from './hooks/useAdminDashboard'
import BookingDetailsModal from '@/components/admin/Bookings/BookingDetailsModal'

/**
 * Admin Dashboard Overview Page
 * Displays key metrics and quick access to admin functions
 */
export default function AdminDashboard() {
  const {
    stats,
    recentBookings,
    isLoading,
    handleApprove,
    handleCancel,
    openDetails,
    closeDetails,
    isModalOpen,
    selectedBooking,
    isUpdating,
    canManageBookingActions,
  } = useAdminDashboard()

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 font-medium">Welcome back, Admin</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </Button>
          <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
            <TrendingUp className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
            <Car className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCars}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableCars}</div>
            <p className="text-xs text-muted-foreground">{stats.availableCars > 0 ? "Fleet Active" : "Low Stock"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCars - stats.availableCars}</div>
            <p className="text-xs text-muted-foreground">+5% utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">+{stats.activeSubscriptions} Active Users</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Recent Activity */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Booking Activity
          </h2>
          <Link href="/admin/bookings">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              View All Request <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Booking ID</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Car Selection</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</th>
                    <th className="text-right py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.map((booking: any) => (
                    <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {booking.bookingId}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {booking.firstName?.[0]}{booking.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{booking.firstName} {booking.lastName}</p>
                            <p className="text-xs text-slate-500">{booking.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Car className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-900 text-sm">N/A</p>
                            <p className="text-xs text-slate-500">₱{booking.totalPrice?.toLocaleString()} total</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="outline" className={`
                              ${booking.paymentStatus === 'paid' ? 'border-green-200 text-green-700 bg-green-50' :
                            booking.paymentStatus === 'pending' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                              'border-red-200 text-red-700 bg-red-50'}
                          `}>
                          {booking.paymentStatus === 'paid' ? 'Paid' : 'PENDING'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {booking.bookingStatus === 'confirmed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          {booking.bookingStatus === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                          {booking.bookingStatus === 'cancelled' && <XCircle className="w-4 h-4 text-red-500" />}
                          <span className={`text-sm font-bold capitalize
                                   ${booking.bookingStatus === 'confirmed' ? 'text-green-600' :
                              booking.bookingStatus === 'pending' ? 'text-yellow-600' :
                                'text-red-600'}
                              `}>
                            {booking.bookingStatus}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => openDetails(booking)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {canManageBookingActions && booking.bookingStatus === 'pending' && (
                                <DropdownMenuItem className="text-green-600 font-medium cursor-pointer" onClick={() => handleApprove(booking._id)}>
                                  <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Request
                                </DropdownMenuItem>
                              )}
                              {canManageBookingActions && booking.bookingStatus !== 'cancelled' ? (
                                <DropdownMenuItem className="text-red-600 font-medium cursor-pointer" onClick={() => handleCancel(booking._id)}>
                                  <Ban className="w-4 h-4 mr-2" /> Reject / Cancel
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem disabled className="text-slate-400 text-xs">
                                  {canManageBookingActions ? 'No further actions' : 'View-only access'}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <BookingDetailsModal
        isOpen={isModalOpen}
        onClose={closeDetails}
        booking={selectedBooking}
        onApprove={handleApprove}
        onCancel={handleCancel}
        isUpdating={isUpdating}
        canManageActions={canManageBookingActions}
      />
    </div>
  )
}
