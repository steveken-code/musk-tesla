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

/**
 * Format large numbers with abbreviated suffixes (T, B, M, K)
 * User-friendly display for market cap, volume, etc.
 * Example: formatAbbreviatedValue(41580000000000) => "$41.58T"
 * Example: formatAbbreviatedValue(189300000) => "$189.3M"
 * Example: formatAbbreviatedValue(1500) => "$1.5K"
 * Example: formatAbbreviatedValue(500) => "$500"
 */
export const formatAbbreviatedValue = (amount: number, includeDollar = true): string => {
  const prefix = includeDollar ? '$' : '';
  
  if (amount >= 1_000_000_000_000) {
    return `${prefix}${(amount / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (amount >= 1_000_000_000) {
    return `${prefix}${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (amount >= 1_000_000) {
    return `${prefix}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 10_000) {
    return `${prefix}${(amount / 1_000).toFixed(1)}K`;
  }
  
  // For smaller amounts, use smart formatting
  const hasDecimals = amount % 1 !== 0;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `${prefix}${formatted}`;
};

/**
 * Format volume numbers without dollar sign
 * Example: formatVolume(189300000) => "189.3M"
 */
export const formatVolume = (volume: number): string => {
  return formatAbbreviatedValue(volume, false);
};

/**
 * Format percentage with optional sign
 * Example: formatPercentage(2.5) => "+2.5%"
 * Example: formatPercentage(-1.2) => "-1.2%"
 */
export const formatPercentage = (percent: number): string => {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(1)}%`;
};
