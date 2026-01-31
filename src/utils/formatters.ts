/**
 * Format a number as currency with thousands separator
 * @param amount - The amount to format
 * @param decimalPlaces - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1,234.56")
 */
export const formatCurrency = (amount: number, decimalPlaces: number = 2): string => {
  return amount.toFixed(decimalPlaces).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
