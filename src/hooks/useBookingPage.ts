/* eslint-disable react-hooks/exhaustive-deps */
"use client";


import { useBookingPersistence } from "@/hooks/useBookingPersistence";
import { useCar } from "@/hooks/useCar";
import { calculatePaymentSummary } from "@/lib/paymentSummaryHelper";
import type { BookingDetails } from "@/lib/slices/bookingSlice";
import { closePaymentModal, nextStep, openPaymentModal, previousStep, setBookingDetails, setSelectedCar } from "@/lib/slices/bookingSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PersonalInfoData } from "./usePersonalInfoForm";

export function useBookingPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const { currentStep, selectedCar, bookingDetails, isPaymentModalOpen } = useBookingPersistence();
  const carState= useAppSelector((state) => state.data.cars);
  const mapBoxState = useAppSelector((state) => state.mapBox);

  console.log('carState', carState);
  
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
          bookingDetails.startTime && 
          bookingDetails.endTime 
          // (selectedCar?.selfDrive ? bookingDetails.location : true) // Location only required for self-drive cars
        );
        const meetsDuration = isMinimumDurationMet();
        console.log('test:canProceed', {hasRequiredFields, meetsDuration});
   
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
  }, [currentStep, selectedCar, bookingDetails, isPersonalInfoValid, isMinimumDurationMet, selectedCar?.selfDrive]);

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
   * Calculate pricing for step 2 based on rental duration and car details
   */
  const calculateStep2Pricing = useCallback((mapBoxDeliveryFee: number = 0) => {
    if (!selectedCar || !bookingDetails.startDate || !bookingDetails.endDate || !bookingDetails.startTime || !bookingDetails.endTime) {
      return null;
    }

    const startDateTime = new Date(`${bookingDetails.startDate}T${bookingDetails.startTime}`);
    const endDateTime = new Date(`${bookingDetails.endDate}T${bookingDetails.endTime}`);
    const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
    
    let rentalPrice = 0;
    let pricingType: 'hourly' | '12-hours' | '24-hours' | 'daily' = 'hourly';
    let driverFee = 0;
    let excessHours = 0;
    let excessHoursPrice = 0;
    
    // Calculate base rental price
    if (durationHours <= 12) {
      rentalPrice = selectedCar.pricePer12Hours || 0;
      pricingType = '12-hours';
    } else if (durationHours <= 24) {
      if (durationHours === 24) {
        // Exactly 24 hours = 24-hour pricing
        rentalPrice = selectedCar.pricePer24Hours || 0;
        pricingType = '24-hours';
      } else {
        // 13-23 hours = 12-hour base + excess hours
        rentalPrice = selectedCar.pricePer12Hours || 0;
        pricingType = '12-hours';
        excessHours = durationHours - 12;
        excessHoursPrice = (selectedCar.pricePerHour || 0) * excessHours;
      }
    } else {
      // For durations > 24 hours, calculate multi-day pricing
      const fullDays = Math.floor(durationHours / 24);
      const remainingHours = durationHours % 24;
      
      if (remainingHours === 0) {
        // Exact multiple of 24 hours (e.g., 48, 72 hours)
        rentalPrice = (selectedCar.pricePer24Hours || 0) * fullDays;
        pricingType = '24-hours';
        excessHours = 0;
        excessHoursPrice = 0;
      } else {
        // Multiple days plus excess hours (e.g., 49 hours = 2 days + 1 hour)
        rentalPrice = (selectedCar.pricePer24Hours || 0) * fullDays;
        pricingType = '24-hours';
        excessHours = remainingHours;
        excessHoursPrice = (selectedCar.pricePerHour || 0) * remainingHours;
      }
    }
    
    // Calculate driver fee for cars with drivers
    if (!selectedCar.selfDrive && selectedCar.driverCharge) {
      // Driver fee is per day (12-24 hours = 1 day, >24 hours = multiple days)
      if (durationHours <= 24) {
        driverFee = selectedCar.driverCharge;
      } else {
        // Calculate full days and remaining hours
        const fullDays = Math.floor(durationHours / 24);
        const remainingHours = durationHours % 24;
        
        // Only charge for an extra day if remaining hours >= 12
        const extraDay = remainingHours >= 12 ? 1 : 0;
        const totalDays = fullDays + extraDay;
        
        driverFee = selectedCar.driverCharge * totalDays;
      }
    }
    
    // Use mapBox delivery fee instead of fixed car delivery fee
    const deliveryFee = Math.round(mapBoxDeliveryFee * 100) / 100;
    
    // Excess hours are already calculated in the main pricing logic above
    
    const totalPrice = Math.round((rentalPrice + deliveryFee + driverFee + excessHoursPrice) * 100) / 100;
    
    // Debug logging
    console.log('Pricing Calculation Debug:', {
      durationHours,
      pricingType,
      baseRentalPrice: pricingType === '24-hours' ? selectedCar.pricePer24Hours : selectedCar.pricePer12Hours,
      excessHours,
      excessHoursPrice,
      finalRentalPrice: rentalPrice,
      deliveryFee,
      driverFee,
      totalPrice
    });
    
    return {
      rentalPrice,
      deliveryFee,
      driverFee,
      totalPrice,
      pricingType,
      durationHours: Math.round(durationHours * 100) / 100,
      excessHours: Math.round(excessHours * 100) / 100,
      excessHoursPrice: Math.round(excessHoursPrice * 100) / 100
    };
  }, [selectedCar, bookingDetails]);

  /**
   * Handle navigation to previous step
   * Goes back to car listing if on first step, otherwise goes to previous booking step
   */
  const handlePrevious = useCallback(() => {
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
    // Process Step 2 specific data when moving from Step 2 to Step 3
    if (currentStep === 2) {
      const { startDate, endDate, startTime, endTime, location, pickupType } = bookingDetails;
      
      // Get delivery fee from mapBoxState if pickup type is delivery and car is self-drive
      const mapBoxDeliveryFee = (pickupType === 'delivery' && selectedCar?.selfDrive) 
        ? mapBoxState?.current?.distanceCharge?.price || 0 
        : 0;
      
      const pricingDetails = calculateStep2Pricing(mapBoxDeliveryFee);
      
      if (pricingDetails) {
        // Dispatch Step 2 data to Redux (deliveryFee is already included in pricingDetails)
        dispatch(setBookingDetails({
          startDate,
          endDate,
          startTime,
          endTime,
          location,
          pickupType,
          ...pricingDetails // Store calculated pricing including deliveryFee
        }));
      }

      console.log('Step 2 data dispatched to Redux',{
          startDate,
          endDate,
          startTime,
          endTime,
          location,
          pickupType,
        
      ...pricingDetails // Store calculated pricing including deliveryFee, excessHours, excessHoursPrice
        });
      
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
    selectedData:{
      // Basic booking details
      startDate: bookingDetails.startDate,
      endDate: bookingDetails.endDate,
      startTime: bookingDetails.startTime,
      endTime: bookingDetails.endTime,
      location: bookingDetails.location,
      pickupType: bookingDetails.pickupType,
      // Complete pricing details (only calculate if we have basic booking data)
      pricingDetails: (bookingDetails.startDate && bookingDetails.endDate && bookingDetails.startTime && bookingDetails.endTime)
        ? calculateStep2Pricing(
            (bookingDetails.pickupType === 'delivery' && selectedCar?.selfDrive) 
              ? mapBoxState?.current?.distanceCharge?.price || 0 
              : 0
          )
        : null
    },
    
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
