/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Filter out past dates from unavailable dates array
 * Only shows dates that are today or in the future
 * @param unavailableDates - Array of date strings in YYYY-MM-DD format
 * @returns {string[]} Filtered array containing only future dates
 */
export function getFutureUnavailableDates(unavailableDates: string[]): string[] {
  if (!unavailableDates || unavailableDates.length === 0) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison

  return unavailableDates.filter((dateString: string) => {
    const date = new Date(dateString)
    return date >= today
  })
}

/**
 * Check if a car is available today based on booking data
 * @param bookings - Array of booking objects with date ranges and time slots
 * @returns {boolean} True if car is available today, false if booked
 */
export function isCarAvailableToday(bookings: any[]): boolean {
  if (!bookings || bookings.length === 0) return true

  const today = new Date()
  const todayString = today.toISOString().split('T')[0]
  const currentHour = today.getHours()

  return !bookings.some(booking => {
    const bookingStartDate = new Date(booking.startDate)
    const bookingEndDate = new Date(booking.endDate)
    const bookingStartHour = parseInt(booking.startTime.split(':')[0])
    const bookingEndHour = parseInt(booking.endTime.split(':')[0])

    // Check if today is within the booking date range
    if (bookingStartDate.toISOString().split('T')[0] <= todayString && 
        bookingEndDate.toISOString().split('T')[0] >= todayString) {
      
      // If booking is for today only, check time overlap
      if (bookingStartDate.toISOString().split('T')[0] === todayString && 
          bookingEndDate.toISOString().split('T')[0] === todayString) {
        return currentHour >= bookingStartHour && currentHour < bookingEndHour
      }
      
      // If booking spans multiple days and includes today, it's unavailable
      return true
    }
    
    return false
  })
}

/**
 * Format booking date range with times for display
 * @param booking - Booking object with date ranges and time slots
 * @returns {string} Formatted string like "02/12/2026 10AM to 02/13/2026 10PM"
 */
export function formatBookingForDisplay(booking: any): string {
  const startDate = new Date(booking.startDate)
  const endDate = new Date(booking.endDate)
  const startTime = booking.startTime
  const endTime = booking.endTime

  // Format dates as MM/DD/YYYY
  const startDateFormat = startDate.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  })

  const endDateFormat = endDate.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  })

  // Format times as 12-hour format with AM/PM
  const formatTime = (time: string) => {
    const [hours] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12 // Convert 0 to 12
    return `${displayHour}${ampm}`
  }

  const startTimeFormatted = formatTime(startTime)
  const endTimeFormatted = formatTime(endTime)

  return `${startDateFormat} ${startTimeFormatted} to ${endDateFormat} ${endTimeFormatted}`
}

/**
 * Get future bookings for display
 * @param bookings - Array of booking objects
 * @returns {any[]} Filtered array containing only future bookings
 */
export function getFutureBookings(bookings: any[]): any[] {
  if (!bookings || bookings.length === 0) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return bookings.filter(booking => {
    const endDate = new Date(booking.endDate)
    return endDate >= today
  })
}
