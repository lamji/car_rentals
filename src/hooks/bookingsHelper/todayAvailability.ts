/**
 * Get current time information
 */
export const getCurrentTimeInfo = (dateOverride?: Date) => {
  const now = dateOverride || new Date();
  const today = now.toISOString().split('T')[0];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  return {
    now,
    today,
    currentMinutes,
    currentTime: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
  };
};

// Define proper types for booking data
interface Booking {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  _id?: string;
}

/**
 * Filter and sort future bookings from current time
 */
export const getFutureBookings = (bookedDates: Booking[], today: string, currentTime: string) => {
  return bookedDates
    .filter((booking: Booking) => 
      booking.startDate > today || 
      (booking.startDate === today && booking.startTime > currentTime)
    )
    .sort((a: Booking, b: Booking) => {
      const dateA = new Date(a.startDate + 'T' + a.startTime);
      const dateB = new Date(b.startDate + 'T' + b.startTime);
      return dateA.getTime() - dateB.getTime();
    });
};

/**
 * Get the next booking information
 */
export const getNextBookingInfo = (futureBookings: Booking[]) => {
  if (futureBookings.length === 0) {
    return null;
  }
  
  const nextBooking = futureBookings[0];
  const nextBookingDate = new Date(nextBooking.startDate + 'T' + nextBooking.startTime);
  const nextBookingMinutes = nextBookingDate.getHours() * 60 + nextBookingDate.getMinutes();
  const nextBookingDay = nextBookingDate.toISOString().split('T')[0];
  
  return {
    nextBooking,
    nextBookingDate,
    nextBookingMinutes,
    nextBookingDay
  };
};

/**
 * Calculate time gap from now to next booking
 */
export const calculateTimeGap = (
  currentMinutes: number,
  today: string,
  nextBookingInfo: { nextBookingMinutes: number; nextBookingDay: string },
  now: Date
) => {
  const { nextBookingMinutes, nextBookingDay } = nextBookingInfo;
  
  if (nextBookingDay === today) {
    // Next booking is today
    return nextBookingMinutes - currentMinutes;
  }
  
  // Next booking is on a future day
  const endOfDayMinutes = 24 * 60; // 24:00 in minutes
  const timeRemainingToday = endOfDayMinutes - currentMinutes;
  const daysUntilNextBooking = Math.floor(
    (new Date(nextBookingDay).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const timeUntilNextBookingDay = daysUntilNextBooking * 24 * 60;
  
  return timeRemainingToday + timeUntilNextBookingDay + nextBookingMinutes;
};

/**
 * Check if today is available based on time gap
 */
export const checkTodayAvailability = (timeGap: number) => {
  const minimumRequiredGap = 12 * 60; // 12 hours in minutes
  const isAvailable = timeGap >= minimumRequiredGap;
  
  return {
    isAvailable,
    timeGap,
    minimumRequiredGap,
    message: isAvailable 
      ? `Today is available - ${Math.floor(timeGap / 60)}h ${timeGap % 60}m gap until next booking` 
      : `Today is not available - only ${Math.floor(timeGap / 60)}h ${timeGap % 60}m gap until next booking (need 12h minimum)`
  };
};
