/**
 * Format currency in professional financial format with 2 decimal places
 * Example: formatCurrency(25000) => "$25,000.00"
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format currency without the dollar sign (for cases where $ is added separately)
 * Example: formatCurrencyValue(25000) => "25,000.00"
 */
export const formatCurrencyValue = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
