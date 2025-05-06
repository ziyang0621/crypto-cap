/**
 * Helper functions for formatting prices and currency values
 */

/**
 * Format a price value with appropriate currency symbol and decimal places
 * @param {number|string} price - The price to format
 * @param {string} currency - The currency symbol to use (default: '$')
 * @param {number} minimumFractionDigits - Minimum fraction digits (default: 2)
 * @param {number} maximumFractionDigits - Maximum fraction digits (default: 2)
 * @returns {string} - Formatted price string
 */
export const formatPrice = (
  price,
  currency = '$',
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
) => {
  if (!price) return `${currency}0.00`;

  const priceValue = parseFloat(price);

  // Handle small values differently
  if (priceValue < 0.01 && priceValue > 0) {
    return `${currency}${priceValue.toFixed(8)}`;
  }

  return `${currency}${priceValue.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`;
};

/**
 * Format a market cap value with appropriate currency symbol and abbreviation
 * @param {number|string} marketCap - The market cap value to format
 * @param {string} currency - The currency symbol to use (default: '$')
 * @returns {string} - Formatted market cap string (e.g. $1.2B)
 */
export const formatMarketCap = (marketCap, currency = '$') => {
  if (!marketCap) return `${currency}0`;

  const marketCapValue = parseFloat(marketCap);

  // Format based on value size
  if (marketCapValue >= 1e12) {
    return `${currency}${(marketCapValue / 1e12).toFixed(1)}T`;
  } else if (marketCapValue >= 1e9) {
    return `${currency}${(marketCapValue / 1e9).toFixed(1)}B`;
  } else if (marketCapValue >= 1e6) {
    return `${currency}${(marketCapValue / 1e6).toFixed(1)}M`;
  } else if (marketCapValue >= 1e3) {
    return `${currency}${(marketCapValue / 1e3).toFixed(1)}K`;
  }

  return `${currency}${marketCapValue.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};
