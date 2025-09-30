/**
 * Format a Date object to YYYY-MM-DD string without timezone conversion
 * This prevents dates from shifting when converting to ISO string
 * 
 * @param date - The date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForDB(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse a date string (YYYY-MM-DD) to a Date object at local midnight
 * This prevents timezone issues when displaying dates
 * 
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object at local midnight
 */
export function parseDateFromDB(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

