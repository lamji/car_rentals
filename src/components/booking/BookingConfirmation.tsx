import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  MapPin,
  Car,
  CreditCard,
  AlertCircle,
  Fuel
} from "lucide-react"
import { useAppDispatch, useAppSelector } from '@/lib/store'
import { setCurrentStep } from '@/lib/slices/bookingSlice'
import { calculatePaymentSummary, formatCurrency, calculateRentalDuration } from '@/lib/paymentSummaryHelper'

// Array of valid ID types (same as in PersonalInfoForm)
const VALID_ID_TYPES = [
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'postal_id', label: 'Postal ID' },
  { value: 'sss_id', label: 'SSS ID' },
  { value: 'gsis_id', label: 'GSIS ID' },
  { value: 'philhealth_id', label: 'PhilHealth ID' },
  { value: 'pagibig_id', label: 'Pag-IBIG ID' },
  { value: 'prc_license', label: 'PRC License' },
  { value: 'senior_citizen_id', label: 'Senior Citizen ID' },
  { value: 'voters_id', label: "Voter's ID" },
  { value: 'student_id', label: 'Student ID' }
] as const

// Helper function to get ID type label from value
const getIdTypeLabel = (value?: string): string => {
  if (!value) return ''
  const idType = VALID_ID_TYPES.find(type => type.value === value)
  return idType?.label || value
}

