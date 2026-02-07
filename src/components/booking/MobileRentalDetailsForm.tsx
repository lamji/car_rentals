"use client";

import { DatePickerModal } from '@/components/ui/DatePickerModal';
import * as DropdownMenu from "@/components/ui/dropdown-menu";
import { LocationModal } from '@/lib/npm-ready-stack/locationPicker';
import { BookingDetails } from '@/lib/slices/bookingSlice';
import { format } from 'date-fns';
import { Calendar, Clock, Truck } from 'lucide-react';
import { useBookingDetails } from '../../hooks/useBookingDetails';
import { formatCurrency } from '../../lib/paymentSummaryHelper';
import { formatDateToYYYYMMDD } from '../../utils/dateHelpers';

interface MobileRentalDetailsFormProps {
  onDataChange?: (data: Partial<BookingDetails>) => void
  pricingDetails?: {
    rentalPrice?: number
    deliveryFee?: number
    driverFee?: number
    totalPrice?: number
    pricingType?: 'hourly' | '12-hours' | '24-hours' | 'daily'
    durationHours?: number
    excessHours?: number
    excessHoursPrice?: number
  }
}

export function MobileRentalDetailsForm({ onDataChange, pricingDetails }: MobileRentalDetailsFormProps) {
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
    mapBoxState
  } = useBookingDetails(onDataChange)

  console.log('selectedCar', { pricingDetails, selectedCar })

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
            <DropdownMenu.DropdownMenuContent className="min-w-(--radix-dropdown-menu-trigger-width) max-h-40 overflow-y-auto" align="start">
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
            <DropdownMenu.DropdownMenuContent className="min-w-(--radix-dropdown-menu-trigger-width) max-h-40 overflow-y-auto" align="start">
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
      {/* Fulfillment Option - Only show for self-drive cars */}
      {selectedCar?.selfDrive && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Truck className="h-4 w-4 inline mr-1" />
            Fulfillment Option
          </label>
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer bg-white p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <input
                type="radio"
                name="pickupType"
                value="pickup"
                checked={bookingDetails.pickupType === 'pickup' || !bookingDetails.pickupType}
                onChange={(e) => handleDataChange({ pickupType: e.target.value as 'pickup' | 'delivery' })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Pickup from Garage</div>
                <div className="text-sm text-gray-500">Come to our garage to pick up the car</div>
                {selectedCar && selectedCar.garageAddress && (
                  <div className="text-xs text-gray-400 mt-1 flex items-center">
                    {selectedCar.garageAddress}
                  </div>
                )}
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer bg-white p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <input
                type="radio"
                name="pickupType"
                value="delivery"
                checked={bookingDetails.pickupType === 'delivery'}
                onChange={(e) => handleDataChange({ pickupType: e.target.value as 'pickup' | 'delivery' })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Home Delivery</div>
                <div className="text-sm text-gray-500">We deliver the car to your location</div>
                <div className="text-xs text-gray-400 mt-1 flex items-center">
                  {mapBoxState?.current?.address}
                </div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Delivery Charge: {formatCurrency(mapBoxState?.current?.distanceCharge.price || 0)}
                </div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* summary */}
      {pricingDetails && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Rental Summary</h4>
          {/* show if self drive or not */}
          <div className={`flex items-center justify-center px-3 py-2 rounded text-sm font-medium w-full mb-3 ${selectedCar?.selfDrive
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
            {selectedCar?.selfDrive ? 'Self Drive' : 'With Driver'}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Base Rental ({pricingDetails.pricingType === '24-hours' && pricingDetails.durationHours && pricingDetails.durationHours >= 24
                  ? pricingDetails.durationHours === 24
                    ? '24-hours'
                    : `${selectedCar?.pricePer24Hours || 0} × ${Math.floor(pricingDetails.durationHours / 24)} days`
                  : pricingDetails.pricingType}):
              </span>
              <span className="font-medium">{formatCurrency(pricingDetails.rentalPrice || 0)}</span>
            </div>
            {bookingDetails.pickupType === 'delivery' && pricingDetails.deliveryFee && pricingDetails.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee:</span>
                <span className="font-medium">{formatCurrency(pricingDetails.deliveryFee)}</span>
              </div>
            )}
            {!selectedCar?.selfDrive && pricingDetails.driverFee && pricingDetails.driverFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Driver Fee:</span>
                <span className="font-medium">{formatCurrency(pricingDetails.driverFee)}</span>
              </div>
            )}
            {Number(pricingDetails.excessHoursPrice) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Excess Hours ({pricingDetails.excessHours}h):</span>
                <span className="font-medium">{formatCurrency(pricingDetails?.excessHoursPrice || 0)}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-semibold text-lg text-blue-600">{formatCurrency(pricingDetails.totalPrice || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver Fee Alert - Only show for cars with driver */}
      {
        selectedCar && !selectedCar.selfDrive && selectedCar.driverCharge && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <div className="font-medium text-blue-900 mb-1">Professional Driver Included</div>
                <div className="text-sm text-blue-700">
                  This rental includes a professional driver. Driver fee of <span className="font-semibold">{formatCurrency(selectedCar.driverCharge)}</span> per day will be applied.
                </div>
              </div>
            </div>
          </div>
        )
      }

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
    </div >
  )
}
