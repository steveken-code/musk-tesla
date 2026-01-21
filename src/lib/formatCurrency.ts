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

/**
 * Format USDT amounts in professional crypto format
 * Smart formatting: shows decimals only when needed
 * Example: formatUSDT(1000) => "1,000 USDT"
 * Example: formatUSDT(895.65) => "895.65 USDT"
 * Note: No $ prefix for USDT, uses USDT suffix
 */
export const formatUSDT = (amount: number): string => {
  const hasDecimals = amount % 1 !== 0;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} USDT`;
};

/**
 * Format USD amounts with smart decimal handling
 * Shows decimals only when the amount has cents
 * Example: formatSmartCurrency(1000) => "$1,000"
 * Example: formatSmartCurrency(895.65) => "$895.65"
 */
export const formatSmartCurrency = (amount: number): string => {
  const hasDecimals = amount % 1 !== 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
