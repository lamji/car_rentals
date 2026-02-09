/* eslint-disable @typescript-eslint/no-explicit-any */
import { LocationData } from '@/lib/npm-ready-stack/locationPicker';
import { BookingDetails } from '@/lib/slices/bookingSlice';
import { useAppSelector } from '@/lib/store';
import { useCallback, useState, useEffect } from 'react';
import { formatDateToYYYYMMDD } from '../utils/dateHelpers';
import { formatTimeDisplay, generateTimeOptions, getEndDateMinDate, isEndTimeDisabled, isStartTimeDisabled, isTimeInPastForDate, isStartTimeConflictingWithBookings } from '../utils/timeValidation';

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

  // Step 2: Get unavailable dates from bookings (for logging only)
  const getBookedDates = useCallback((): any[] => {
    if (!selectedCar || !selectedCar.availability?.unavailableDates) {
      console.log('debug:booked - No selected car or unavailable dates');
      return [];
    }
    
    // Return array of objects with time information
    const bookedDatesWithTime = selectedCar.availability.unavailableDates.map((booking:any) => ({
      startDate: booking.startDate,
      endDate: booking.endDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      _id: booking._id
    }));
    
    return bookedDatesWithTime;
  }, [selectedCar]);

  // Step 1: Only block past dates for now
  const getPastDates = useCallback((): string[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
    const pastDates: string[] = [];
    
    // Go back 30 days and block all past dates
    for (let i = 1; i <= 30; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);
      const dateString = pastDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      pastDates.push(dateString);
    }
    
    return pastDates;
  }, []);

  // Get dates that should be blocked due to booking conflicts (12-hour minimum gap)
  const getBlockedDatesFromBookings = useCallback((): string[] => {
    const bookedDates = getBookedDates();
    const blockedDates = new Set<string>();
    
    console.log('debug:blocking - Analyzing booking conflicts...');
    
    for (let i = 0; i < bookedDates.length; i++) {
      const booking = bookedDates[i];
      console.log('debug:blocking - Processing booking:', booking);
      
      // Always block the start date of any booking
      blockedDates.add(booking.startDate);
      console.log('debug:blocking - Blocked start date:', booking.startDate);
      
      // Also block the end date of any booking (for stricter logic)
      blockedDates.add(booking.endDate);
      
      // Check conflicts with other bookings
      for (let j = 0; j < bookedDates.length; j++) {
        if (i === j) continue; // Skip self
        
        const otherBooking = bookedDates[j];
        
        // Check if this booking's start date conflicts with other booking's end date
        if (booking.startDate === otherBooking.endDate) {
          const [bookingStartHours, bookingStartMinutes] = booking.startTime.split(':').map(Number);
          const [otherEndHours, otherEndMinutes] = otherBooking.endTime.split(':').map(Number);
          
          const bookingStartTime = bookingStartHours * 60 + bookingStartMinutes;
          const otherBookingEndTime = otherEndHours * 60 + otherEndMinutes;
          
          // Calculate time between bookings (same day)
          const timeBetweenBookings = bookingStartTime - otherBookingEndTime;
          
          console.log('debug:blocking - Time analysis:', {
            booking: `${otherBooking.endTime} on ${otherBooking.endDate}`,
            otherBooking: `${booking.startTime} on ${booking.startDate}`,
            timeBetweenBookings: `${timeBetweenBookings} minutes`,
            minimumRequired: '12 hours = 720 minutes'
          });
          
          // If time between bookings is less than 12 hours, block both dates
          if (timeBetweenBookings < 720 && timeBetweenBookings >= 0) {
            blockedDates.add(otherBooking.endDate);
            blockedDates.add(booking.startDate);
            console.log('debug:blocking - Blocked end date due to insufficient time:', otherBooking.endDate);
            console.log('debug:blocking - Blocked start date due to insufficient time:', booking.startDate);
          }
        }
        
        // Check cross-day conflicts (booking ends on day A, next booking starts on day B)
        const bookingEnd = new Date(booking.endDate);
        const otherStart = new Date(otherBooking.startDate);
        
        // Normalize dates to compare without time
        bookingEnd.setHours(0, 0, 0, 0);
        otherStart.setHours(0, 0, 0, 0);
        
        // Calculate days between bookings
        const daysDiff = Math.round((otherStart.getTime() - bookingEnd.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Bookings are on consecutive days, check time gap across midnight
          const [bookingEndHours, bookingEndMinutes] = booking.endTime.split(':').map(Number);
          const [otherStartHours, otherStartMinutes] = otherBooking.startTime.split(':').map(Number);
          
          const bookingEndTime = bookingEndHours * 60 + bookingEndMinutes;
          const otherBookingStartTime = otherStartHours * 60 + otherStartMinutes;
          
          // Time from booking end to midnight + time from midnight to next booking start
          const midnightTime = 24 * 60; // 24:00 in minutes
          const timeBetweenBookings = (midnightTime - bookingEndTime) + otherBookingStartTime;
          
          console.log('debug:blocking - Time analysis:', {
            booking: `${booking.endTime} on ${booking.endDate}`,
            otherBooking: `${otherBooking.startTime} on ${otherBooking.startDate}`,
            timeBetweenBookings: `${timeBetweenBookings} minutes`,
            minimumRequired: '12 hours = 720 minutes'
          });
          
          // If time between bookings is less than 12 hours, block both dates
          if (timeBetweenBookings < 720) {
            blockedDates.add(booking.endDate);
            blockedDates.add(otherBooking.startDate);
            console.log('debug:blocking - Blocked end date due to insufficient time:', booking.endDate);
            console.log('debug:blocking - Blocked start date due to insufficient time:', otherBooking.startDate);
          }
        }
      }
    }
    
    const result = Array.from(blockedDates);
    console.log('debug:blocking - Final blocked dates from conflicts:', result);
    return result;
  }, [getBookedDates]);

  // Check if a booked date has sufficient time left for new bookings
  const hasSufficientTimeOnDate = useCallback((date: string): boolean => {
    const bookedDates = getBookedDates();
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
    
    // Find if this date is an end date of any booking
    const bookingsEndingOnDate = bookedDates.filter((booking: any) => booking.endDate === date);
    
    // Also check if this date is a start date of any booking that has insufficient gap from previous day
    const bookingsStartingOnDate = bookedDates.filter((booking: any) => booking.startDate === date);
    
    if (bookingsEndingOnDate.length === 0 && bookingsStartingOnDate.length === 0) {
      console.log('debug:sufficient-time - No bookings ending or starting on:', date, '- sufficient time');
      return true; // No bookings ending or starting on this date
    }
    
    // Check each booking ending on this date
    for (const booking of bookingsEndingOnDate) {
      const [endHours, endMinutes] = booking.endTime.split(':').map(Number);
      const bookingEndTime = endHours * 60 + endMinutes;
      
      // Calculate time remaining until end of day (23:59)
      const endOfDayTime = 23 * 60 + 59; // 23:59 in minutes
      const timeRemaining = endOfDayTime - bookingEndTime;
      
      console.log('debug:sufficient-time - Analysis for', date, ':', {
        bookingEndTime: `${bookingEndTime} minutes (${booking.endTime})`,
        currentTime: `${currentTime} minutes`,
        timeRemaining: `${timeRemaining} minutes`,
        isToday: date === now.toISOString().split('T')[0]
      });
      
      // If this is today and current time is past booking end time, no time left
      if (date === now.toISOString().split('T')[0]) {
        if (currentTime >= bookingEndTime) {
          console.log('debug:sufficient-time - Today but past booking end time - insufficient time');
          return false;
        }
      }
      
      // If less than 1 hour remaining on the booked end date, insufficient time
      if (timeRemaining < 60) {
        console.log('debug:sufficient-time - Less than 1 hour remaining - insufficient time');
        return false;
      }
    }
    
    // Check each booking starting on this date for conflicts with previous day bookings
    for (const booking of bookingsStartingOnDate) {
      const [startHours, startMinutes] = booking.startTime.split(':').map(Number);
      const bookingStartTime = startHours * 60 + startMinutes;
      
      // Find any booking that ends the day before
      const previousDay = new Date(date);
      previousDay.setDate(previousDay.getDate() - 1);
      const previousDayString = previousDay.toISOString().split('T')[0];
      
      const bookingsEndingPreviousDay = bookedDates.filter((b: any) => b.endDate === previousDayString);
      
      for (const prevBooking of bookingsEndingPreviousDay) {
        const [prevEndHours, prevEndMinutes] = prevBooking.endTime.split(':').map(Number);
        const prevBookingEndTime = prevEndHours * 60 + prevEndMinutes;
        
        // Calculate time between previous booking end and this booking start
        const midnightTime = 24 * 60; // 24:00 in minutes
        const timeBetweenBookings = (midnightTime - prevBookingEndTime) + bookingStartTime;
        
        // If time between bookings is less than 12 hours, insufficient time
        if (timeBetweenBookings < 720) {
          console.log('debug:sufficient-time - Insufficient gap from previous day booking - insufficient time');
          return false;
        }
      }
    }
    
    console.log('debug:sufficient-time - Sufficient time available on:', date);
    return true;
  }, [getBookedDates]);

  // Check if a date should be completely blocked due to bookings ending on that date
  const shouldBlockDateCompletely = useCallback((date: string): boolean => {
    const bookedDates = selectedCar?.unavailableDates || [];
    
    // Check if any booking ends on this date with insufficient time remaining
    for (const booking of bookedDates) {
      if (booking.endDate === date) {
        const [endHours, endMinutes] = booking.endTime.split(':').map(Number);
        const bookingEndTime = endHours * 60 + endMinutes;
        
        // Calculate time remaining until end of day (23:59)
        const endOfDayTime = 23 * 60 + 59; // 23:59 in minutes
        const timeRemaining = endOfDayTime - bookingEndTime;
        
        console.log('debug:block-date - Checking date', date, ':', {
          bookingEndTime: `${bookingEndTime} minutes (${booking.endTime})`,
          timeRemaining: `${timeRemaining} minutes`,
          shouldBlock: timeRemaining < 60
        });
        
        // If less than 1 hour remaining, block the entire date
        if (timeRemaining < 60) {
          console.log('debug:block-date - Date', date, 'should be completely blocked - insufficient time after booking ends');
          return true;
        }
      }
    }
    
    return false;
  }, [selectedCar]);

  // Get unavailable dates for start date picker (Step 3: include booking conflicts + time availability)
  const getUnavailableStartDates = useCallback((): string[] => {
    console.log('debug:startdate - === getUnavailableStartDates CALLED ===');
    
    // Get blocked dates from booking conflicts
    const blockedDates = getBlockedDatesFromBookings();
    console.log('debug:startdate - Raw blocked dates from conflicts:', blockedDates);
    
    // Check each blocked date for time availability (for start date picker)
    const availableTimeDates: string[] = [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    console.log('debug:startdate - Today is:', today);
    
    blockedDates.forEach(date => {
      console.log('debug:startdate - Checking date:', date);
      
      // If it's a past date, keep it blocked
      if (date < today) {
        availableTimeDates.push(date);
        console.log('debug:startdate - Blocked as past date:', date);
      } else {
        // Check if date should be completely blocked due to insufficient time after booking
        const shouldBlock = shouldBlockDateCompletely(date);
        if (shouldBlock) {
          availableTimeDates.push(date);
          console.log('debug:startdate - Blocked due to insufficient time after booking:', date);
        } else {
          // For today and future dates, check if there's sufficient time
          const hasTime = hasSufficientTimeOnDate(date);
          console.log('debug:startdate - Has sufficient time on', date, ':', hasTime);
          if (!hasTime) {
            availableTimeDates.push(date);
            console.log('debug:startdate - Blocked due to insufficient time:', date);
          } else {
            console.log('debug:startdate - NOT blocking - sufficient time:', date);
          }
        }
      }
    });
    
    // Combine with past dates
    const pastDates = getPastDates();
    const allUnavailableDates = [...new Set([...pastDates, ...availableTimeDates])];
    
    console.log('debug: test startdate - Start date unavailable (with time logic):', allUnavailableDates);
    console.log('debug: test startdate - Past dates:', pastDates);
    console.log('debug: test startdate - Time blocked dates:', availableTimeDates);
    console.log('debug:startdate - === getUnavailableStartDates FINISHED ===');
    return allUnavailableDates;
  }, [getPastDates, getBlockedDatesFromBookings, hasSufficientTimeOnDate, shouldBlockDateCompletely]);

  
  // Get unavailable dates for end date picker (Step 3: include booking conflicts + stricter time logic)
  const getUnavailableEndDates = useCallback((): string[] => {
    // Get blocked dates from booking conflicts
    const blockedDates = getBlockedDatesFromBookings();
    
    // For end date picker, be more restrictive - block all dates that are end dates of bookings
    // or have insufficient time
    const bookedDates = getBookedDates();
    const bookedEndDates = bookedDates.map((booking: any) => booking.endDate);
    
    // Combine conflict dates with booked end dates
    const allBlockedDates = [...new Set([...blockedDates, ...bookedEndDates])];
    
    // Combine with past dates
    const pastDates = getPastDates();
    const allUnavailableDates = [...new Set([...pastDates, ...allBlockedDates])];
    
    console.log('debug: test enddate - End date unavailable (stricter logic):', allUnavailableDates);
    return allUnavailableDates;
  }, [getPastDates, getBlockedDatesFromBookings, getBookedDates]);

  // Legacy function for backward compatibility
  const getUnavailableDates = useCallback((): string[] => {
    return getUnavailableStartDates();
  }, [getUnavailableStartDates]);

  // Function to check and alert when all booking details are complete
  const checkAndAlertCompleteBooking = useCallback(() => {
    const { startDate, endDate, startTime, endTime } = bookingDetails;
    
    if (startDate && endDate && startTime && endTime) {
      const completeBooking = {
        startDate,
        endDate,
        startTime,
        endTime
      };
      alert(`Complete booking details: ${JSON.stringify(completeBooking)}`);
    }
  }, [bookingDetails]);

  // Check if start time should be disabled based on booking conflicts
  const isStartTimeConflicting = useCallback((startTime: string): boolean => {
    console.log('debug:time-conflict - isStartTimeConflicting called with:', startTime, 'for date:', bookingDetails.startDate);
    
    if (!bookingDetails.startDate) {
      console.log('debug:time-conflict - No start date selected, returning false');
      return false;
    }
    
    const bookedDates = selectedCar?.unavailableDates || [];
    console.log('debug:time-conflict - Checking conflicts with bookings:', bookedDates);
    
    const result = isStartTimeConflictingWithBookings(startTime, bookingDetails.startDate, bookedDates);
    console.log('debug:time-conflict - Result for', startTime, ':', result);
    return result;
  }, [bookingDetails.startDate, selectedCar]);

  // Check whenever bookingDetails change
  useEffect(() => {
    checkAndAlertCompleteBooking();
  }, [bookingDetails, checkAndAlertCompleteBooking]);

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
    handleLocationSelect,
    handleEndDateSelect,
    getDisplayDate,
    getUnavailableDates,
    getUnavailableStartDates,
    getUnavailableEndDates,
    
    // Duration and validation
    calculateRentalDuration,
    isMinimumDurationMet,
    isEndTimeInPast,
    
    // Time validation utilities
    formatTimeDisplay: formatTimeDisplay,
    generateTimeOptions: generateTimeOptions,
    getEndDateMinDate: getEndDateMinDate,
    isEndTimeDisabled: isEndTimeDisabled,
    isStartTimeDisabled: isStartTimeDisabled,
    isStartTimeConflicting: isStartTimeConflicting,
    charge: Number(process.env.CHARGE_PER_KM)  // Default to 30 if not set
  };
}
