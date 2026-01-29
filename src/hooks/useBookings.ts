'use client'

import type { LucideIcon } from 'lucide-react';
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface Booking {
  id: string;
  carName: string;
  carImage: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  pickupLocation: string;
  dropoffLocation: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

const mockBookings: Booking[] = [
  {
    id: '1',
    carName: 'Tesla Model 3',
    carImage: 'https://res.cloudinary.com/dlax3esau/image/upload/v1768988167/van_vpcb4o.png',
    startDate: '2024-02-15',
    endDate: '2024-02-18',
    startTime: '10:00 AM',
    endTime: '10:00 AM',
    totalPrice: 450,
    status: 'upcoming',
    pickupLocation: 'San Francisco Airport',
    dropoffLocation: 'San Francisco Airport',
    customerName: 'John Doe',
    customerEmail: 'john.doe@email.com',
    customerPhone: '+1 234-567-8900'
  },
  {
    id: '2',
    carName: 'BMW X5',
    carImage: 'https://res.cloudinary.com/dlax3esau/image/upload/v1768988167/van_vpcb4o.png',
    startDate: '2024-01-10',
    endDate: '2024-01-15',
    startTime: '2:00 PM',
    endTime: '2:00 PM',
    totalPrice: 750,
    status: 'completed',
    pickupLocation: 'Downtown San Francisco',
    dropoffLocation: 'Oakland Airport',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@email.com',
    customerPhone: '+1 234-567-8901'
  },
  {
    id: '3',
    carName: 'Mercedes C-Class',
    carImage: 'https://res.cloudinary.com/dlax3esau/image/upload/v1768988167/van_vpcb4o.png',
    startDate: '2024-02-01',
    endDate: '2024-02-03',
    startTime: '9:00 AM',
    endTime: '9:00 AM',
    totalPrice: 300,
    status: 'active',
    pickupLocation: 'San Jose Airport',
    dropoffLocation: 'San Jose Airport',
    customerName: 'Mike Johnson',
    customerEmail: 'mike.j@email.com',
    customerPhone: '+1 234-567-8902'
  }
]

/**
 * Custom hook for managing bookings page state and logic
 * Handles filtering, booking selection, and status styling
 * @returns {Object} Bookings state and utility functions
 * @returns {Booking[]} bookings - All available bookings
 * @returns {Booking[]} filteredBookings - Bookings filtered by selected status
 * @returns {string} filter - Current filter status
 * @returns {Function} setFilter - Function to update filter
 * @returns {Booking|null} selectedBooking - Currently selected booking
 * @returns {Function} setSelectedBooking - Function to select booking
 * @returns {Function} getStatusColor - Function to get status color classes
 * @returns {Function} getStatusIcon - Function to get status icon component
 */
export function useBookings() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed' | 'cancelled'>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Filter bookings based on selected status
  const filteredBookings = useMemo(() => {
    return mockBookings.filter(booking => filter === 'all' || booking.status === filter)
  }, [filter])

  /**
   * Determines the appropriate color styling for booking status badges
   * @param {string} status - The booking status
   * @returns {string} CSS class string for status styling
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  /**
   * Returns the appropriate icon component for booking status
   * @param {string} status - The booking status
   * @returns {LucideIcon} Icon component for the status
   */
  const getStatusIcon = (status: string): LucideIcon => {
    switch (status) {
      case 'upcoming':
        return Calendar
      case 'active':
        return Clock
      case 'completed':
        return CheckCircle
      case 'cancelled':
        return XCircle
      default:
        return Calendar
    }
  }

  return {
    bookings: mockBookings,
    filteredBookings,
    filter,
    setFilter,
    selectedBooking,
    setSelectedBooking,
    getStatusColor,
    getStatusIcon
  }
}
