import { useEffect, useRef } from 'react';
import useHoldCar from '../../lib/api/useHoldCar';
import { showAlert } from '../../lib/slices/alertSlice';
import { useAppDispatch } from '../../lib/store';



/**
 * Check if booking meets minimum 12-hour duration
 */
const isMinimumDurationMet = (
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string
): boolean => {
  // Create date objects
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  
  // Calculate duration in hours
  const durationMs = end.getTime() - start.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  
  return durationHours >= 12;
};

/**
 * Complete booking change management hook
 * One function for one purpose - handles state, tracking, and car holding
 */
export const useBookingChangeTracker = (
  bookingDetails: { startDate?: string; endDate?: string; startTime?: string; endTime?: string },
  carId?: string
): { isHoldLoading: boolean } => {
  // Ref to track previous booking fields (doesn't cause re-renders)
  const previousBookingFieldsRef = useRef({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: ''
  });
  
  // Ref to track if this is the first run (to prevent false alerts on mount)
  const isFirstRunRef = useRef(true);
  
  // Ref to store the current booking ID for release
  // const currentBookingIdRef = useRef<string | null>(null);
  
  // Global modals and dispatch
  const dispatch = useAppDispatch();
  // const { showConfirmation } = useConfirmation();
  
  // Hold car API hooks
  const { handleHoldDate, isLoading: isHoldLoading } = useHoldCar({ id: carId || '' });
  // const { handleReleaseHold } = useReleaseHold({ id: carId || '' });
  
  // Handle car hold and confirmation - use ref to avoid useEffect dependency issues
  const handleHoldDateRef = useRef(handleHoldDate);
  const dispatchRef = useRef(dispatch);
  const carIdRef = useRef(carId);
  
  // Keep refs up to date
  useEffect(() => {
    handleHoldDateRef.current = handleHoldDate;
    dispatchRef.current = dispatch;
    carIdRef.current = carId;
  });
  
  // Effect to handle booking changes
  useEffect(() => {
    // Skip first run to prevent false alerts when component mounts
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      // Initialize ref with current values without triggering alert
      previousBookingFieldsRef.current = {
        startDate: bookingDetails.startDate || '',
        endDate: bookingDetails.endDate || '',
        startTime: bookingDetails.startTime || '',
        endTime: bookingDetails.endTime || ''
      };
      return;
    }
    
    // Extract current booking fields
    const currentFields = {
      startDate: bookingDetails.startDate || '',
      endDate: bookingDetails.endDate || '',
      startTime: bookingDetails.startTime || '',
      endTime: bookingDetails.endTime || ''
    };
    
    const previousFields = previousBookingFieldsRef.current;
    
    // Check if booking fields have actually changed
    const hasChanged = 
      previousFields.startDate !== currentFields.startDate ||
      previousFields.endDate !== currentFields.endDate ||
      previousFields.startTime !== currentFields.startTime ||
      previousFields.endTime !== currentFields.endTime;
    
    // Hold car if booking is complete, has changed, and meets minimum 12-hour duration
    if (hasChanged && 
        currentFields.startDate && 
        currentFields.endDate && 
        currentFields.startTime && 
        currentFields.endTime &&
        carIdRef.current &&
        isMinimumDurationMet(currentFields.startDate, currentFields.endDate, currentFields.startTime, currentFields.endTime)) {
      
      console.log('debug:holdData - calling handleHoldDate with:', currentFields);
      try {
        handleHoldDateRef.current({
          startDate: currentFields.startDate,
          endDate: currentFields.endDate,
          startTime: currentFields.startTime,
          endTime: currentFields.endTime
        });
      } catch (error) {
        console.error('Error holding car:', error);
        dispatchRef.current(showAlert({
          type: "error",
          title: "System Error",
          message: "Unable to hold the car at this moment. Please try again."
        }));
      }
    }
    
    // Update ref
    previousBookingFieldsRef.current = currentFields;
  }, [bookingDetails.startDate, bookingDetails.endDate, bookingDetails.startTime, bookingDetails.endTime]);
  
  return { isHoldLoading };
};
