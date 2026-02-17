import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculatePaymentSummary, calculateRentalDuration } from '@/lib/paymentSummaryHelper'
import { setCurrentStep } from '@/lib/slices/bookingSlice'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import {
  Calendar,
  Car,
  CreditCard,
  User
} from "lucide-react"
import React from 'react'
import { BasicPersonalInfo } from './confirmation/BasicPersonalInfo'
import { ConfirmationHeader } from './confirmation/ConfirmationHeader'
import { DownPaymentSection } from './confirmation/DownPaymentSection'
import { PaymentSummaryBreakdown } from './confirmation/PaymentSummaryBreakdown'
import { PickupOption } from './confirmation/PickupOption'
import { RentalDetails } from './confirmation/RentalDetails'
import { SelfDrivePersonalInfo } from './confirmation/SelfDrivePersonalInfo'
import { VehicleDetails } from './confirmation/VehicleDetails'



export function BookingConfirmation() {
  const dispatch = useAppDispatch();
  const selectedCar = useAppSelector((state) => state.data.cars);
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
      <ConfirmationHeader />

      {/* Step 1: Selected Car */}
      <Card data-testid="selected-vehicle-section" className="p-0 py-4 shadow-none border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Car className="h-5 w-5" />
            Selected Vehicle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 shadow-none">
          <VehicleDetails
            name={selectedCar?.name}
            year={selectedCar?.year}
            seats={selectedCar?.seats}
            transmission={selectedCar?.transmission}
            fuel={selectedCar?.fuel}
            selfDrive={selectedCar?.selfDrive}
            type={selectedCar?.type}
            pricePerHour={selectedCar?.pricePerHour}
            pricePer12Hours={selectedCar?.pricePer12Hours}
            pricePer24Hours={selectedCar?.pricePer24Hours}
            priceWithDriver={selectedCar?.priceWithDriver}
          />
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
          <RentalDetails
            rentalDuration={rentalDuration}
            startDate={bookingDetails.startDate}
            startTime={bookingDetails.startTime}
            endDate={bookingDetails.endDate}
            endTime={bookingDetails.endTime}
          />

          <PickupOption
            pickupType={bookingDetails.pickupType}
            garageAddress={selectedCar?.garageLocation?.address || selectedCar?.garageAddress}
          />
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
          <BasicPersonalInfo
            firstName={bookingDetails.firstName}
            middleName={bookingDetails.middleName}
            lastName={bookingDetails.lastName}
            contactNumber={bookingDetails.contactNumber}
            email={bookingDetails.email}
          />
          {selectedCar?.selfDrive && (
            <SelfDrivePersonalInfo
              idType={bookingDetails.idType}
              licenseNumber={bookingDetails.licenseNumber}
              licenseImage={bookingDetails.licenseImage}
              ltoPortalScreenshot={bookingDetails.ltoPortalScreenshot}
            />
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
              <PaymentSummaryBreakdown
                rentalCost={paymentSummary.rentalCost}
                deliveryFee={paymentSummary.deliveryFee}
                driverFee={bookingDetails.driverFee}
                excessHoursPrice={bookingDetails.excessHoursPrice}
                excessHours={bookingDetails.excessHours}
                totalAmount={paymentSummary.totalAmount}
              />

              {/* Down Payment Requirement */}
              <DownPaymentSection
                downPaymentRequired={paymentSummary.downPaymentRequired}
                remainingBalance={paymentSummary.remainingBalance}
              />
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
