"use client";

import { DatePickerModal } from '@/components/ui/DatePickerModal';
import { LocationData, LocationModal } from '@/lib/npm-ready-stack/locationPicker';
import { BookingDetails, setBookingDetails } from '@/lib/slices/bookingSlice';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { formatDateToYYYYMMDD } from '@/utils/dateHelpers';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Truck } from 'lucide-react';
import React, { useState } from 'react';

interface MobileRentalDetailsFormProps {
  onDataChange?: (data: Partial<BookingDetails>) => void
}

export function MobileRentalDetailsForm({ onDataChange }: MobileRentalDetailsFormProps) {
  const dispatch = useAppDispatch()
  const bookingDetails = useAppSelector(state => state.booking.bookingDetails)
  const selectedCar = useAppSelector(state => state.booking.selectedCar)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false)
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false)

  // Centralized data change handler
  const handleDataChange = React.useCallback((data: Partial<BookingDetails>) => {
    dispatch(setBookingDetails(data))
    onDataChange?.(data)
    console.log('MobileRentalDetailsForm data changed:', data)
  }, [dispatch, onDataChange])

  // Helper function to check if a time is in the past for today's booking
  const isTimeInPast = (time: string) => {
    if (!bookingDetails.startDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(bookingDetails.startDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    // Only check for today's bookings
    if (today.getTime() !== selectedDate.getTime()) return false;
    
    const now = new Date();
    const [hours] = time.split(':').map(Number);
    const selectedTime = new Date();
    selectedTime.setHours(hours, 0, 0, 0);
    
    return selectedTime.getTime() <= now.getTime();
  }

  // Helper function to calculate rental duration in hours
  const calculateRentalDuration = () => {
    if (!bookingDetails.startDate || !bookingDetails.endDate || !bookingDetails.startTime || !bookingDetails.endTime) {
      return null;
    }

    const startDateTime = new Date(`${bookingDetails.startDate}T${bookingDetails.startTime}`);
    const endDateTime = new Date(`${bookingDetails.endDate}T${bookingDetails.endTime}`);
    
    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    return durationHours;
  }

  // Check if booking meets minimum duration requirement
  const isMinimumDurationMet = () => {
    const duration = calculateRentalDuration();
    return duration !== null && duration >= 12;
  }

  const handleLocationSelect = (location: string, locationData?: LocationData) => {
    const locationString = locationData ? 
      `${locationData.region || ''}, ${locationData.province || ''}, ${locationData.city || ''}, ${locationData.barangay || ''}`.replace(/, ,/g, ',').replace(/^, |, $/g, '') :
      location;
    dispatch(setBookingDetails({ location: locationString }))
    setIsLocationModalOpen(false)
  }



  const handleEndDateSelect = (date: Date) => {
    const dateString = formatDateToYYYYMMDD(date);
    handleDataChange({ endDate: dateString });
  };

  const getDisplayDate = (dateString: string | undefined) => {
    if (!dateString) return 'Select date';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Select date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Start Date
          </label>
          <button
            onClick={() => setIsStartDatePickerOpen(true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-blue-300 transition-colors"
          >
            <span className={bookingDetails.startDate ? 'text-gray-900' : 'text-gray-500'}>
              {getDisplayDate(bookingDetails.startDate)}
            </span>
            <Calendar className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            End Date
          </label>
          <button
            onClick={() => setIsEndDatePickerOpen(true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-blue-300 transition-colors"
            disabled={!bookingDetails.startDate}
          >
            <span className={bookingDetails.endDate ? 'text-gray-900' : 'text-gray-500'}>
              {getDisplayDate(bookingDetails.endDate)}
            </span>
            <Calendar className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Time Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="h-4 w-4 inline mr-1" />
            Start Time
          </label>
          <select
            value={bookingDetails.startTime || ''}
            onChange={(e) => handleDataChange({ startTime: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select time</option>
            {Array.from({ length: 24 }, (_, i) => {
              const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
              const period = i < 12 ? 'AM' : 'PM';
              const displayTime = `${hour}:00 ${period}`;
              const value = `${i.toString().padStart(2, '0')}:00`;
              const isPast = isTimeInPast(value);
              
              return (
                <option key={i} value={value} disabled={isPast}>
                  {displayTime} {isPast && '(Past)'}
                </option>
              );
            })}
          </select>
          {bookingDetails.startDate && bookingDetails.startTime && isTimeInPast(bookingDetails.startTime) && (
            <div className="text-red-600 text-xs mt-1 bg-red-50 p-2 rounded border border-red-200">
              ⚠️ Start time cannot be in the past for today&apos;s booking. Please select a future time.
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="h-4 w-4 inline mr-1" />
            End Time
          </label>
          <select
            value={bookingDetails.endTime || ''}
            onChange={(e) => handleDataChange({ endTime: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select time</option>
            {Array.from({ length: 24 }, (_, i) => {
              const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
              const period = i < 12 ? 'AM' : 'PM';
              const displayTime = `${hour}:00 ${period}`;
              const value = `${i.toString().padStart(2, '0')}:00`;
              
              return (
                <option key={i} value={value}>
                  {displayTime}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Duration and Validation */}
      {calculateRentalDuration() !== null && (
        <div className="pt-4 border-t border-gray-300">
          <div className={`font-medium ${isMinimumDurationMet() ? 'text-green-600' : 'text-red-600'}`}>
            Duration: {calculateRentalDuration()?.toFixed(1)} hours
          </div>
          {!isMinimumDurationMet() && (
            <div className="text-red-600 text-xs mt-1 bg-red-50 p-2 rounded border border-red-200">
              ⚠️ Minimum rental duration is 12 hours. Please select a longer rental period.
            </div>
          )}
          {isMinimumDurationMet() && (
            <div className="text-green-600 text-xs mt-1">
              ✅ Minimum duration requirement met
            </div>
          )}
        </div>
      )}

      {/* Pickup Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Truck className="h-4 w-4 inline mr-1" />
          Pickup Option
        </label>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer bg-white p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <input
              type="radio"
              name="pickupType"
              value="pickup"
              checked={bookingDetails.pickupType === 'pickup' || !bookingDetails.pickupType}
              onChange={(e) => handleDataChange({ pickupType: e.target.value as 'pickup' | 'delivery' })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Pickup from Garage</div>
              <div className="text-sm text-gray-500">Come to our garage to pick up the car</div>
              {selectedCar && selectedCar.garageAddress && (
                <div className="text-xs text-gray-400 mt-1">
                  📍 {selectedCar.garageAddress}
                </div>
              )}
            </div>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer bg-white p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <input
              type="radio"
              name="pickupType"
              value="delivery"
              checked={bookingDetails.pickupType === 'delivery'}
              onChange={(e) => handleDataChange({ pickupType: e.target.value as 'pickup' | 'delivery' })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Home Delivery</div>
              <div className="text-sm text-gray-500">We deliver the car to your location</div>
            </div>
          </label>
        </div>
      </div>

      {/* Location Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="h-4 w-4 inline mr-1" />
          Delivery Location
        </label>
        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left hover:border-blue-300 transition-colors"
          disabled={bookingDetails.pickupType !== 'delivery'}
        >
          <span className={bookingDetails.location ? 'text-gray-900' : 'text-gray-500'}>
            {bookingDetails.location || 'Select delivery location'}
          </span>
        </button>
      </div>

      {/* Modals */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
      />

      <DatePickerModal
        isOpen={isStartDatePickerOpen}
        onClose={() => setIsStartDatePickerOpen(false)}
        selectedDate={bookingDetails.startDate ? new Date(bookingDetails.startDate) : undefined}
        onDateSelect={(date) => {
          const dateString = formatDateToYYYYMMDD(date);
          handleDataChange({ startDate: dateString });
        }}
        title="Select Start Date"
      />

      <DatePickerModal
        isOpen={isEndDatePickerOpen}
        onClose={() => setIsEndDatePickerOpen(false)}
        selectedDate={bookingDetails.endDate ? new Date(bookingDetails.endDate) : undefined}
        onDateSelect={handleEndDateSelect}
        title="Select End Date"
        minDate={bookingDetails.startDate ? new Date(bookingDetails.startDate) : undefined}
      />
    </div>
  )
}
