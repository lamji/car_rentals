"use client";

import { DatePickerModal } from '@/components/ui/DatePickerModal';
import * as DropdownMenu from "@/components/ui/dropdown-menu";
import { LocationModal } from '@/lib/npm-ready-stack/locationPicker';
import { BookingDetails } from '@/lib/slices/bookingSlice';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Truck } from 'lucide-react';
import { useBookingDetails } from '../../hooks/useBookingDetails';
import { formatDateToYYYYMMDD } from '../../utils/dateHelpers';

interface MobileRentalDetailsFormProps {
  onDataChange?: (data: Partial<BookingDetails>) => void
}

export function MobileRentalDetailsForm({ onDataChange }: MobileRentalDetailsFormProps) {
  // Use custom hook for all booking logic and state
  const {
    bookingDetails,
    selectedCar,
    isLocationModalOpen,
    setIsLocationModalOpen,
    isStartDatePickerOpen,
    setIsStartDatePickerOpen,
    isEndDatePickerOpen,
    setIsEndDatePickerOpen,
    handleDataChange,
    isTimeInPast,
    calculateRentalDuration,
    isMinimumDurationMet,
    handleLocationSelect,
    handleEndDateSelect,
    getDisplayDate,
    formatTimeDisplay,
    generateTimeOptions,
    getEndDateMinDate,
    isEndTimeDisabled,
    isStartTimeDisabled,
  } = useBookingDetails(onDataChange)

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
          <DropdownMenu.DropdownMenu>
            <DropdownMenu.DropdownMenuTrigger asChild>
              <button
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-blue-300 transition-colors"
              >
                <span className={bookingDetails.startTime ? 'text-gray-900' : 'text-gray-500'}>
                  {bookingDetails.startTime ? formatTimeDisplay(bookingDetails.startTime) : 'Select time'}
                </span>
                <Clock className="h-4 w-4 text-gray-400" />
              </button>
            </DropdownMenu.DropdownMenuTrigger>
            <DropdownMenu.DropdownMenuContent className="min-w-[var(--radix-dropdown-menu-trigger-width)] max-h-40 overflow-y-auto" align="start">
              {generateTimeOptions().map(({ displayTime, value }) => {
                const isPast = isTimeInPast(value);

                return (
                  <DropdownMenu.DropdownMenuItem
                    key={value}
                    disabled={isPast}
                    className={isPast ? "text-red-600 text-xs" : "text-xs"}
                    onClick={() => handleDataChange({ startTime: value })}
                  >
                    {displayTime}
                  </DropdownMenu.DropdownMenuItem>
                );
              })}
            </DropdownMenu.DropdownMenuContent>
          </DropdownMenu.DropdownMenu>
          {bookingDetails.startDate && bookingDetails.startTime && isTimeInPast(bookingDetails.startTime) && (
            <div className="text-red-600 text-xs mt-1 bg-red-50 p-2 rounded border border-red-200">
              ⚠️ Invalid time selection: You selected started date <strong>{format(new Date(bookingDetails.startDate), 'MMM dd, yyyy')}</strong> at <strong>{formatTimeDisplay(bookingDetails.startTime)}</strong>, but this time is in the past. Please select a future time for today&apos;s booking.
            </div>
          )}
          {bookingDetails.startDate && bookingDetails.startTime && bookingDetails.endDate && bookingDetails.startDate === bookingDetails.endDate && isStartTimeDisabled(bookingDetails.startTime, bookingDetails.startDate, bookingDetails.endDate) && (
            <div className="text-red-600 text-xs mt-1 bg-red-50 p-2 rounded border border-red-200">
              ⚠️ Invalid start time: You selected <strong>{formatTimeDisplay(bookingDetails.startTime)}</strong> for <strong>{format(new Date(bookingDetails.startDate), 'MMM dd, yyyy')}</strong> for end date. You only have <strong>{24 - parseInt(bookingDetails.startTime.split(':')[0])} hours</strong> remaining before the day ends, which doesn&apos;t meet the 12-hour minimum rental duration. Please select an earlier time or adjust your end date.
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="h-4 w-4 inline mr-1" />
            End Time
          </label>
          <DropdownMenu.DropdownMenu>
            <DropdownMenu.DropdownMenuTrigger asChild>
              <button
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-blue-300 transition-colors"
              >
                <span className={bookingDetails.endTime ? 'text-gray-900' : 'text-gray-500'}>
                  {bookingDetails.endTime ? formatTimeDisplay(bookingDetails.endTime) : 'Select time'}
                </span>
                <Clock className="h-4 w-4 text-gray-400" />
              </button>
            </DropdownMenu.DropdownMenuTrigger>
            <DropdownMenu.DropdownMenuContent className="min-w-[var(--radix-dropdown-menu-trigger-width)] max-h-40 overflow-y-auto" align="start">
              {generateTimeOptions().map(({ displayTime, value }) => {
                const isDisabled = isEndTimeDisabled(
                  value,
                  bookingDetails.startTime,
                  bookingDetails.startDate,
                  bookingDetails.endDate
                );

                return (
                  <DropdownMenu.DropdownMenuItem
                    key={value}
                    className={isDisabled ? "text-red-600 text-xs" : "text-xs"}
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleDataChange({ endTime: value })}
                  >
                    {displayTime}
                  </DropdownMenu.DropdownMenuItem>
                );
              })}
            </DropdownMenu.DropdownMenuContent>
          </DropdownMenu.DropdownMenu>
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
        minDate={getEndDateMinDate(bookingDetails.startDate)}
      />
    </div>
  )
}
