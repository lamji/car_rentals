/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react'
import useGetCars from '@/lib/api/useGetCars'
import useGetSubscriptions from '@/lib/api/useGetSubscriptions'
import useGetBookings from '@/lib/api/useGetBookings'
import useUpdateBookingStatus from '@/lib/api/useUpdateBookingStatus'
import { useToast } from '@/components/providers/ToastProvider'
import { useAppSelector } from '@/lib/store'

interface WebVisitPoint {
    label: string
    count: number
}

interface WebVisitAnalytics {
    totalVisits7d: number
    todayVisits: number
    activeDevices: number
    trendPercent: number
    series: WebVisitPoint[]
}

const DAY_MS = 24 * 60 * 60 * 1000

function normalizeSubscriptions(raw: unknown): any[] {
    if (Array.isArray(raw)) return raw
    if (raw && typeof raw === 'object' && 'data' in (raw as any)) {
        return (raw as any).data || []
    }
    return []
}

function formatDayLabel(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
}

function buildWebVisitAnalytics(subscriptions: any[]): WebVisitAnalytics {
    const now = new Date()
    const dayMeta: Array<{ key: string; label: string }> = []
    const dayCounts = new Map<string, number>()

    for (let offset = 6; offset >= 0; offset--) {
        const date = new Date(now.getTime() - offset * DAY_MS)
        const key = date.toISOString().slice(0, 10)
        dayMeta.push({ key, label: formatDayLabel(date) })
        dayCounts.set(key, 0)
    }

    for (const sub of subscriptions) {
        const sourceDate = sub?.lastHeartbeat || sub?.updatedAt || sub?.createdAt
        if (!sourceDate) continue

        const visitDate = new Date(sourceDate)
        if (Number.isNaN(visitDate.getTime())) continue

        const key = visitDate.toISOString().slice(0, 10)
        if (!dayCounts.has(key)) continue

        dayCounts.set(key, (dayCounts.get(key) || 0) + 1)
    }

    const series = dayMeta.map(({ key, label }) => {
        return {
            label,
            count: dayCounts.get(key) || 0,
        }
    })

    const totalVisits7d = series.reduce((acc, item) => acc + item.count, 0)
    const todayKey = now.toISOString().slice(0, 10)
    const todayVisits = dayCounts.get(todayKey) || 0

    const recent3 = series.slice(-3).reduce((acc, item) => acc + item.count, 0)
    const previous3 = series.slice(-6, -3).reduce((acc, item) => acc + item.count, 0)
    const trendPercent = previous3 === 0
        ? (recent3 > 0 ? 100 : 0)
        : Math.round(((recent3 - previous3) / previous3) * 100)

    return {
        totalVisits7d,
        todayVisits,
        activeDevices: subscriptions.filter((sub) => sub?.isActive).length,
        trendPercent,
        series,
    }
}


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
        const subscriptionData = normalizeSubscriptions(subRes)

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

    const webVisitAnalytics = useMemo(() => {
        const subscriptionData = normalizeSubscriptions(subRes)
        return buildWebVisitAnalytics(subscriptionData)
    }, [subRes])

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
        webVisitAnalytics,
        
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
