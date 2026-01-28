/**
 * Filters unavailable dates to only include today and future dates
 * @param unavailableDates - Array of date strings in ISO format (yyyy-mm-dd)
 * @returns Array of date strings that are today or in the future
 */
export function getFutureUnavailableDates(unavailableDates: string[]): string[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return unavailableDates.filter(date => {
        const unavailableDate = new Date(date);
        unavailableDate.setHours(0, 0, 0, 0);
        return unavailableDate >= today;
    });
}

/**
 * Converts a Date object to YYYY-MM-DD format without timezone issues
 * This avoids the UTC conversion problem with date.toISOString()
 * @param date - Date object to convert
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};
