'use client'

import { BookingConfirmation } from '@/components/booking/BookingConfirmation'
import { MobileRentalDetailsForm } from '@/components/booking/MobileRentalDetailsForm'
import { PaymentModal } from '@/components/booking/PaymentModal'
import { PersonalInfoForm } from '@/components/booking/PersonalInfoForm'
import { RentalDetailsForm } from '@/components/booking/RentalDetailsForm'
import { SelectedCarCard } from '@/components/booking/SelectedCarCard'
import { Button } from '@/components/ui/button'
import { useBookingPage } from '@/hooks/useBookingPage'
import React from 'react'

export default function BookingPage() {
  const {
    isLoaded,
    currentStep,
    isPaymentModalOpen,
    paymentSummary,
    steps,
    handlePersonalInfoValidationChange,
    handleRentalDetailsChange,
    handleComplete,
    handlePaymentComplete,
    closePaymentModalHandler,
    handlePrevious,
    handleNext,
    canProceedToNext,
  } = useBookingPage();

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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <SelectedCarCard />
      case 2:
        return (
          <div>
            {/* Mobile Version */}
            <div className="sm:hidden">
              <MobileRentalDetailsForm onDataChange={handleRentalDetailsChange} />
            </div>
            {/* Desktop Version */}
            <div className="hidden sm:block">
              <RentalDetailsForm onDataChange={handleRentalDetailsChange} />
            </div>
          </div>
        )
      case 3:
        return <PersonalInfoForm onValidationChange={handlePersonalInfoValidationChange} />
      case 4:
        return <BookingConfirmation />
      default:
        return null
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
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              variant="secondary"
              className="px-6 py-2"
            >
              Previous
            </Button>
            <Button
              onClick={currentStep === 4 ? handleComplete : handleNext}
              disabled={!canProceedToNext()}
              className="px-6 py-2"
            >
              {currentStep === 4 ? 'Complete Booking' : 'Next'}
            </Button>
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
