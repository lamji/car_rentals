/* eslint-disable @typescript-eslint/no-explicit-any */
import { LocationData } from '@/lib/npm-ready-stack/locationPicker';
import { BookingDetails } from '@/lib/slices/bookingSlice';
import { useAppSelector } from '@/lib/store';
import { useCallback, useState, useEffect } from 'react';
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

  // Step 3: Get blocked dates based on booking time conflicts
  const getBlockedDatesFromBookings = useCallback((): string[] => {
    const bookedDates = getBookedDates();
    const blockedDates: string[] = [];
    
    console.log('debug:blocking - Analyzing booking conflicts...');
    
    bookedDates.forEach((booking: any, index: number) => {
      console.log('debug:blocking - Processing booking:', booking);
      
      // Always block start dates
      if (!blockedDates.includes(booking.startDate)) {
        blockedDates.push(booking.startDate);
        console.log('debug:blocking - Blocked start date:', booking.startDate);
      }
      
      // Check for conflicts with other bookings
      bookedDates.forEach((otherBooking: any, otherIndex: number) => {
        if (index !== otherIndex) {
          // Check if bookings are on consecutive days
          const bookingEnd = new Date(booking.endDate);
          const otherStart = new Date(otherBooking.startDate);
          const dayDiff = Math.floor((otherStart.getTime() - bookingEnd.getTime()) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 0 || dayDiff === 1) { // Same day or next day
            // Parse times
            const [bookingEndHour, bookingEndMin] = booking.endTime.split(':').map(Number);
            const [otherStartHour, otherStartMin] = otherBooking.startTime.split(':').map(Number);
            
            const bookingEndTime = bookingEndHour * 60 + bookingEndMin;
            const otherStartTime = otherStartHour * 60 + otherStartMin;
            
            // Calculate time between bookings
            let timeBetweenBookings: number;
            
            if (dayDiff === 0) {
              // Same day: time between end and start on same day
              timeBetweenBookings = otherStartTime - bookingEndTime;
            } else {
              // Next day: time from booking end to midnight + time from midnight to next booking start
              const midnightTime = 24 * 60; // 24:00 in minutes
              timeBetweenBookings = (midnightTime - bookingEndTime) + otherStartTime;
            }
            
            console.log('debug:blocking - Time analysis:', {
              booking: `${booking.endTime} on ${booking.endDate}`,
              otherBooking: `${otherBooking.startTime} on ${otherBooking.startDate}`,
              timeBetweenBookings: `${timeBetweenBookings} minutes`,
              minimumRequired: '12 hours = 720 minutes'
            });
            
            // Block dates if time between bookings is less than 12 hours (720 minutes)
            if (timeBetweenBookings < 720) {
              if (!blockedDates.includes(booking.endDate)) {
                blockedDates.push(booking.endDate);
                console.log('debug:blocking - Blocked end date due to insufficient time:', booking.endDate);
              }
              if (!blockedDates.includes(otherBooking.startDate)) {
                blockedDates.push(otherBooking.startDate);
                console.log('debug:blocking - Blocked start date due to insufficient time:', otherBooking.startDate);
              }
            } else {
              console.log('debug:blocking - Sufficient time between bookings, no blocking needed');
            }
          }
        }
      });
    });
    
    console.log('debug:blocking - Final blocked dates from conflicts:', blockedDates);
    return blockedDates;
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
    });
    
    // Combine with past dates
    const pastDates = getPastDates();
    const allUnavailableDates = [...new Set([...pastDates, ...availableTimeDates])];
    
    console.log('debug: test startdate - Start date unavailable (with time logic):', allUnavailableDates);
    console.log('debug: test startdate - Past dates:', pastDates);
    console.log('debug: test startdate - Time blocked dates:', availableTimeDates);
    console.log('debug:startdate - === getUnavailableStartDates FINISHED ===');
    return allUnavailableDates;
  }, [getPastDates, getBlockedDatesFromBookings, hasSufficientTimeOnDate]);

  
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
    isEndTimeInPast,
    calculateRentalDuration,
    isMinimumDurationMet,
    handleLocationSelect,
    handleEndDateSelect,
    getDisplayDate,
    getUnavailableDates,
    getUnavailableStartDates,
    getUnavailableEndDates,
    
    // Time validation utilities
    formatTimeDisplay: formatTimeDisplay,
    generateTimeOptions: generateTimeOptions,
    getEndDateMinDate: getEndDateMinDate,
    isEndTimeDisabled: isEndTimeDisabled,
    isStartTimeDisabled: isStartTimeDisabled,
    charge: Number(process.env.CHARGE_PER_KM)  // Default to 30 if not set
  };
}
