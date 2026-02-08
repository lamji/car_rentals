import { formatCurrency } from '@/lib/paymentSummaryHelper'
import { BookingDetails } from '@/lib/slices/bookingSlice'
import { Truck } from 'lucide-react'
import { useBookingDetails } from '../../hooks/useBookingDetails'
import { formatDateToYYYYMMDD } from '../../utils/dateHelpers'
import { DesktopDateSelection } from './form/DesktopDateSelection'
import { DesktopTimeSelection } from './form/DesktopTimeSelection'

interface RentalDetailsFormProps {
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

export function RentalDetailsForm({ onDataChange, pricingDetails }: RentalDetailsFormProps) {
  const {
    bookingDetails,
    selectedCar,
    handleDataChange,
    isTimeInPast,
    calculateRentalDuration,
    isMinimumDurationMet,
    handleEndDateSelect,
    formatTimeDisplay,
    generateTimeOptions,
    getEndDateMinDate,
    isEndTimeDisabled,
    isStartTimeDisabled,
    isEndTimeInPast,
  } = useBookingDetails(onDataChange)




  console.log('selectedCar', { pricingDetails, selectedCar, bookingDetails })

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <DesktopDateSelection
        bookingDetails={bookingDetails}
        onStartDateSelect={(date) => {
          const dateString = formatDateToYYYYMMDD(date);
          handleDataChange({ startDate: dateString });
        }}
        onEndDateClick={handleEndDateSelect}
        getEndDateMinDate={getEndDateMinDate}
      />

      {/* Time Selection */}
      <DesktopTimeSelection
        bookingDetails={bookingDetails}
        generateTimeOptions={generateTimeOptions}
        isTimeInPast={isTimeInPast}
        isEndTimeInPast={isEndTimeInPast}
        isEndTimeDisabled={isEndTimeDisabled}
        isStartTimeDisabled={isStartTimeDisabled}
        formatTimeDisplay={formatTimeDisplay}
        onStartTimeChange={(time) => handleDataChange({ startTime: time })}
        onEndTimeChange={(time) => handleDataChange({ endTime: time })}
      />

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
          <div className="flex items-center space-x-3 cursor-pointer bg-white p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <input
              id="pickup-option"
              type="radio"
              name="pickupType-desktop"
              value="pickup"
              checked={bookingDetails.pickupType === 'pickup' || !bookingDetails.pickupType}
              onChange={(e) => {
                handleDataChange({ pickupType: e.target.value as 'pickup' | 'delivery' })
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="pickup-option" className="flex-1 cursor-pointer">
              <div className="font-medium text-gray-900">Pickup from Garage</div>
              <div className="text-sm text-gray-500">Come to our garage to pick up the car</div>
              {selectedCar && selectedCar.garageAddress && (
                <div className="text-xs text-gray-400 mt-1">
                  📍 {selectedCar.garageAddress}
                </div>
              )}
            </label>
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>

          <div className="flex items-center space-x-3 cursor-pointer bg-white p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <input
              id="delivery-option"
              type="radio"
              name="pickupType-desktop"
              value="delivery"
              checked={bookingDetails.pickupType === 'delivery'}
              onChange={(e) => {
                console.log('debug:radios - delivery radio clicked, value:', e.target.value)
                handleDataChange({ pickupType: e.target.value as 'pickup' | 'delivery' })
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="delivery-option" className="flex-1 cursor-pointer">
              <div className="font-medium text-gray-900">Home Delivery</div>
              <div className="text-sm text-gray-500">We deliver the car to your location</div>
            </label>
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Summary */}
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
            {!selectedCar?.selfDrive && Number(pricingDetails.driverFee || 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Driver Fee:</span>
                <span className="font-medium">{formatCurrency(pricingDetails.driverFee || 0)}</span>
              </div>
            )}
            {Number(pricingDetails.excessHoursPrice || 0) > 0 && (
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
    </div>
  )
}
