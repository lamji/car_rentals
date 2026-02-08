import { LocationData } from '@/lib/npm-ready-stack/locationPicker';
import { BookingDetails } from '@/lib/slices/bookingSlice';
import { useAppSelector } from '@/lib/store';
import { useCallback, useState } from 'react';
import { formatDateToYYYYMMDD } from '../utils/dateHelpers';
import { formatTimeDisplay, generateTimeOptions, getEndDateMinDate, isEndTimeDisabled, isStartTimeDisabled, isTimeInPastForDate } from '../utils/timeValidation';

/**
 * Custom hook for managing booking details logic and validation
 * @param onDataChange - Callback function when data changes
 * @returns Booking logic functions and state
 */
export function useBookingDetails(onDataChange?: (data: Partial<BookingDetails>) => void) {
  // Redux state
  const bookingDetails = useAppSelector(state => state.booking.bookingDetails);
  const selectedCar = useAppSelector(state => state.data.cars);
  const mapBoxState = useAppSelector(state => state.mapBox);

  console.log("test:mapBoxState", mapBoxState)

  // Modal states
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  // Centralized data change handler
  const handleDataChange = useCallback((data: Partial<BookingDetails>) => {
    onDataChange?.(data);
  }, [onDataChange]);

  // Helper function to check if a time is in the past for today's booking
  const isTimeInPast = useCallback((time: string) => {
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

    return selectedTime.getTime() < now.getTime();
  }, [bookingDetails.startDate]);

  // Helper function to check if a time is in the past for the end date
  const isEndTimeInPast = useCallback((time: string) => {
    if (!bookingDetails.endDate) return false;
    return isTimeInPastForDate(time, bookingDetails.endDate);
  }, [bookingDetails.endDate]);

  // Helper function to calculate rental duration in hours
  const calculateRentalDuration = useCallback(() => {
    if (!bookingDetails.startDate || !bookingDetails.endDate || !bookingDetails.startTime || !bookingDetails.endTime) {
      return null;
    }

    const startDateTime = new Date(`${bookingDetails.startDate}T${bookingDetails.startTime}`);
    const endDateTime = new Date(`${bookingDetails.endDate}T${bookingDetails.endTime}`);

    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    return durationHours;
  }, [bookingDetails.startDate, bookingDetails.endDate, bookingDetails.startTime, bookingDetails.endTime]);

  // Check if booking meets minimum duration requirement
  const isMinimumDurationMet = useCallback(() => {
    const duration = calculateRentalDuration();
    return duration !== null && duration >= 12;
  }, [calculateRentalDuration]);

  // Handle location selection
  const handleLocationSelect = useCallback((location: string, locationData?: LocationData) => {
    const locationString = locationData ?
      `${locationData.region || ''}, ${locationData.province || ''}, ${locationData.city || ''}, ${locationData.barangay || ''}`.replace(/, ,/g, ',').replace(/^, |, $/g, '') :
      location;
    handleDataChange({ location: locationString });
  }, [handleDataChange]);

  // Handle end date selection
  const handleEndDateSelect = useCallback((date: Date) => {
    const dateString = formatDateToYYYYMMDD(date);
    handleDataChange({ endDate: dateString });
  }, [handleDataChange]);

  // Get display date format
  const getDisplayDate = useCallback((dateString: string | undefined) => {
    if (!dateString) return 'Select date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Select date';
    }
  }, []);

  return {
    // State
    bookingDetails,
    selectedCar,
    isLocationModalOpen,
    setIsLocationModalOpen,
    isStartDatePickerOpen,
    setIsStartDatePickerOpen,
    isEndDatePickerOpen,
    setIsEndDatePickerOpen,
    mapBoxState,
    
    // Functions
    handleDataChange,
    isTimeInPast,
    isEndTimeInPast,
    calculateRentalDuration,
    isMinimumDurationMet,
    handleLocationSelect,
    handleEndDateSelect,
    getDisplayDate,
    
    // Time validation utilities
    formatTimeDisplay: formatTimeDisplay,
    generateTimeOptions: generateTimeOptions,
    getEndDateMinDate: getEndDateMinDate,
    isEndTimeDisabled: isEndTimeDisabled,
    isStartTimeDisabled: isStartTimeDisabled,
    charge: Number(process.env.CHARGE_PER_KM)  // Default to 30 if not set
  };
}