export function BookingConfirmation() {
  const dispatch = useAppDispatch();
  const selectedCar = useAppSelector((state) => state.booking.selectedCar);
  const bookingDetails = useAppSelector(
    (state) => state.booking.bookingDetails,
  );

  const handleModifyBooking = React.useCallback(() => {
    dispatch(setCurrentStep(2));
  }, [dispatch]);

  // Use the centralized payment summary helper
  const paymentSummary = calculatePaymentSummary(selectedCar, bookingDetails);
  
  // Calculate rental duration using helper
  const rentalDuration = bookingDetails.startDate && bookingDetails.endDate && 
    bookingDetails.startTime && bookingDetails.endTime
    ? calculateRentalDuration(bookingDetails.startDate, bookingDetails.endDate, bookingDetails.startTime, bookingDetails.endTime)
    : null;

  return (
    <div className="space-y-6" data-testid="booking-confirmation">
      {/* Header */}
      <Card className="border-green-200 bg-green-50 p-0 py-4 shadow-none" data-testid="confirmation-header">
        <CardContent className="p-4 shadow-none">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-green-600" data-testid="confirmation-icon"/>
            <div>
              <h3 className="font-semibold text-green-900" data-testid="confirmation-title">
                Booking Confirmation
              </h3>
              <p className="text-sm text-green-700" data-testid="confirmation-subtitle">
                Review your booking details and confirm
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Selected Car */}
      <Card data-testid="selected-vehicle-section" className="p-0 py-4 shadow-none border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Car className="h-5 w-5" />
            Selected Vehicle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 shadow-none">
          <div className="flex items-start justify-between" data-testid="vehicle-details">
            <div>
              <h4 className="font-semibold text-gray-900" data-testid="vehicle-name">
                {selectedCar?.name}
              </h4>
              <p className="text-sm text-gray-600" data-testid="vehicle-specs">
                {selectedCar?.year} • {selectedCar?.seats} seats •{" "}
                {selectedCar?.transmission}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1" data-testid="vehicle-fuel">
                <Fuel className="h-3 w-3" />
                {selectedCar?.fuel} Fuel
              </p>
            </div>
            <Badge variant="outline" data-testid="vehicle-type">{selectedCar?.type}</Badge>
          </div>
          <div className="flex flex-wrap gap-2 text-xs" data-testid="vehicle-rates">
            <span className="bg-gray-100 px-2 py-1 rounded" data-testid="hourly-rate">
              {selectedCar?.pricePerHour
                ? `${formatCurrency(selectedCar.pricePerHour)}/hour`
                : ""}
            </span>
            <span className="bg-gray-100 px-2 py-1 rounded" data-testid="12h-rate">
              {selectedCar?.pricePer12Hours
                ? `${formatCurrency(selectedCar.pricePer12Hours)}/12h`
                : ""}
            </span>
            <span className="bg-gray-100 px-2 py-1 rounded" data-testid="24h-rate">
              {selectedCar?.pricePer24Hours
                ? `${formatCurrency(selectedCar.pricePer24Hours)}/24h`
                : ""}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Step 2: Rental Details */}
      <Card data-testid="rental-details-section" className="p-0 py-4 shadow-none border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rental Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 shadow-none">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200" data-testid="rental-duration">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Rental Duration</span>
            </div>
            <p className="text-sm text-blue-800 font-semibold" data-testid="rental-duration-value">
              {rentalDuration || 'Not calculated'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2" data-testid="start-datetime">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Start Date & Time</span>
              </div>
              <p className="text-sm text-gray-600" data-testid="start-datetime-value">
                {bookingDetails.startDate} at {bookingDetails.startTime}
              </p>
            </div>
            <div className="space-y-2" data-testid="end-datetime">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">End Date & Time</span>
              </div>
              <p className="text-sm text-gray-600" data-testid="end-datetime-value">
                {bookingDetails.endDate} at {bookingDetails.endTime}
              </p>
            </div>
          </div>

          <div className="space-y-2" data-testid="pickup-location">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Pickup/Return Location</span>
            </div>
            <p className="text-sm text-gray-600" data-testid="pickup-location-value">{bookingDetails.location}</p>
          </div>

          <div className="space-y-2" data-testid="pickup-option">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Pickup Option</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  bookingDetails.pickupType === "pickup"
                    ? "default"
                    : "secondary"
                }
                data-testid="pickup-type-badge"
              >
                {bookingDetails.pickupType === "pickup"
                  ? "🏢 Garage Pickup"
                  : "🚗 Home Delivery"}
              </Badge>
              {bookingDetails.pickupType === "pickup" &&
                selectedCar?.garageAddress && (
                  <span className="text-sm text-gray-500" data-testid="garage-address">
                    📍 {selectedCar.garageAddress}
                  </span>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="border-t border-gray-200"></div>

      {/* Step 3: Personal Information */}
      <Card data-testid="personal-info-section" className="p-0 py-4 shadow-none border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 shadow-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div data-testid="first-name-field">
              <span className="text-sm font-medium text-gray-500">
                First Name
              </span>
              <p className="text-sm" data-testid="first-name-value">{bookingDetails.firstName || ''}</p>
            </div>
            <div data-testid="middle-name-field">
              <span className="text-sm font-medium text-gray-500">
                Middle Name
              </span>
              <p className="text-sm" data-testid="middle-name-value">{bookingDetails.middleName || ''}</p>
            </div>
            <div data-testid="last-name-field">
              <span className="text-sm font-medium text-gray-500">
                Last Name
              </span>
              <p className="text-sm" data-testid="last-name-value">{bookingDetails.lastName || ''}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div data-testid="contact-number-field">
              <span className="text-sm font-medium text-gray-500">
                Contact Number
              </span>
              <p className="text-sm" data-testid="contact-number-value">{bookingDetails.contactNumber || ''}</p>
            </div>
            <div data-testid="email-field">
              <span className="text-sm font-medium text-gray-500">
                Email Address
              </span>
              <p className="text-sm" data-testid="email-value">{bookingDetails.email || ''}</p>
            </div>
          </div>
          {selectedCar?.selfDrive && (
            <>
              <div data-testid="id-type-field">
                <span className="text-sm font-medium text-gray-500">
                  ID Type
                </span>
                <p className="text-sm" data-testid="id-type-value">{getIdTypeLabel(bookingDetails.idType)}</p>
              </div>
              <div data-testid="license-number-field">
                <span className="text-sm font-medium text-gray-500">
                  License Number
                </span>
                <p className="text-sm" data-testid="license-number-value">{bookingDetails.licenseNumber || ''}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <div className="border-t border-gray-200"></div>

      {/* Payment Summary */}
      <Card className="border-blue-200 p-0 py-4" data-testid="payment-summary-section">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2" data-testid="payment-summary-title">
            <CreditCard className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentSummary && (
            <>
              <div className="space-y-2" data-testid="cost-breakdown">
                <div className="flex justify-between text-sm" data-testid="rental-cost-only">
                  <span className="text-gray-600">Rental Cost</span>
                  <span className="font-medium" data-testid="rental-cost-amount">{formatCurrency(paymentSummary.rentalCost)}</span>
                </div>
                {paymentSummary.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm" data-testid="delivery-fee">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium" data-testid="delivery-fee-amount">{formatCurrency(paymentSummary.deliveryFee)}</span>
                  </div>
                )}
                <div className="border-t pt-2" data-testid="total-amount">
                  <div className="flex justify-between">
                    <span className="font-semibold" data-testid="total-amount-label">Total Amount</span>
                    <span className="font-bold text-lg" data-testid="total-amount-value">{formatCurrency(paymentSummary.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Down Payment Requirement */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" data-testid="down-payment-section">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" data-testid="down-payment-icon"/>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-2" data-testid="down-payment-title">
                      Down Payment Required
                    </h4>
                    <div className="space-y-1 text-sm" data-testid="down-payment-breakdown">
                      <div className="flex justify-between" data-testid="down-payment-amount">
                        <span className="text-blue-700">Down Payment (20%)</span>
                        <span className="font-medium text-blue-900" data-testid="down-payment-value">{formatCurrency(paymentSummary.downPaymentRequired)}</span>
                      </div>
                      <div className="flex justify-between" data-testid="remaining-balance">
                        <span className="text-blue-700">Remaining Balance</span>
                        <span className="font-medium text-blue-900" data-testid="remaining-balance-value">{formatCurrency(paymentSummary.remainingBalance)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4" data-testid="action-buttons">
        <Button
          variant="outline"
          className="flex-1"
          data-testid="modify-booking-button"
          onClick={handleModifyBooking}
        >
          Modify Booking
        </Button>
      </div>
    </div>
  );
}
