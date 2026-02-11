/* eslint-disable @typescript-eslint/no-explicit-any */
import { LocationData } from "@/lib/npm-ready-stack/locationPicker";
import { BookingDetails, clearHoldData } from "@/lib/slices/bookingSlice";
import { useAppSelector, useAppDispatch } from "@/lib/store";
import { useCallback, useState } from "react";
import { useConfirmation } from "@/hooks/useConfirmation";
import useReleaseHold from "@/lib/api/useReleaseHold";
import { formatDateToYYYYMMDD } from "../utils/dateHelpers";
import {
  formatTimeDisplay,
  generateTimeOptions,
  getEndDateMinDate,
  isEndTimeDisabled,
  isStartTimeDisabled,
  isTimeInPastForDate,
  isStartTimeConflictingWithBookings,
} from "../utils/timeValidation";
import { resetDatesAndTimesOnStartDateChange } from "./bookingsHelper/resetDatesAndTimes";
import { validateDateRangeWithAlerts } from "./bookingsHelper/validateDateRange";
import {
  getCurrentTimeInfo,
  getFutureBookings,
  getNextBookingInfo,
  calculateTimeGap,
  checkTodayAvailability,
} from "./bookingsHelper/todayAvailability";
import { useBookingChangeTracker } from "./bookingsHelper/bookingChangeTracker";

/**
 * Custom hook for managing booking details logic and validation
 * @param onDataChange - Callback function when data changes
 * @returns Booking logic functions and state
 */
