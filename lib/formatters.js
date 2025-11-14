import { format, parseISO } from 'date-fns';

/**
 * Formats a currency value with the specified currency code
 * 
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (USD, UGX, KES, etc.)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  const currencyMap = {
    USD: { symbol: '$', decimals: 2 },
    UGX: { symbol: 'UGX', decimals: 0 },
    KES: { symbol: 'KES', decimals: 2 },
    RWF: { symbol: 'RWF', decimals: 0 },
    EUR: { symbol: '€', decimals: 2 },
  };

  const config = currencyMap[currency] || { symbol: currency, decimals: 2 };
  const formatted = amount.toFixed(config.decimals);
  
  return `${config.symbol} ${formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Formats a date to a human-readable string
 * 
 * @param {Date|string} date - The date to format
 * @param {string} formatStr - The format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Formats a date to a relative time string (e.g., "2 days ago")
 * 
 * @param {Date|string} date - The date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(dateObj);
}

/**
 * Formats a weight in kg with appropriate unit
 * 
 * @param {number} kg - Weight in kilograms
 * @returns {string} Formatted weight string
 */
export function formatWeight(kg) {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} tonnes`;
  }
  return `${kg.toFixed(2)} kg`;
}

/**
 * Formats a carbon footprint value
 * 
 * @param {number} kgCO2 - Carbon in kg CO2
 * @returns {string} Formatted carbon string
 */
export function formatCarbon(kgCO2) {
  if (kgCO2 >= 1000) {
    return `${(kgCO2 / 1000).toFixed(2)} tonnes CO₂`;
  }
  return `${kgCO2.toFixed(2)} kg CO₂`;
}

/**
 * Truncates text to a specified length
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Validates and formats a phone number
 * 
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  // Format as +XXX XXX XXX XXX
  if (cleaned.length >= 10) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  return phone;
}
