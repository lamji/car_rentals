/**
 * Reset time values and end date when start date changes
 * This prevents confusion with invalid date ranges when the user changes the start date
 */
export const resetDatesAndTimesOnStartDateChange = (
  data: { startDate?: string; endDate?: string; startTime?: string; endTime?: string },
  currentStartDate: string | undefined
): { startDate?: string; endDate?: string; startTime?: string; endTime?: string } => {
  // Reset time values and end date when start date changes
  if (data.startDate && data.startDate !== currentStartDate) {
    return {
      ...data,
      startTime: undefined,
      endTime: undefined,
      endDate: undefined
    };
  }
  
  return data;
};