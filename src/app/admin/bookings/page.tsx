/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
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
    Database,
    Calendar,
    User,
    Car,
    CheckCircle2,
    XCircle,
    Clock,
    MoreHorizontal,
    Eye,
    ShieldCheck,
    Ban
} from 'lucide-react'
import useGetBookings from '@/lib/api/useGetBookings'
import useUpdateBookingStatus from '@/lib/api/useUpdateBookingStatus'
import { useToast } from '@/components/providers/ToastProvider'
import BookingDetailsModal from '@/components/admin/Bookings/BookingDetailsModal'
import { useAppSelector } from '@/lib/store'
import { useSocket } from '@/components/providers/SocketProvider'
import { useEffect } from 'react'

/**
 * Admin Bookings Management Page
 * Displays a detailed list of bookings and allows status transitions
 */
export default function BookingsManagementPage() {
    const { data: bookingRes, isLoading, refetch } = useGetBookings({ limit: 50 })
    const { mutateAsync: updateStatus, isPending: statusUpdating } = useUpdateBookingStatus()
    const { showToast } = useToast()
    const role = useAppSelector((state) => state.auth.role)
    const { socket } = useSocket()
    const canManageActions = role === 'owner'

    // State for Details Modal
    const [selectedBooking, setSelectedBooking] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const bookings = bookingRes?.data || []

    useEffect(() => {
        if (!socket) return

        const handleBookingRealtime = () => {
            refetch()
        }

        socket.on('booking_status_updated', handleBookingRealtime)
        socket.on('booking_created', handleBookingRealtime)

        return () => {
            socket.off('booking_status_updated', handleBookingRealtime)
            socket.off('booking_created', handleBookingRealtime)
        }
    }, [socket, refetch])

    const handleApprove = async (id: string) => {
        try {
            await updateStatus({ id, bookingStatus: 'confirmed' })
            showToast("Booking Approved", "success")
            refetch()
        } catch (error: any) {
            showToast(error.response?.data?.message || "Could not approve booking.", "error")
        }
    }

    const handleCancel = async (id: string) => {
        try {
            await updateStatus({ id, bookingStatus: 'cancelled' })
            showToast("Booking Cancelled", "info")
            refetch()
        } catch (error: any) {
            showToast(error.response?.data?.message || "Could not cancel booking.", "error")
        }
    }

    const openDetails = (booking: any) => {
        setSelectedBooking(booking)
        setIsModalOpen(true)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed</Badge>
            case 'cancelled': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>
            case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case 'paid': return <Badge variant="outline" className="border-green-200 text-green-600 bg-green-50">Paid</Badge>
            case 'failed': return <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50">Failed</Badge>
            default: return <Badge variant="outline" className="border-gray-200 text-gray-500 bg-gray-50 uppercase">{status}</Badge>
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
                <p className="text-gray-600 mt-2">
                    Review, approve, and manage customer car reservations
                </p>
            </div>

            {/* Bookings Table Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Reservations</CardTitle>
                    <CardDescription>View all platform transactions and customer requests</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No reservations found in the record</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y">
                                    <tr>
                                        <th className="px-6 py-4 font-medium italic">Booking ID / Date</th>
                                        <th className="px-6 py-4 font-medium">Customer</th>
                                        <th className="px-6 py-4 font-medium">Car Selection</th>
                                        <th className="px-6 py-4 font-medium">Payment</th>
                                        <th className="px-6 py-4 font-medium">Progress</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bookings.map((booking: any) => (
                                        <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-xs text-primary font-semibold">{booking.bookingId}</div>
                                                <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(booking.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">
                                                            {booking.bookingDetails?.firstName} {booking.bookingDetails?.lastName}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 truncate">
                                                            {booking.bookingDetails?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Car className="w-4 h-4 text-gray-400" />
                                                    <div className="min-w-0">
                                                        <p className="text-gray-900 font-medium">
                                                            {booking.selectedCar ? booking.selectedCar.name : 'N/A'}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400">
                                                            ₱{(booking.bookingDetails?.totalPrice || 0).toLocaleString()} total
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getPaymentBadge(booking.paymentStatus)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(booking.bookingStatus)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-slate-100"
                                                        onClick={() => openDetails(booking)}
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600">
                                                                <span className="sr-only">Open status menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40">
                                                            {canManageActions && booking.bookingStatus === 'pending' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleApprove(booking._id)}
                                                                    className="text-green-600 cursor-pointer py-2"
                                                                    disabled={statusUpdating}
                                                                >
                                                                    <ShieldCheck className="mr-2 h-4 w-4" /> Approve
                                                                </DropdownMenuItem>
                                                            )}
                                                            {canManageActions && booking.bookingStatus !== 'cancelled' && booking.bookingStatus !== 'completed' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleCancel(booking._id)}
                                                                    className="text-red-500 cursor-pointer py-2"
                                                                    disabled={statusUpdating}
                                                                >
                                                                    <Ban className="mr-2 h-4 w-4" /> Reject/Cancel
                                                                </DropdownMenuItem>
                                                            )}
                                                            {!canManageActions && (
                                                                <div className="px-2 py-1.5 text-xs text-slate-400 italic text-center">
                                                                    View-only access
                                                                </div>
                                                            )}
                                                            {canManageActions && booking.bookingStatus !== 'pending' && booking.bookingStatus === 'cancelled' && (
                                                                <div className="px-2 py-1.5 text-xs text-slate-400 italic text-center">
                                                                    No further actions
                                                                </div>
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
                    )}
                </CardContent>
            </Card>

            <BookingDetailsModal
                booking={selectedBooking}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onApprove={handleApprove}
                onCancel={handleCancel}
                isUpdating={statusUpdating}
                canManageActions={canManageActions}
            />
        </div>
    )
}
