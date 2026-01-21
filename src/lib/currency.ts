/**
 * Currency utility functions for formatting Philippine Peso (PHP)
 */

/**
 * Format a number as Philippine Peso with 2 decimal points
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "₱1,234.56")
 */
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '₱0.00';
  }

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

/**
 * Format a number as Philippine Peso without currency symbol
 * @param amount - The amount to format
 * @returns Formatted number string (e.g., "1,234.56")
 */
export function formatNumber(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0.00';
  }

  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

/**
 * Parse a currency string back to number
 * @param currencyString - The currency string to parse
 * @returns Parsed number
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbol and other non-numeric characters except decimal point and minus
  const cleanString = currencyString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleanString);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculate total with tax (optional)
 * @param amount - Base amount
 * @param taxRate - Tax rate as decimal (e.g., 0.12 for 12%)
 * @returns Total amount including tax
 */
export function calculateTotalWithTax(amount: number, taxRate: number = 0): number {
  return amount + (amount * taxRate);
}

/**
 * Format price per period (hourly/daily)
 * @param price - The price amount
 * @param period - The time period (e.g., "12 hours", "24 hours", "day")
 * @returns Formatted price string with period
 */
export function formatPricePerPeriod(price: number, period: string): string {
  return `${formatCurrency(price)} / ${period}`;
}
