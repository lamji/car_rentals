'use client'

import { useBookings } from '@/hooks/useBookings'
import { BookingModal } from './components/BookingModal'
import { BookingsFilters } from './components/BookingsFilters'
import { BookingsHeader } from './components/BookingsHeader'
import { BookingsList } from './components/BookingsList'

/**
 * Bookings management page with filtering and detailed booking information
 * Orchestrates layout and data flow between child components
 * @returns {JSX.Element} Bookings page component with filterable booking list
 */
export default function BookingsPage() {
  const {
    filteredBookings,
    filter,
    setFilter,
    selectedBooking,
    setSelectedBooking,
    getStatusColor,
    getStatusIcon
  } = useBookings()

  return (
    <div data-id="bookings-page" className="min-h-screen bg-white">
      <BookingsHeader />
      <div className="max-w-2xl mx-auto w-full lg:w-1/2">
        <BookingsFilters filter={filter} setFilter={setFilter} />
        <div data-id="bookings-list-container" className="px-4 sm:px-6 py-6">
          <BookingsList 
            bookings={filteredBookings}
            onSelectBooking={setSelectedBooking}
            filter={filter}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        </div>
      </div>
      <BookingModal 
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
      />
    </div>
  )
}
