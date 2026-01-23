import { useAppSelector, useAppDispatch } from '@/lib/store'
import { clearBooking } from '@/lib/slices/bookingSlice'

export function useBookingPersistence() {
  const dispatch = useAppDispatch()
  const currentStep = useAppSelector(state => state.booking.currentStep) || 1 // Default to 1 if undefined
  const selectedCar = useAppSelector(state => state.booking.selectedCar)
  const bookingDetails = useAppSelector(state => state.booking.bookingDetails)
  const isPaymentModalOpen = useAppSelector(state => state.booking.isPaymentModalOpen) || false

  // Auto-resume logic: validate current step and reset if needed
  // Temporarily disabled to debug navigation issue
  /*
  useEffect(() => {
    // Ensure currentStep is within valid bounds (1-4)
    if (currentStep < 1 || currentStep > 4) {
      dispatch(setCurrentStep(1))
      return
    }

    // If no car is selected but we're past step 1, reset to step 1
    if (!selectedCar && currentStep > 1) {
      dispatch(setCurrentStep(1))
    }
  }, [selectedCar, currentStep, dispatch])
  */

  // Check if there's a booking in progress
  const hasBookingInProgress = !!(selectedCar || Object.keys(bookingDetails).length > 0)

  // Get progress percentage
  const getProgressPercentage = () => {
    let completedSteps = 0
    if (selectedCar) completedSteps++
    if (bookingDetails.startDate && bookingDetails.endDate && bookingDetails.location) completedSteps++
    return (completedSteps / 2) * 100 // Based on first 2 steps for now
  }

  // Resume booking from current step
  const resumeBooking = () => {
    // Validation is already handled by the useEffect above
    return currentStep
  }

  // Start new booking (clear existing)
  const startNewBooking = () => {
    dispatch(clearBooking())
  }

  return {
    hasBookingInProgress,
    getProgressPercentage,
    resumeBooking,
    startNewBooking,
    currentStep,
    selectedCar,
    bookingDetails,
    isPaymentModalOpen
  }
}
