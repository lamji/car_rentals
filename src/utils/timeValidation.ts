/**
 * Format time from 24-hour format to 12-hour AM/PM display format
 * @param time24 - Time in "HH:00" format (24-hour)
 * @returns string - Formatted time like "11:00 AM"
 */
export function formatTimeDisplay(time24: string): string {
  const [hours] = time24.split(':').map(Number);
  const hour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const period = hours < 12 ? 'AM' : 'PM';
  return `${hour}:00 ${period}`;
}

/**
 * Generate time options for dropdown (24 hours)
 * @returns Array of time options with display and value properties
 */
export function generateTimeOptions() {
  return Array.from({ length: 24 }, (_, i) => {
    const displayTime = formatTimeDisplay(`${i.toString().padStart(2, '0')}:00`);
    const value = `${i.toString().padStart(2, '0')}:00`;
    return { displayTime, value, hour: i };
  });
}

/**
 * Check if end time should be disabled based on start time and dates
 * @param endTime - The end time to check (format: "HH:00")
 * @param startTime - The selected start time (format: "HH:00")
 * @param startDate - The selected start date (format: "YYYY-MM-DD")
 * @param endDate - The selected end date (format: "YYYY-MM-DD")
 * @returns boolean - true if end time should be disabled
 */
export function isEndTimeDisabled(
  endTime: string,
  startTime: string | undefined,
  startDate: string | undefined,
  endDate: string | undefined
): boolean {
  // If missing required data, don't disable
  if (!startTime || !startDate || !endDate) {
    return false;
  }

  // If different dates, no restriction
  if (startDate !== endDate) {
    return false;
  }

  // If same date, check if end time is before or equal to start time
  const [endHours] = endTime.split(':').map(Number);
  const [startHours] = startTime.split(':').map(Number);

  return endHours <= startHours;
}

/**
 * Check if start time should be disabled based on 12-hour minimum rental duration
 * @param startTime - The start time to check (format: "HH:00")
 * @param startDate - The selected start date (format: "YYYY-MM-DD")
 * @param endDate - The selected end date (format: "YYYY-MM-DD")
 * @returns boolean - true if start time should be disabled
 */
export function isStartTimeDisabled(
  startTime: string,
  startDate: string | undefined,
  endDate: string | undefined
): boolean {
  // If missing required data or different dates, don't disable
  if (!startDate || !endDate || startDate !== endDate) {
    return false;
  }

  // If same date, check if start time allows for 12-hour minimum rental
  const [startHours] = startTime.split(':').map(Number);
  const hoursLeftInDay = 24 - startHours;

  // Disable if less than 12 hours left in the day
  return hoursLeftInDay < 12;
}

/**
 * Check if a time is in the past for a specific date
 * @param time - Time in "HH:00" format
 * @param date - Date in "YYYY-MM-DD" format
 * @returns boolean - true if time is in the past for the given date
 */
export function isTimeInPastForDate(time: string, date: string): boolean {
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);

  // Only check for today's date
  if (today.getTime() !== selectedDate.getTime()) return false;

  const now = new Date();
  const [hours] = time.split(':').map(Number);
  const selectedTime = new Date();
  selectedTime.setHours(hours, 0, 0, 0);

  return selectedTime.getTime() < now.getTime();
}

/**
 * Get minimum end date based on 12-hour minimum rental duration
 * @param startDate - The selected start date (format: "YYYY-MM-DD")
 * @returns Date | undefined - Minimum end date or undefined if no start date
 */
export function getEndDateMinDate(startDate: string | undefined): Date | undefined {
  if (!startDate) return undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedStartDate = new Date(startDate);
  selectedStartDate.setHours(0, 0, 0, 0);

  // Check if selected start date is today
  if (today.getTime() === selectedStartDate.getTime()) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if it's possible for 12 hours from current time
    const hoursLeftToday = 24 - currentHour - (currentMinute > 0 ? 1 : 0);

    // If not possible for 12 hours, disable same date in end date selection
    if (hoursLeftToday < 12) {
      const tomorrow = new Date(selectedStartDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    // If possible, do nothing - let it be
    return new Date(startDate);
  }

  // If selected date is tomorrow (or any future date), disable today date for end date selection
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}
