import { Input } from '@/components/ui/input'
import { LocationModal } from '@/lib/npm-ready-stack/locationPicker'
import { calculatePaymentSummary, formatCurrency } from '@/lib/paymentSummaryHelper'
import { BookingDetails, setBookingDetails } from '@/lib/slices/bookingSlice'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import { Calendar, Clock, MapPin, Truck } from 'lucide-react'
import React, { useState } from 'react'

interface RentalDetailsFormProps {
  onDataChange?: (data: Partial<BookingDetails>) => void
}

export function RentalDetailsForm({ onDataChange }: RentalDetailsFormProps) {
  const dispatch = useAppDispatch()
  const bookingDetails = useAppSelector(state => state.booking.bookingDetails)
  const selectedCar = useAppSelector(state => state.booking.selectedCar)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

  // Centralized data change handler
  const handleDataChange = React.useCallback((data: Partial<BookingDetails>) => {
    dispatch(setBookingDetails(data))
    onDataChange?.(data)
    console.log('RentalDetailsForm data changed:', data)
  }, [dispatch, onDataChange])

  // Helper function to convert 24-hour time to 12-hour format
  const formatTime12Hour = (time24: string) => {
    if (!time24) return '';
    
    const [hours] = time24.split(':').map(Number)
    const hour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    const period = hours < 12 ? 'AM' : 'PM'
    
    return `${hour}:00 ${period}`
  }

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

  // Check if duration is between 12-24 hours for pricing suggestion
  const isBetween12And24Hours = () => {
    const duration = calculateRentalDuration();
    return duration !== null && duration > 12 && duration < 24;
  }

  // Check if duration is over 24 hours for block pricing suggestion
  const isOver24Hours = () => {
    const duration = calculateRentalDuration();
    return duration !== null && duration > 24;
  }

  // Use the centralized payment summary helper
  const paymentSummary = calculatePaymentSummary(selectedCar, bookingDetails)

  const handleLocationSelect = (locationString: string) => {
    dispatch(setBookingDetails({ location: locationString }))
    setIsLocationModalOpen(false)
  }
    console.log("test:selected car", selectedCar)

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Start Date
          </label>
          <input
            type="date"
            value={bookingDetails.startDate || ''}
            onChange={(e) => dispatch(setBookingDetails({ startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            End Date
          </label>
          <input
            type="date"
            value={bookingDetails.endDate || ''}
            onChange={(e) => dispatch(setBookingDetails({ endDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={bookingDetails.startDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Time Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="h-4 w-4 inline mr-1" />
            Start Time
          </label>
          <select
            value={bookingDetails.startTime || ''}
            onChange={(e) => handleDataChange({ startTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
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
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </label>
        </div>
      </div>

      {/* Location Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="h-4 w-4 inline mr-1" />
          Pickup/Return Location
        </label>
        <Input
          value={bookingDetails.location || ''}
          onChange={(e) => dispatch(setBookingDetails({ location: e.target.value }))}
          onClick={() => setIsLocationModalOpen(true)}
          placeholder="Click to select pickup location"
          className="border-gray-300 cursor-pointer"
          readOnly
        />
      </div>

      {/* Summary */}
      {(bookingDetails.startDate || bookingDetails.endDate) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Rental Summary</h4>
          
          {/* Car Info */}
          {selectedCar && (
            <div className="mb-3 pb-3 border-b border-gray-200">
              <div className="flex flex-col gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{selectedCar.name}</div>
                  <div className="text-xs text-gray-500">{selectedCar.year} • {selectedCar.seats} seats • {selectedCar.transmission}</div>
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-500 mb-1">Base rates</div>
                  <div className="flex flex-wrap gap-1 text-xs font-medium">
                    <span className="bg-white px-2 py-1 rounded border border-gray-200">
                      {formatCurrency(selectedCar.pricePer12Hours || 0)}/12h
                    </span>
                    <span className="bg-white px-2 py-1 rounded border border-gray-200">
                      {formatCurrency(selectedCar.pricePer24Hours || 0)}/24h
                    </span>
                    <span className="bg-white px-2 py-1 rounded border border-gray-200">
                      {formatCurrency(selectedCar.pricePerHour || 0)}/h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-1 text-sm text-gray-600">
            {bookingDetails.startDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-green-600" />
                <span>Start: {new Date(bookingDetails.startDate).toLocaleDateString()} {formatTime12Hour(bookingDetails.startTime || '')}</span>
              </div>
            )}
            {bookingDetails.endDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-green-600" />
                <span>End: {new Date(bookingDetails.endDate).toLocaleDateString()} {formatTime12Hour(bookingDetails.endTime || '')}</span>
              </div>
            )}
            {bookingDetails.location && (
              <div >
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-green-600" />
                  <span>Location:</span>
                </div>
                <span>{bookingDetails.location}</span>
              </div>
            )}
            
            {/* Duration and Validation */}
            {calculateRentalDuration() !== null && (
              <div className="pt-2 border-t border-gray-300">
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

                {/* Pricing suggestion for 12-24 hours */}
                {isBetween12And24Hours() && paymentSummary && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="text-amber-800 text-sm font-medium mb-1">
                      💡 Pricing Option for Extra Hours
                    </div>
                    <div className="text-amber-700 text-xs">
                      {(() => {
                        const duration = calculateRentalDuration()!;
                        const baseHours = 12;
                        const extraHours = duration - baseHours;
                        const basePrice = selectedCar.pricePer12Hours || 0;
                        const extraPrice = extraHours * (selectedCar.pricePerHour || 0);
                        const totalHourlyPrice = basePrice + extraPrice;
                        const dayRatePrice = selectedCar.pricePer24Hours || 0;
                        
                        if (dayRatePrice < totalHourlyPrice) {
                          return `You selected ${duration.toFixed(1)} hours. First 12 hours: ${formatCurrency(basePrice)} + extra ${(extraHours).toFixed(1)} hour(s) at ${formatCurrency(selectedCar.pricePerHour || 0)}/hour = ${formatCurrency(totalHourlyPrice)}. 💡 Better option: Get the 24-hour plan for just ${formatCurrency(dayRatePrice)} and save ${formatCurrency(totalHourlyPrice - dayRatePrice)}!`;
                        } else {
                          return `You selected ${duration.toFixed(1)} hours. First 12 hours: ${formatCurrency(basePrice)} + extra ${(extraHours).toFixed(1)} hour(s) at ${formatCurrency(selectedCar.pricePerHour || 0)}/hour = ${formatCurrency(totalHourlyPrice)}.`;
                        }
                      })()}
                    </div>
                  </div>
                )}

                {/* Block pricing suggestion for over 24 hours */}
                {isOver24Hours() && paymentSummary && (
                  <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="text-orange-800 text-sm font-medium mb-1">
                      ⏰ Block Pricing Suggestion
                    </div>
                    <div className="text-orange-700 text-xs whitespace-pre-line">
                      {(() => {
                        const duration = calculateRentalDuration()!;
                        const fullDays = Math.floor(duration / 24);
                        const remainingHours = duration % 24;
                        
                        if (remainingHours > 0) {
                          const price12HourBlock = (fullDays * (selectedCar.pricePerDay || 0)) + (selectedCar.pricePer12Hours || 0);
                          const price24HourBlock = (fullDays + 1) * (selectedCar.pricePerDay || 0);
                          const currentHourlyPrice = (fullDays * (selectedCar.pricePerDay || 0)) + (remainingHours * (selectedCar.pricePerHour || 0));
                          const savings12Hour = currentHourlyPrice - price12HourBlock;
                          const savings24Hour = currentHourlyPrice - price24HourBlock;
                          
                          return `You selected ${duration.toFixed(1)} hours (${fullDays} day(s) + ${remainingHours.toFixed(1)} hour(s)).
The extra ${remainingHours.toFixed(1)} hour(s) will be charged hourly at ${formatCurrency(selectedCar.pricePerHour || 0)}/hour each.

💡 Better options:
• Add ${(12 - remainingHours).toFixed(1)} hour(s) for 12-hour block: ${formatCurrency(price12HourBlock)} (save ${formatCurrency(savings12Hour)})
• Add ${(24 - remainingHours).toFixed(1)} hour(s) for full day: ${formatCurrency(price24HourBlock)} (save ${formatCurrency(savings24Hour)})`;
                        } else {
                          return `Perfect! You selected exactly ${fullDays} full day(s) at the best daily rate.`;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pricing Breakdown */}
            {paymentSummary && isMinimumDurationMet() && (
              <div className="pt-2 border-t border-gray-300">
                <div className="font-medium text-gray-900 mb-2">Pricing Breakdown:</div>
                <div className="space-y-1">
                  {paymentSummary.pricingBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium">{formatCurrency(item.amount || 0)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200">
                    <span>Total Price:</span>
                    <span>{formatCurrency(paymentSummary.totalAmount || 0)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        title="Select Pickup/Return Location"
        showLandmark={true}
        required={{
          region: true,
          province: true,
          city: true,
          barangay: true
        }}
      />
    </div>
  )
}
