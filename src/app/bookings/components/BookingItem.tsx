'use client'

import type { Booking } from '@/hooks/useBookings'
import { formatCurrency } from '@/lib/currency'
import { Calendar, Clock, MapPin } from 'lucide-react'
import Image from 'next/image'

/**
 * Individual booking item component with mobile and desktop layouts
 * @param booking - Booking data
 * @param index - Item index for data-id
 * @param onSelect - Function to handle booking selection
 * @param getStatusColor - Function to get status color classes
 * @param getStatusIcon - Function to get status icon component
 * @returns {JSX.Element} Booking item component
 */
export function BookingItem({ 
  booking, 
  index, 
  onSelect,
  getStatusColor,
  getStatusIcon 
}: { 
  booking: Booking; 
  index: number; 
  onSelect: (booking: Booking) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      key={booking.id}
      data-id={`bookings-item-${index}`}
      className="bg-white hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onSelect(booking)}
    >
      <div data-id={`bookings-item-${index}-content`} className="p-4 sm:p-6">
        {/* Mobile Layout */}
        <div data-id={`bookings-item-${index}-mobile`} className="sm:hidden">
          <div data-id={`bookings-item-${index}-mobile-content`} className="flex items-start space-x-3">
            <div data-id={`bookings-item-${index}-mobile-image-container`} className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
              <Image
                data-id={`bookings-item-${index}-mobile-image`}
                src={booking.carImage}
                alt={booking.carName}
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
            <div data-id={`bookings-item-${index}-mobile-info`} className="flex-1 min-w-0">
              <div data-id={`bookings-item-${index}-mobile-header`} className="flex items-center justify-between mb-2">
                <h3 data-id={`bookings-item-${index}-mobile-title`} className="text-sm font-semibold text-gray-900 truncate">{booking.carName}</h3>
                <div data-id={`bookings-item-${index}-mobile-status`} className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                  {(() => {
                    const StatusIcon = getStatusIcon(booking.status)
                    return <StatusIcon className="w-4 h-4" />
                  })()}
                  <span data-id={`bookings-item-${index}-mobile-status-text`} className="ml-1">{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                </div>
              </div>
              <div data-id={`bookings-item-${index}-mobile-details`} className="space-y-1">
                <div data-id={`bookings-item-${index}-mobile-date`} className="flex items-center text-xs text-gray-600">
                  <Calendar className="w-3 h-3 mr-1 shrink-0" />
                  <span className="truncate">{booking.startDate} - {booking.endDate}</span>
                </div>
                <div data-id={`bookings-item-${index}-mobile-location`} className="flex items-center text-xs text-gray-600">
                  <MapPin className="w-3 h-3 mr-1 shrink-0" />
                  <span className="truncate">{booking.pickupLocation}</span>
                </div>
                <div data-id={`bookings-item-${index}-mobile-price`} className="flex items-center text-xs font-medium text-gray-900">
                  <span>{formatCurrency(booking.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div data-id={`bookings-item-${index}-desktop`} className="hidden sm:block">
          <div data-id={`bookings-item-${index}-desktop-content`} className="flex items-center space-x-6">
            <div data-id={`bookings-item-${index}-desktop-image-container`} className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
              <Image
                data-id={`bookings-item-${index}-desktop-image`}
                src={booking.carImage}
                alt={booking.carName}
                width={96}
                height={96}
                className="w-full h-full object-contain"
              />
            </div>
            <div data-id={`bookings-item-${index}-desktop-info`} className="flex-1">
              <div data-id={`bookings-item-${index}-desktop-header`} className="flex items-center justify-between mb-3">
                <h3 data-id={`bookings-item-${index}-desktop-title`} className="text-lg font-semibold text-gray-900">{booking.carName}</h3>
                <div data-id={`bookings-item-${index}-desktop-status`} className={`flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                  {(() => {
                    const StatusIcon = getStatusIcon(booking.status)
                    return <StatusIcon className="w-4 h-4" />
                  })()}
                  <span data-id={`bookings-item-${index}-desktop-status-text`} className="ml-2">{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                </div>
              </div>
              <div data-id={`bookings-item-${index}-desktop-details`} className="grid grid-cols-2 gap-4 mb-3">
                <div data-id={`bookings-item-${index}-desktop-date`} className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{booking.startDate} - {booking.endDate}</span>
                </div>
                <div data-id={`bookings-item-${index}-desktop-time`} className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{booking.startTime} - {booking.endTime}</span>
                </div>
                <div data-id={`bookings-item-${index}-desktop-location`} className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{booking.pickupLocation}</span>
                </div>
                <div data-id={`bookings-item-${index}-desktop-price`} className="flex items-center text-sm font-medium text-gray-900">
                  <span>{formatCurrency(booking.totalPrice)}</span>
                </div>
              </div>
              <div data-id={`bookings-item-${index}-desktop-customer`} className="flex items-center text-sm text-gray-600">
                <span>Customer: {booking.customerName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
