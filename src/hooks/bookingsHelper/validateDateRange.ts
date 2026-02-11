/**
 * Validate date range for conflicts and show alerts
 * Returns true if valid, false if conflicts found
 */
export const validateDateRangeWithAlerts = (
  data: { startDate?: string; endDate?: string },
  currentBookingDetails: { startDate?: string; endDate?: string },
  validateDateRange: (startDate: string, endDate: string) => boolean,
  showAlert?: (title: string, message: string) => void
): { isValid: boolean; shouldProceed: boolean } => {
  // Validate date range when both dates are selected
  if (data.startDate && data.endDate) {
    const isValid = validateDateRange(data.startDate, data.endDate);
    if (!isValid) {
      console.log('debug:validation - Date range conflict detected, showing alert');
      if (showAlert) {
        showAlert(
          'Date Conflict',
          `The selected dates (${data.startDate} to ${data.endDate}) conflict with existing bookings. Please choose different dates.`
        );
      }
      return { isValid: false, shouldProceed: false };
    }
  }
  
  // Also validate if only end date is being changed and start date already exists
  if (data.endDate && currentBookingDetails.startDate && !data.startDate) {
    const isValid = validateDateRange(currentBookingDetails.startDate, data.endDate);
    if (!isValid) {
      console.log('debug:validation - End date conflict detected, showing alert');
      if (showAlert) {
        showAlert(
          'Date Conflict',
          `The selected end date (${data.endDate}) conflicts with existing bookings. Please choose a different date.`
        );
      }
      return { isValid: false, shouldProceed: false };
    }
  }
  
  // Also validate if only start date is being changed and end date already exists
  if (data.startDate && currentBookingDetails.endDate && !data.endDate) {
    const isValid = validateDateRange(data.startDate, currentBookingDetails.endDate);
    if (!isValid) {
      console.log('debug:validation - Start date conflict detected, showing alert');
      if (showAlert) {
        showAlert(
          'Date Conflict',
          `The selected start date (${data.startDate}) conflicts with existing bookings. Please choose different dates.`
        );
      }
      return { isValid: false, shouldProceed: false };
    }
  }
  
  console.log('debug:validation - No conflicts found, proceeding with data change');
  return { isValid: true, shouldProceed: true };
};
