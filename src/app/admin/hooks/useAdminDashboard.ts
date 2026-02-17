/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react'
import useGetCars from '@/lib/api/useGetCars'
import useGetSubscriptions from '@/lib/api/useGetSubscriptions'
import useGetBookings from '@/lib/api/useGetBookings'
import useUpdateBookingStatus from '@/lib/api/useUpdateBookingStatus'
import { useToast } from '@/components/providers/ToastProvider'
import { useAppSelector } from '@/lib/store'


/**
 * Custom hook for Admin Dashboard logic.
 * Orchestrates API data, manages modal state, and handles booking actions.
 */
export function useAdminDashboard() {
    const role = useAppSelector((state) => state.auth.role)
    const canManageBookingActions = role === 'owner'

    // --- Data Fetching ---
    const { data: carRes, isLoading: carsLoading } = useGetCars({ managed: true, query: { page: 1 } })
    const { data: subRes, isLoading: subsLoading } = useGetSubscriptions()
    const { data: bookingRes, isLoading: bookingsLoading, refetch: refetchBookings } = useGetBookings({ limit: 5 })
    
    // --- Mutations & Feedback ---
    const { mutateAsync: updateStatus, isPending: isUpdating } = useUpdateBookingStatus()
    const { showToast } = useToast()

    // --- Local State ---
    const [selectedBooking, setSelectedBooking] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // --- Computed Logic ---
    const stats = useMemo(() => {
        const cars = carRes?.data || []
        const subscriptionData = Array.isArray(subRes) ? subRes : (subRes as any)?.data || []

        return {
            totalCars: cars.length,
            availableCars: cars.filter((car: any) => car.availability?.isAvailableToday && !car.isOnHold).length,
            totalSubscriptions: subscriptionData.length,
            activeSubscriptions: subscriptionData.filter((sub: any) => sub.isActive).length,
        }
    }, [carRes, subRes])

    const recentBookings = useMemo(() => {
        return bookingRes?.data || []
    }, [bookingRes])

    const isLoading = carsLoading || subsLoading || bookingsLoading

    // --- Actions ---
    const handleApprove = async (id: string) => {
        if (!canManageBookingActions) {
            showToast("Booking status changes are restricted for admin role.", "warning")
            return
        }
        try {
            await updateStatus({ id, bookingStatus: 'confirmed' })
            showToast("Booking Approved", "success")
            refetchBookings()
        } catch (error: any) {
            showToast(error.response?.data?.message || "Could not approve booking.", "error")
        }
    }

    const handleCancel = async (id: string) => {
        if (!canManageBookingActions) {
            showToast("Booking status changes are restricted for admin role.", "warning")
            return
        }
        try {
            await updateStatus({ id, bookingStatus: 'cancelled' })
            showToast("Booking Cancelled", "info")
            refetchBookings()
        } catch (error: any) {
            showToast(error.response?.data?.message || "Could not cancel booking.", "error")
        }
    }

    const openDetails = (booking: any) => {
        setSelectedBooking(booking)
        setIsModalOpen(true)
    }

    const closeDetails = () => {
        setIsModalOpen(false)
        setSelectedBooking(null)
    }

    return {
        // Data
        stats,
        recentBookings,
        isLoading,
        isUpdating,
        canManageBookingActions,
        
        // Modal State
        selectedBooking,
        isModalOpen,
        
        // Actions
        handleApprove,
        handleCancel,
        openDetails,
        closeDetails,
        refetchBookings
    }
}
