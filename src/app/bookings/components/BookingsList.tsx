'use client'

import type { Booking } from '@/hooks/useBookings';
import { Calendar } from 'lucide-react';
import { BookingItem } from './BookingItem';

/**
 * Bookings list container component with empty state
 * @param bookings - Array of bookings to display
 * @param onSelectBooking - Function to handle booking selection
 * @param filter - Current filter for empty state message
 * @param getStatusColor - Function to get status color classes
 * @param getStatusIcon - Function to get status icon component
 * @returns {JSX.Element} Bookings list component
 */
export function BookingsList({ 
  bookings, 
  onSelectBooking, 
  filter,
  getStatusColor,
  getStatusIcon 
}: { 
  bookings: Booking[]; 
  onSelectBooking: (booking: Booking) => void;
  filter: string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ComponentType<{ className?: string }>;
}) {
  if (bookings.length === 0) {
    return (
      <div data-id="bookings-empty-state" className="text-center py-12">
        <div data-id="bookings-empty-icon" className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 data-id="bookings-empty-title" className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
        <p data-id="bookings-empty-message" className="text-gray-600">No {filter !== 'all' ? filter : ''} bookings available.</p>
      </div>
    )
  }

  return (
    <div data-id="bookings-list" className="divide-y divide-gray-200">
      {bookings.map((booking, index) => (
        <BookingItem
          key={booking.id}
          booking={booking}
          index={index}
          onSelect={onSelectBooking}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
        />
      ))}
    </div>
  )
}
