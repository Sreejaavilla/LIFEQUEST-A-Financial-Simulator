
/**
 * Formats a number as Indian Rupee (INR) currency.
 * Can be easily modified for other currencies.
 * @param amount The number to format.
 * @returns A string representing the formatted currency.
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
