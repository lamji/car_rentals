'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAppDispatch } from '@/lib/store'
import { setSelectedCar, setBookingDetails, nextStep, previousStep, openPaymentModal, closePaymentModal } from '@/lib/slices/bookingSlice'
import { BookingDetails } from '@/lib/slices/bookingSlice'
import { calculatePaymentSummary } from '@/lib/paymentSummaryHelper'
import { useBookingPersistence } from '@/hooks/useBookingPersistence'
import { useCar } from '@/hooks/useCar'
import { SelectedCarCard } from '@/components/booking/SelectedCarCard'
import { RentalDetailsForm } from '@/components/booking/RentalDetailsForm'
import { PersonalInfoForm, PersonalInfoData } from '@/components/booking/PersonalInfoForm'
import { BookingConfirmation } from '@/components/booking/BookingConfirmation'
import { PaymentModal } from '@/components/booking/PaymentModal'

interface ProgressStep {
  id: number
  title: string
  description: string
}


export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  const [isLoaded, setIsLoaded] = useState(false)
  const { currentStep, selectedCar, bookingDetails, isPaymentModalOpen } = useBookingPersistence()
  
  // State for PersonalInfoForm validation
  const [isPersonalInfoValid, setIsPersonalInfoValid] = useState(false)
  const [personalInfoData, setPersonalInfoData] = useState<PersonalInfoData | null>(null)
  
  // Get car ID from URL params
  const carId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : ''
  const car = useCar(carId)

  // Wait for a moment to ensure Redux is initialized, then set as loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
      console.log('Booking page marked as loaded')
    }, 100) // Small delay to ensure Redux is ready
    
    return () => clearTimeout(timer)
  }, [])

  // Fallback: If no car in Redux but we have car ID, set it
  useEffect(() => {
    if (isLoaded && !selectedCar && car && carId) {
      console.log('Car not in Redux, setting from URL:', carId)
      dispatch(setSelectedCar(car))
    }
  }, [isLoaded, selectedCar, car, carId, dispatch])

  // Handle PersonalInfoForm validation changes
  const handlePersonalInfoValidationChange = React.useCallback((isValid: boolean, data?: PersonalInfoData) => {
    setIsPersonalInfoValid(isValid)
    setPersonalInfoData(data ?? null)
    console.log('PersonalInfo validation:', { isValid, data })
  }, [])

  const handleRentalDetailsChange = React.useCallback((data: Partial<BookingDetails>) => {
    dispatch(setBookingDetails(data))
    console.log('Rental details updated:', data)
  }, [dispatch])

  const canProceedToNext = React.useCallback(() => {
    let canProceed = false
    
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
    
    switch (currentStep) {
      case 1:
        canProceed = !!selectedCar // Car must be selected
        break
      case 2:
        const hasRequiredFields = !!(bookingDetails.startDate && bookingDetails.endDate && bookingDetails.location && bookingDetails.startTime && bookingDetails.endTime)
        const meetsDuration = isMinimumDurationMet()
        canProceed = hasRequiredFields && meetsDuration
        break
      case 3:
        canProceed = isPersonalInfoValid // Personal info form must be valid
        break
      case 4:
        canProceed = true // Enable complete booking button
        break
      default:
        canProceed = false
    }
    
    return canProceed
  }, [currentStep, selectedCar, bookingDetails, isPersonalInfoValid])

  // Handle Complete Booking - opens payment modal (called from navigation button)
  const handleComplete = React.useCallback(() => {
    if (canProceedToNext()) {
      dispatch(openPaymentModal())
    }
  }, [canProceedToNext, dispatch])

  // Handle Payment Complete
  const handlePaymentComplete = React.useCallback(() => {
    dispatch(closePaymentModal())
    dispatch(nextStep()) // Move to completion or confirmation step
    // Here you would typically save the booking to backend
    console.log('Payment completed, booking confirmed')
  }, [dispatch])

  // Close Payment Modal
  const closePaymentModalHandler = React.useCallback(() => {
    dispatch(closePaymentModal())
  }, [dispatch])

  // Calculate payment summary using helper
  const paymentSummary = calculatePaymentSummary(selectedCar, bookingDetails)

  // Show loading while initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking data...</p>
        </div>
      </div>
    )
  }

  const steps: ProgressStep[] = [
    { id: 1, title: 'Select Car', description: 'Choose your vehicle' },
    { id: 2, title: 'Rental Details', description: 'Dates & location' },
    { id: 3, title: 'Personal Info', description: 'Your details' },
    { id: 4, title: 'Confirmation', description: 'Review & book' }
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <SelectedCarCard />
      case 2:
        return <RentalDetailsForm onDataChange={handleRentalDetailsChange} />
      case 3:
        return <PersonalInfoForm onValidationChange={handlePersonalInfoValidationChange} />
      case 4:
        return <BookingConfirmation />
      default:
        return null
    }
  }

  const handlePrevious = () => {
    console.log('Previous clicked, current step:', currentStep)
    if (currentStep === 1) {
      // Navigate back to car listing page
      router.push('/cars')
    } else {
      dispatch(previousStep())
    }
  }

  const handleNext = () => {
    console.log('Next clicked, can proceed:', canProceedToNext())
    console.log('Current Step:', currentStep)
    console.log('Current bookingDetails from Redux:', bookingDetails)
    
    // Log Step 2 specific data when moving from Step 2 to Step 3
    if (currentStep === 2) {
      const { startDate, endDate, startTime, endTime, location, pickupType } = bookingDetails
      
      // Calculate pricing details for Step 2
      if (selectedCar && startDate && endDate && startTime && endTime) {
        const startDateTime = new Date(`${startDate}T${startTime}`)
        const endDateTime = new Date(`${endDate}T${endTime}`)
        const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60)
        
        let rentalPrice = 0
        let pricingType: 'hourly' | '12-hours' | '24-hours' | 'daily' = 'hourly'
        
        if (durationHours <= 12) {
          rentalPrice = selectedCar.pricePer12Hours || 0
          pricingType = '12-hours'
        } else if (durationHours <= 24) {
          rentalPrice = selectedCar.pricePer24Hours || 0
          pricingType = '24-hours'
        } else {
          const days = Math.ceil(durationHours / 24)
          rentalPrice = (selectedCar.pricePerDay || 0) * days
          pricingType = 'daily'
        }
        
        const deliveryFee = pickupType === 'delivery' ? (selectedCar.deliveryFee || 0) : 0
        const totalPrice = rentalPrice + deliveryFee
             
        // Dispatch Step 2 data to Redux
        dispatch(setBookingDetails({
          startDate,
          endDate,
          startTime,
          endTime,
          location,
          pickupType,
          // Store calculated pricing for reference
          rentalPrice,
          deliveryFee,
          totalPrice,
          pricingType,
          durationHours: Math.round(durationHours * 100) / 100
        }))
        
        console.log('Step 2 data dispatched to Redux')
      }
      
      console.log('========================')
    }
    
    if (canProceedToNext()) {
      if (currentStep === 3 && personalInfoData) {
        dispatch(setBookingDetails({
          firstName: personalInfoData.firstName,
          middleName: personalInfoData.middleName,
          lastName: personalInfoData.lastName,
          contactNumber: personalInfoData.contactNumber,
          email: personalInfoData.email,
          licenseNumber: personalInfoData.licenseNumber,
          idType: personalInfoData.idType,
          dataConsent: personalInfoData.dataConsent
        }))
      }
      console.log('Dispatching nextStep action...')
      dispatch(nextStep())
      console.log('nextStep action dispatched')
    } else {
      console.log('Cannot proceed - validation failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-0 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8 px-4">
          {/* Mobile Progress Bar */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-900">
                Step {currentStep} of {steps.length}
              </div>
              <div className="text-sm text-gray-500">
                {steps[currentStep - 1]?.title}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Desktop Progress Bar */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between relative">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        step.id <= currentStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step.id}
                    </div>
                    <span className="mt-2 text-xs font-medium text-gray-900 text-center">
                      {step.title}
                    </span>
                    <span className="mt-1 text-xs text-gray-500 text-center max-w-20 hidden lg:block">
                      {step.description}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 flex items-center justify-center px-2">
                      <div
                        className={`w-full h-1 transition-colors ${
                          step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Step {currentStep}: {steps[currentStep - 1]?.title || 'Loading...'}
          </h1>
          <p className="text-gray-600 mb-6">
            {steps[currentStep - 1]?.description || 'Please wait...'}
          </p>
          
          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}        
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            <button
              onClick={currentStep === 4 ? handleComplete : handleNext}
              disabled={!canProceedToNext()}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                !canProceedToNext()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentStep === 4 ? 'Complete Booking' : 'Next'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      {paymentSummary && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentModalHandler}
          paymentSummary={paymentSummary}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  )
}