export function useBookingDetails(
  onDataChange?: (data: Partial<BookingDetails>) => void,
) {
  // Redux state
  const bookingDetails = useAppSelector(
    (state) => state.booking.bookingDetails,
  );
  const selectedCar = useAppSelector((state) => state.data.cars);

  const mapBoxState = useAppSelector((state) => state.mapBox);
  const holdData = useAppSelector((state) => state.booking.holdData);
  const dispatch = useAppDispatch();
  const { showConfirmation } = useConfirmation();
  const { handleReleaseHold } = useReleaseHold({ id: selectedCar?._id || '' });

  console.log('debug:holdData - current holdData in hook:', holdData);

  // Use custom hook for booking change tracking
  const bookingTracker = useBookingChangeTracker(
    bookingDetails,
    selectedCar?._id,
  );

  // Modal states
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  // Centralized data change handler
  const handleDataChange = useCallback(
    (data: Partial<BookingDetails>) => {
      onDataChange?.(data);
    },
    [onDataChange],
  );

  // Handle date click with hold check - releases hold if user wants to change dates
  const handleDateClickWithHoldCheck = useCallback((openDatePicker: () => void) => {
    console.log('debug:holdData - handleDateClickWithHoldCheck called, holdData:', holdData);
    if (holdData?.success && holdData.newBooking) {
      showConfirmation({
        title: "Change Dates?",
        message: "You currently have a car held for your selected dates. Changing dates will release the current hold. Do you want to continue?",
        confirmText: "Yes, Change Dates",
        cancelText: "Keep Current Dates",
        variant: "destructive",
        onConfirm: async () => {
          try {
            if (holdData.newBooking?._id) {
              await handleReleaseHold(holdData.newBooking._id);
            }
          } catch (error) {
            console.error('debug:holdData - Error releasing hold:', error);
          } finally {
            dispatch(clearHoldData());
            handleDataChange({
              startDate: undefined,
              endDate: undefined,
              startTime: undefined,
              endTime: undefined,
            });
            openDatePicker();
          }
        },
        onCancel: () => {
          // Do nothing, keep current dates
        },
      });
    } else {
      openDatePicker();
    }
  }, [holdData, showConfirmation, handleReleaseHold, dispatch, handleDataChange]);

  // Helper function to check if a time is in the past for today's booking
  const isTimeInPast = useCallback(
    (time: string) => {
      if (!bookingDetails.startDate) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(bookingDetails.startDate);
      selectedDate.setHours(0, 0, 0, 0);

      // Only check for today's bookings
      if (today.getTime() !== selectedDate.getTime()) return false;

      const now = new Date();
      const [hours] = time.split(":").map(Number);
      const selectedTime = new Date();
      selectedTime.setHours(hours, 0, 0, 0);

      return selectedTime.getTime() < now.getTime();
    },
    [bookingDetails.startDate],
  );

  // Helper function to check if a time is in the past for the end date
  const isEndTimeInPast = useCallback(
    (time: string) => {
      if (!bookingDetails.endDate) return false;
      return isTimeInPastForDate(time, bookingDetails.endDate);
    },
    [bookingDetails.endDate],
  );

  // Helper function to calculate rental duration in hours
  const calculateRentalDuration = useCallback(() => {
    if (
      !bookingDetails.startDate ||
      !bookingDetails.endDate ||
      !bookingDetails.startTime ||
      !bookingDetails.endTime
    ) {
      return null;
    }

    const startDateTime = new Date(
      `${bookingDetails.startDate}T${bookingDetails.startTime}`,
    );
    const endDateTime = new Date(
      `${bookingDetails.endDate}T${bookingDetails.endTime}`,
    );

    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    return durationHours;
  }, [
    bookingDetails.startDate,
    bookingDetails.endDate,
    bookingDetails.startTime,
    bookingDetails.endTime,
  ]);

  // Check if booking meets minimum duration requirement
  const isMinimumDurationMet = useCallback(() => {
    const duration = calculateRentalDuration();
    return duration !== null && duration >= 12;
  }, [calculateRentalDuration]);

  // Handle location selection
  const handleLocationSelect = useCallback(
    (location: string, locationData?: LocationData) => {
      const locationString = locationData
        ? `${locationData.region || ""}, ${locationData.province || ""}, ${locationData.city || ""}, ${locationData.barangay || ""}`
            .replace(/, ,/g, ",")
            .replace(/^, |, $/g, "")
        : location;
      handleDataChange({ location: locationString });
    },
    [handleDataChange],
  );

  // Handle end date selection
  const handleEndDateSelect = useCallback(
    (date: Date) => {
      const dateString = formatDateToYYYYMMDD(date);
      handleDataChange({ endDate: dateString });
    },
    [handleDataChange],
  );

  // Get display date format
  const getDisplayDate = useCallback((dateString: string | undefined) => {
    if (!dateString) return "Select date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Select date";
    }
  }, []);

  // Step 2: Get unavailable dates from bookings (for logging only)
  const getBookedDates = useCallback((): any[] => {
    if (!selectedCar || !selectedCar.availability?.unavailableDates) {
      return [];
    }

    // Return array of objects with time information
    const bookedDatesWithTime = selectedCar.availability.unavailableDates.map(
      (booking: any) => ({
        startDate: booking.startDate,
        endDate: booking.endDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        _id: booking._id,
      }),
    );

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
      const dateString = pastDate.toISOString().split("T")[0]; // YYYY-MM-DD format
      pastDates.push(dateString);
    }

    return pastDates;
  }, []);

  // Get dates that should be blocked due to booking conflicts (12-hour minimum gap)
  const getBlockedDatesFromBookings = useCallback((): string[] => {
    const bookedDates = getBookedDates();
    const blockedDates = new Set<string>();

    for (let i = 0; i < bookedDates.length; i++) {
      const booking = bookedDates[i];

      // Always block the start date of any booking
      blockedDates.add(booking.startDate);

      // Also block the end date of any booking (for stricter logic)
      blockedDates.add(booking.endDate);

      // Check conflicts with other bookings
      for (let j = 0; j < bookedDates.length; j++) {
        if (i === j) continue; // Skip self

        const otherBooking = bookedDates[j];

        // Check if this booking's start date conflicts with other booking's end date
        if (booking.startDate === otherBooking.endDate) {
          const [bookingStartHours, bookingStartMinutes] = booking.startTime
            .split(":")
            .map(Number);
          const [otherEndHours, otherEndMinutes] = otherBooking.endTime
            .split(":")
            .map(Number);

          const bookingStartTime = bookingStartHours * 60 + bookingStartMinutes;
          const otherBookingEndTime = otherEndHours * 60 + otherEndMinutes;

          // Calculate time between bookings (same day)
          const timeBetweenBookings = bookingStartTime - otherBookingEndTime;

          // If time between bookings is less than 12 hours, block both dates
          if (timeBetweenBookings < 720 && timeBetweenBookings >= 0) {
            blockedDates.add(otherBooking.endDate);
            blockedDates.add(booking.startDate);
          }
        }

        // Check cross-day conflicts (booking ends on day A, next booking starts on day B)
        const bookingEnd = new Date(booking.endDate);
        const otherStart = new Date(otherBooking.startDate);

        // Normalize dates to compare without time
        bookingEnd.setHours(0, 0, 0, 0);
        otherStart.setHours(0, 0, 0, 0);

        // Calculate days between bookings
        const daysDiff = Math.round(
          (otherStart.getTime() - bookingEnd.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysDiff === 1) {
          // Bookings are on consecutive days, check time gap across midnight
          const [bookingEndHours, bookingEndMinutes] = booking.endTime
            .split(":")
            .map(Number);
          const [otherStartHours, otherStartMinutes] = otherBooking.startTime
            .split(":")
            .map(Number);

          const bookingEndTime = bookingEndHours * 60 + bookingEndMinutes;
          const otherBookingStartTime =
            otherStartHours * 60 + otherStartMinutes;

          // Time from booking end to midnight + time from midnight to next booking start
          const midnightTime = 24 * 60; // 24:00 in minutes
          const timeBetweenBookings =
            midnightTime - bookingEndTime + otherBookingStartTime;

          // If time between bookings is less than 12 hours, block both dates
          if (timeBetweenBookings < 720) {
            blockedDates.add(booking.endDate);
            blockedDates.add(otherBooking.startDate);
          }
        }
      }
    }

    const result = Array.from(blockedDates);
    return result;
  }, [getBookedDates]);

  // Validate date range for conflicts and show alerts
  const validateDateRange = useCallback(
    (startDate: string, endDate: string): boolean => {
      if (!startDate || !endDate) {
        return true; // No validation needed if dates are missing
      }

      const bookedDates = getBookedDates();

      // Check if the selected date range conflicts with any existing bookings
      for (const booking of bookedDates) {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);
        const selectedStart = new Date(startDate);
        const selectedEnd = new Date(endDate);

        // Check if selected dates overlap with booking dates
        const datesOverlap =
          selectedStart <= bookingEnd && selectedEnd >= bookingStart;

        if (datesOverlap) {
          // ISOLATED FIX: If the end date lands on a booking's start date,
          // allow it because the user can end their booking BEFORE the existing booking starts.
          // The time validation will enforce the actual time constraints later.
          if (endDate === booking.startDate && startDate < booking.startDate) {
            continue; // Skip this booking, check others
          }

          // If the start date is before all bookings and end date is before booking start, no real conflict
          if (
            selectedEnd.getTime() === bookingStart.getTime() &&
            endDate === booking.startDate
          ) {
            continue;
          }

          return false; // Conflict found
        }
      }

      return true; // No conflicts
    },
    [getBookedDates],
  );

  // Wrapper for handleDataChange that includes validation and alerts
  const handleDataChangeWithValidation = useCallback(
    (
      data: Partial<BookingDetails>,
      showAlert?: (title: string, message: string) => void,
    ) => {
      // Reset time values and end date when start date changes
      data = resetDatesAndTimesOnStartDateChange(
        data,
        bookingDetails.startDate,
      );

      // Validate date range using the helper function
      const validation = validateDateRangeWithAlerts(
        data,
        bookingDetails,
        validateDateRange,
        showAlert,
      );
      if (!validation.shouldProceed) {
        // Don't update the dates if there's a conflict
        return;
      }
      // If no conflicts, proceed with the data change
      handleDataChange(data);
    },
    [validateDateRange, bookingDetails, handleDataChange],
  );

  // Check if today is available for booking based on current time and next booking
  const isTodayAvailable = useCallback((): boolean => {
    // Get current time information
    const timeInfo = getCurrentTimeInfo(new Date());
    const bookedDates = getBookedDates();

    // Get future bookings
    const futureBookings = getFutureBookings(
      bookedDates,
      timeInfo.today,
      timeInfo.currentTime,
    );

    if (futureBookings.length === 0) {
      return true;
    }

    // Get next booking info
    const nextBookingInfo = getNextBookingInfo(futureBookings);
    if (!nextBookingInfo) return true;

    // Calculate time gap
    const timeGap = calculateTimeGap(
      timeInfo.currentMinutes,
      timeInfo.today,
      nextBookingInfo,
      timeInfo.now,
    );
    // Check availability
    const availability = checkTodayAvailability(timeGap);
    return availability.isAvailable;
  }, [getBookedDates]);

  // Check if a booked date has sufficient time left for new bookings
  const hasSufficientTimeOnDate = useCallback(
    (date: string): boolean => {
      const bookedDates = getBookedDates();
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

      // Find if this date is an end date of any booking
      const bookingsEndingOnDate = bookedDates.filter(
        (booking: any) => booking.endDate === date,
      );

      // Also check if this date is a start date of any booking that has insufficient gap from previous day
      const bookingsStartingOnDate = bookedDates.filter(
        (booking: any) => booking.startDate === date,
      );

      if (
        bookingsEndingOnDate.length === 0 &&
        bookingsStartingOnDate.length === 0
      ) {
        return true; // No bookings ending or starting on this date
      }

      // Check each booking ending on this date
      for (const booking of bookingsEndingOnDate) {
        const [endHours, endMinutes] = booking.endTime.split(":").map(Number);
        const bookingEndTime = endHours * 60 + endMinutes;

        // Calculate time remaining until end of day (23:59)
        const endOfDayTime = 23 * 60 + 59; // 23:59 in minutes
        const timeRemaining = endOfDayTime - bookingEndTime;

        // If this is today and current time is past booking end time, no time left
        if (date === now.toISOString().split("T")[0]) {
          if (currentTime >= bookingEndTime) {
            return false;
          }
        }

        // If less than 1 hour remaining on the booked end date, insufficient time
        if (timeRemaining < 60) {
          return false;
        }
      }

      // Check each booking starting on this date for conflicts with previous day bookings
      for (const booking of bookingsStartingOnDate) {
        const [startHours, startMinutes] = booking.startTime
          .split(":")
          .map(Number);
        const bookingStartTime = startHours * 60 + startMinutes;

        // Find any booking that ends the day before
        const previousDay = new Date(date);
        previousDay.setDate(previousDay.getDate() - 1);
        const previousDayString = previousDay.toISOString().split("T")[0];

        const bookingsEndingPreviousDay = bookedDates.filter(
          (b: any) => b.endDate === previousDayString,
        );

        for (const prevBooking of bookingsEndingPreviousDay) {
          const [prevEndHours, prevEndMinutes] = prevBooking.endTime
            .split(":")
            .map(Number);
          const prevBookingEndTime = prevEndHours * 60 + prevEndMinutes;

          // Calculate time between previous booking end and this booking start
          const midnightTime = 24 * 60; // 24:00 in minutes
          const timeBetweenBookings =
            midnightTime - prevBookingEndTime + bookingStartTime;

          // If time between bookings is less than 12 hours, insufficient time
          if (timeBetweenBookings < 720) {
            return false;
          }
        }
      }
      return true;
    },
    [getBookedDates],
  );

  // Check if a date should be completely blocked due to bookings ending on that date
  const shouldBlockDateCompletely = useCallback(
    (date: string): boolean => {
      const bookedDates = selectedCar?.unavailableDates || [];

      // Check if any booking ends on this date with insufficient time remaining
      for (const booking of bookedDates) {
        if (booking.endDate === date) {
          const [endHours, endMinutes] = booking.endTime.split(":").map(Number);
          const bookingEndTime = endHours * 60 + endMinutes;

          // Calculate time remaining until end of day (23:59)
          const endOfDayTime = 23 * 60 + 59; // 23:59 in minutes
          const timeRemaining = endOfDayTime - bookingEndTime;

          // If less than 1 hour remaining, block the entire date
          if (timeRemaining < 60) {
            return true;
          }
        }
      }

      return false;
    },
    [selectedCar],
  );

  // Get unavailable dates for start date picker (Step 3: include booking conflicts + time availability)
  const getUnavailableStartDates = useCallback((): string[] => {
    // Get blocked dates from booking conflicts
    const blockedDates = getBlockedDatesFromBookings();

    const availableTimeDates: string[] = [];
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Explicitly check if today should be available, even if it's not in blocked dates
    const todayIsAvailable = isTodayAvailable();


    if (!todayIsAvailable) {
      availableTimeDates.push(today);

    } else {
     
    }

    blockedDates.forEach((date) => {

      // Skip today since we already checked it above
      if (date === today) {
        return;
      }

      // If it's a past date, keep it blocked
      if (date < today) {
        availableTimeDates.push(date);
      } else {
        // Check if date should be completely blocked due to insufficient time after booking
        const shouldBlock = shouldBlockDateCompletely(date);
        if (shouldBlock) {
          availableTimeDates.push(date);

        } else {
          // For today and future dates, check if there's sufficient time
          // BUT only if this date wasn't already blocked for booking conflicts
          const hasTime = hasSufficientTimeOnDate(date);
   

          // If the date was blocked due to booking conflicts, keep it blocked regardless of time
          const wasBlockedByConflict =
            getBlockedDatesFromBookings().includes(date);

          if (!hasTime || wasBlockedByConflict) {
            availableTimeDates.push(date);
          } 
        }
      }
    });

    // Combine with past dates
    const pastDates = getPastDates();
    const allUnavailableDates = [
      ...new Set([...pastDates, ...availableTimeDates]),
    ];
    return allUnavailableDates;
  }, [
    getPastDates,
    getBlockedDatesFromBookings,
    hasSufficientTimeOnDate,
    shouldBlockDateCompletely,
    isTodayAvailable,
  ]);

  // ISOLATED: Check if a date has available time BEFORE the first booking starts on that date.
  // This is specifically for END DATE validation - a user can end their booking on a date
  // that has existing bookings, as long as they end BEFORE the first booking starts.
  // Example: If 2026-02-12 has a booking at 10:00 AM, the user can end at 9:00 AM.
  const hasAvailableEndTimeOnDate = useCallback(
    (date: string): boolean => {
      const bookedDates = getBookedDates();

      // Find all bookings that START on this date
      const bookingsStartingOnDate = bookedDates.filter(
        (b: any) => b.startDate === date,
      );

      // Find all bookings that span across this date (started before, ends on or after)
      const bookingsSpanningDate = bookedDates.filter(
        (b: any) => b.startDate < date && b.endDate >= date,
      );

      // If a booking spans across this date (e.g., started yesterday, ends today or later),
      // the date is fully occupied from midnight
      if (bookingsSpanningDate.length > 0) {
        return false;
      }

      // If no bookings start on this date, it's fully available
      if (bookingsStartingOnDate.length === 0) {
        return true;
      }

      // Find the earliest booking start time on this date
      let earliestStartMinutes = 24 * 60; // Default to end of day
      for (const booking of bookingsStartingOnDate) {
        const [hours, minutes] = booking.startTime.split(":").map(Number);
        const startMinutes = hours * 60 + minutes;
        if (startMinutes < earliestStartMinutes) {
          earliestStartMinutes = startMinutes;
        }
      }

      // Available time before first booking (from midnight to first booking)
      const availableMinutes = earliestStartMinutes;

      // If there's ANY time before the first booking, the date is available as an end date
      // (minimum 1 hour before first booking to be practical)
      return availableMinutes >= 60;
    },
    [getBookedDates],
  );

  // Get unavailable dates for end date picker
  // KEY DIFFERENCE from start date: allows dates that have bookings IF there's
  // available time BEFORE the first booking (user can end their booking before it starts)
  const getUnavailableEndDates = useCallback((): string[] => {

    const blockedEndDates: string[] = [];
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // 1. Check today's availability
    const todayIsAvailable = isTodayAvailable();
    if (!todayIsAvailable) {
      blockedEndDates.push(today);
    }

    // 2. Get all dates that have booking conflicts
    const conflictDates = getBlockedDatesFromBookings();

    // 3. For each conflict date, check if it can still be used as an END date
    conflictDates.forEach((date) => {
      if (date === today) return; // Already handled above
      if (date < today) return; // Past dates handled by getPastDates

      // NEW LOGIC: Check if this date has available time BEFORE the first booking
      const canEndOnDate = hasAvailableEndTimeOnDate(date);

      if (!canEndOnDate) {
        blockedEndDates.push(date);
      }
    });

    // 4. Combine with past dates
    const pastDates = getPastDates();
    const allUnavailableDates = [
      ...new Set([...pastDates, ...blockedEndDates]),
    ];

    return allUnavailableDates;
  }, [
    getPastDates,
    getBlockedDatesFromBookings,
    hasAvailableEndTimeOnDate,
    isTodayAvailable,
  ]);

  // Legacy function for backward compatibility
  const getUnavailableDates = useCallback((): string[] => {
    return getUnavailableStartDates();
  }, [getUnavailableStartDates]);

  // Check if start time should be disabled based on booking conflicts
  const isStartTimeConflicting = useCallback(
    (startTime: string): boolean => {


      if (!bookingDetails.startDate) {
        return false;
      }

      const bookedDates = selectedCar?.unavailableDates || [];


      const result = isStartTimeConflictingWithBookings(
        startTime,
        bookingDetails.startDate,
        bookedDates,
      );
      return result;
    },
    [bookingDetails.startDate, selectedCar],
  );

  // ISOLATED: Enhanced end time validation that blocks times conflicting with bookings on the end date.
  // If end date has a booking starting at e.g. 10:00 AM, block 10:00 AM onwards.
  const isEndTimeDisabledWithBookings = useCallback(
    (
      endTime: string,
      startTime: string | undefined,
      startDate: string | undefined,
      endDate: string | undefined,
    ): boolean => {
      // First apply the original same-date logic
      const originalDisabled = isEndTimeDisabled(
        endTime,
        startTime,
        startDate,
        endDate,
      );
      if (originalDisabled) return true;

      // If no end date, nothing to check
      if (!endDate) return false;

      const bookedDates = getBookedDates();

      // Find the earliest booking start time on the end date
      const bookingsStartingOnEndDate = bookedDates.filter(
        (b: any) => b.startDate === endDate,
      );
      if (bookingsStartingOnEndDate.length === 0) return false;

      let earliestStartMinutes = 24 * 60;
      for (const booking of bookingsStartingOnEndDate) {
        const [hours, minutes] = booking.startTime.split(":").map(Number);
        const startMinutes = hours * 60 + minutes;
        if (startMinutes < earliestStartMinutes) {
          earliestStartMinutes = startMinutes;
        }
      }

      // Block end times at or after the earliest booking start time on the end date
      const [endHours, endMinutes] = endTime.split(":").map(Number);
      const endTimeMinutes = endHours * 60 + (endMinutes || 0);

      return endTimeMinutes >= earliestStartMinutes;
    },
    [getBookedDates],
  );

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
    holdData,
    handleDateClickWithHoldCheck,

    // Functions
    handleDataChange,
    handleDataChangeWithValidation,
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
    validateDateRange,

    // Time validation utilities
    formatTimeDisplay: formatTimeDisplay,
    generateTimeOptions: generateTimeOptions,
    getEndDateMinDate: getEndDateMinDate,
    isEndTimeDisabled: isEndTimeDisabledWithBookings,
    isStartTimeDisabled: isStartTimeDisabled,
    isStartTimeConflicting: isStartTimeConflicting,
    charge: Number(process.env.CHARGE_PER_KM), // Default to 30 if not set
    bookingTracker,
  };
}
