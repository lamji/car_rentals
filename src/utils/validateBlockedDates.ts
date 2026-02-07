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
