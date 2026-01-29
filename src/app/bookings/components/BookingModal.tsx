'use client'

import type { Booking } from '@/hooks/useBookings'
import { formatCurrency } from '@/lib/currency'
import { Calendar, Clock, Mail, MapPin, Phone, User } from 'lucide-react'
import Image from 'next/image'
import { Button } from '../../../components/ui/button'

/**
 * Booking details modal component
 * @param booking - Booking data to display
 * @param onClose - Function to close modal
 * @param getStatusColor - Function to get status color classes
 * @param getStatusIcon - Function to get status icon component
 * @returns {JSX.Element} Modal component or null if no booking
 */
export function BookingModal({ 
  booking, 
  onClose,
  getStatusColor,
  getStatusIcon 
}: { 
  booking: Booking | null; 
  onClose: () => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ComponentType<{ className?: string }>;
}) {
  if (!booking) return null

  return (
    <div data-id="booking-modal-overlay" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div data-id="booking-modal" className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div data-id="booking-modal-header" className="flex items-center justify-between p-6 border-b">
          <h2 data-id="booking-modal-title" className="text-2xl font-bold text-gray-900">Booking Details</h2>
          <button
            data-id="booking-modal-close-button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>
        
        <div data-id="booking-modal-content" className="p-6">
          <div data-id="booking-modal-grid" className="grid md:grid-cols-2 gap-6">
            {/* Car Image and Basic Info */}
            <div data-id="booking-modal-car-section">
              <div data-id="booking-modal-image-container" className="w-full h-48 rounded-lg overflow-hidden mb-4">
                <Image
                  data-id="booking-modal-image"
                  src={booking.carImage}
                  alt={booking.carName}
                  width={400}
                  height={200}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 data-id="booking-modal-car-name" className="text-xl font-semibold text-gray-900 mb-2">{booking.carName}</h3>
              <div data-id="booking-modal-status" className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                {(() => {
                  const StatusIcon = getStatusIcon(booking.status)
                  return <StatusIcon className="w-4 h-4" />
                })()}
                <span data-id="booking-modal-status-text" className="ml-2">{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
              </div>
            </div>
            
            {/* Booking Details */}
            <div data-id="booking-modal-details-section">
              <div>
                <h4 data-id="booking-modal-period-title" className="font-semibold text-gray-900 mb-3">Rental Period</h4>
                <div data-id="booking-modal-period-details" className="space-y-2">
                  <div data-id="booking-modal-start-date" className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-600">Start Date:</span>
                    <span className="ml-auto font-medium">{booking.startDate}</span>
                  </div>
                  <div data-id="booking-modal-end-date" className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-600">End Date:</span>
                    <span className="ml-auto font-medium">{booking.endDate}</span>
                  </div>
                  <div data-id="booking-modal-start-time" className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-600">Start Time:</span>
                    <span className="ml-auto font-medium">{booking.startTime}</span>
                  </div>
                  <div data-id="booking-modal-end-time" className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-600">End Time:</span>
                    <span className="ml-auto font-medium">{booking.endTime}</span>
                  </div>
                </div>
              </div>
              
              <div data-id="booking-modal-locations-section" className="mt-6">
                <h4 data-id="booking-modal-locations-title" className="font-semibold text-gray-900 mb-3">Locations</h4>
                <div data-id="booking-modal-locations-details" className="space-y-2">
                  <div data-id="booking-modal-pickup-location" className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-600">Pickup:</span>
                    <span className="ml-auto font-medium">{booking.pickupLocation}</span>
                  </div>
                  <div data-id="booking-modal-dropoff-location" className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-600">Drop-off:</span>
                    <span className="ml-auto font-medium">{booking.dropoffLocation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Customer Information */}
          <div data-id="booking-modal-customer-section" className="mt-6">
            <h4 data-id="booking-modal-customer-title" className="font-semibold text-gray-900 mb-3">Customer Information</h4>
            <div data-id="booking-modal-customer-details" className="grid md:grid-cols-2 gap-4">
              <div data-id="booking-modal-customer-name" className="flex items-center text-sm">
                <User className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-gray-600">Name:</span>
                <span className="ml-auto font-medium">{booking.customerName}</span>
              </div>
              <div data-id="booking-modal-customer-email" className="flex items-center text-sm">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-gray-600">Email:</span>
                <span className="ml-auto font-medium">{booking.customerEmail}</span>
              </div>
              <div data-id="booking-modal-customer-phone" className="flex items-center text-sm">
                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-gray-600">Phone:</span>
                <span className="ml-auto font-medium">{booking.customerPhone}</span>
              </div>
            </div>
          </div>
          
          <div data-id="booking-modal-price-section" className="pt-4 border-t">
            <div data-id="booking-modal-price-details" className="flex items-center justify-between mb-4">
              <span data-id="booking-modal-price-label" className="text-lg font-semibold text-gray-900">Total Price</span>
              <span data-id="booking-modal-price-amount" className="text-2xl font-bold text-blue-600">{formatCurrency(booking.totalPrice)}</span>
            </div>
            <Button data-id="booking-modal-view-receipt-button" className="w-full">
              View Receipt
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
