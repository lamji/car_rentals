"use client";

import type { PersonalInfoData } from "@/components/booking/PersonalInfoForm";
import { useBookingPersistence } from "@/hooks/useBookingPersistence";
import { useCar } from "@/hooks/useCar";
import { calculatePaymentSummary } from "@/lib/paymentSummaryHelper";
import type { BookingDetails } from "@/lib/slices/bookingSlice";
import { closePaymentModal, nextStep, openPaymentModal, previousStep, setBookingDetails, setSelectedCar } from "@/lib/slices/bookingSlice";
import { useAppDispatch } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function useBookingPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const { currentStep, selectedCar, bookingDetails, isPaymentModalOpen } = useBookingPersistence();
  
  // State for PersonalInfoForm validation
  const [isPersonalInfoValid, setIsPersonalInfoValid] = useState(false);
  const [personalInfoData, setPersonalInfoData] = useState<PersonalInfoData | null>(null);
  
  // Get car ID from URL params
  const carId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const car = useCar(carId);

  /**
   * Initialize the booking page after a small delay to ensure Redux is ready
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      console.log('Booking page marked as loaded');
    }, 100); // Small delay to ensure Redux is ready
    
    return () => clearTimeout(timer);
  }, []);

  /**
   * Fallback: If no car in Redux but we have car ID, set it in Redux store
   */
  useEffect(() => {
    if (isLoaded && !selectedCar && car && carId) {
      console.log('Car not in Redux, setting from URL:', carId);
      dispatch(setSelectedCar(car));
    }
  }, [isLoaded, selectedCar, car, carId, dispatch]);

  /**
   * Handle PersonalInfoForm validation changes
   * Updates validation state and stores personal info data
   */
  const handlePersonalInfoValidationChange = useCallback((isValid: boolean, data?: PersonalInfoData) => {
    setIsPersonalInfoValid(isValid);
    setPersonalInfoData(data ?? null);
    console.log('PersonalInfo validation:', { isValid, data });
  }, []);

  /**
   * Handle rental details form changes
   * Updates booking details in Redux store
   */
  const handleRentalDetailsChange = useCallback((data: Partial<BookingDetails>) => {
    console.log('Rental details updated:', {data});
    dispatch(setBookingDetails(data));
    // console.log('Rental details updated:', data);
  }, [dispatch]);

  /**
   * Calculate rental duration in hours
   * Returns null if required date/time fields are missing
   */
  const calculateRentalDuration = useCallback(() => {
    if (!bookingDetails.startDate || !bookingDetails.endDate || !bookingDetails.startTime || !bookingDetails.endTime) {
      return null;
    }

    const startDateTime = new Date(`${bookingDetails.startDate}T${bookingDetails.startTime}`);
    const endDateTime = new Date(`${bookingDetails.endDate}T${bookingDetails.endTime}`);
    
    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    return durationHours;
  }, [bookingDetails]);

  /**
   * Check if booking meets minimum duration requirement (12 hours)
   */
  const isMinimumDurationMet = useCallback(() => {
    const duration = calculateRentalDuration();
    return duration !== null && duration >= 12;
  }, [calculateRentalDuration]);

  /**
   * Determine if user can proceed to the next booking step
   * Validates requirements for each step based on current step
   */
  const canProceedToNext = useCallback(() => {
    let canProceed = false;
    
    switch (currentStep) {
      case 1:
        canProceed = !!selectedCar; // Car must be selected
        break;
      case 2:
        const hasRequiredFields = !!(
          bookingDetails.startDate && 
          bookingDetails.endDate && 
          bookingDetails.location && 
          bookingDetails.startTime && 
          bookingDetails.endTime
        );
        const meetsDuration = isMinimumDurationMet();
        canProceed = hasRequiredFields && meetsDuration;
        break;
      case 3:
        canProceed = isPersonalInfoValid; // Personal info form must be valid
        break;
      case 4:
        canProceed = true; // Enable complete booking button
        break;
      default:
        canProceed = false;
    }
    
    return canProceed;
  }, [currentStep, selectedCar, bookingDetails, isPersonalInfoValid, isMinimumDurationMet]);

  /**
   * Handle complete booking action
   * Opens payment modal if user can proceed
   */
  const handleComplete = useCallback(() => {
    if (canProceedToNext()) {
      dispatch(openPaymentModal());
    }
  }, [canProceedToNext, dispatch]);

  /**
   * Handle payment completion
   * Closes payment modal and moves to next step
   */
  const handlePaymentComplete = useCallback(() => {
    dispatch(closePaymentModal());
    dispatch(nextStep()); // Move to completion or confirmation step
    // Here you would typically save the booking to backend
    console.log('Payment completed, booking confirmed');
  }, [dispatch]);

  /**
   * Close payment modal
   */
  const closePaymentModalHandler = useCallback(() => {
    dispatch(closePaymentModal());
  }, [dispatch]);

  /**
   * Calculate pricing details for Step 2 when moving to Step 3
   * Determines rental price based on duration and applies delivery fees
   */
  const calculateStep2Pricing = useCallback(() => {
    if (!selectedCar || !bookingDetails.startDate || !bookingDetails.endDate || !bookingDetails.startTime || !bookingDetails.endTime) {
      return null;
    }

    const startDateTime = new Date(`${bookingDetails.startDate}T${bookingDetails.startTime}`);
    const endDateTime = new Date(`${bookingDetails.endDate}T${bookingDetails.endTime}`);
    const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
    
    let rentalPrice = 0;
    let pricingType: 'hourly' | '12-hours' | '24-hours' | 'daily' = 'hourly';
    
    if (durationHours <= 12) {
      rentalPrice = selectedCar.pricePer12Hours || 0;
      pricingType = '12-hours';
    } else if (durationHours <= 24) {
      rentalPrice = selectedCar.pricePer24Hours || 0;
      pricingType = '24-hours';
    } else {
      const days = Math.ceil(durationHours / 24);
      rentalPrice = (selectedCar.pricePerDay || 0) * days;
      pricingType = 'daily';
    }
    
    const deliveryFee = bookingDetails.pickupType === 'delivery' ? (selectedCar.deliveryFee || 0) : 0;
    const totalPrice = rentalPrice + deliveryFee;
    
    return {
      rentalPrice,
      deliveryFee,
      totalPrice,
      pricingType,
      durationHours: Math.round(durationHours * 100) / 100
    };
  }, [selectedCar, bookingDetails]);

  /**
   * Handle navigation to previous step
   * Goes back to car listing if on first step, otherwise goes to previous booking step
   */
  const handlePrevious = useCallback(() => {
    console.log('Previous clicked, current step:', currentStep);
    if (currentStep === 1) {
      // Navigate back to car listing page
      router.push('/cars');
    } else {
      dispatch(previousStep());
    }
  }, [currentStep, dispatch, router]);

  /**
   * Handle navigation to next step
   * Validates current step and processes data before moving to next step
   */
  const handleNext = useCallback(() => {
    console.log('Next clicked, can proceed:', canProceedToNext());
    console.log('Current Step:', currentStep);
    console.log('Current bookingDetails from Redux:', bookingDetails);
    
    // Process Step 2 specific data when moving from Step 2 to Step 3
    if (currentStep === 2) {
      const { startDate, endDate, startTime, endTime, location, pickupType } = bookingDetails;
      
      const pricingDetails = calculateStep2Pricing();
      
      if (pricingDetails) {
        // Dispatch Step 2 data to Redux
        dispatch(setBookingDetails({
          startDate,
          endDate,
          startTime,
          endTime,
          location,
          pickupType,
          ...pricingDetails // Store calculated pricing for reference
        }));
        
        console.log('Step 2 data dispatched to Redux');
      }
      
      console.log('========================');
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
        }));
      }
      
      dispatch(nextStep());
    }
  }, [currentStep, bookingDetails, canProceedToNext, personalInfoData, dispatch, calculateStep2Pricing]);

  /**
   * Calculate payment summary for the booking
   */
  const paymentSummary = calculatePaymentSummary(selectedCar, bookingDetails);

  /**
   * Define booking progress steps
   */
  const steps = [
    { id: 1, title: 'Select Car', description: 'Choose your vehicle' },
    { id: 2, title: 'Rental Details', description: 'Dates & location' },
    { id: 3, title: 'Personal Info', description: 'Your details' },
    { id: 4, title: 'Confirmation', description: 'Review & book' }
  ];

  return {
    // State
    isLoaded,
    currentStep,
    selectedCar,
    bookingDetails,
    isPaymentModalOpen,
    isPersonalInfoValid,
    personalInfoData,
    car,
    paymentSummary,
    steps,
    
    // Actions
    handlePersonalInfoValidationChange,
    handleRentalDetailsChange,
    handleComplete,
    handlePaymentComplete,
    closePaymentModalHandler,
    handlePrevious,
    handleNext,
    
    // Utilities
    calculateRentalDuration,
    isMinimumDurationMet,
    canProceedToNext,
    calculateStep2Pricing,
  };
}
