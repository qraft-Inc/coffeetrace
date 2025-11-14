/**
 * Application Constants
 * Centralized constants for roles, paths, and status values
 */

// User Roles
export const USER_ROLES = {
  FARMER: 'farmer',
  COOP_ADMIN: 'coopAdmin',
  BUYER: 'buyer',
  INVESTOR: 'investor',
  ADMIN: 'admin',
};

// Dashboard Paths - Maps roles to their dashboard URLs
export const DASHBOARD_PATHS = {
  [USER_ROLES.FARMER]: '/dashboard/farmer',
  [USER_ROLES.COOP_ADMIN]: '/dashboard/coop',
  [USER_ROLES.BUYER]: '/dashboard/buyer',
  [USER_ROLES.INVESTOR]: '/dashboard/investor',
  [USER_ROLES.ADMIN]: '/dashboard/admin',
};

// Lot Status Values
export const LOT_STATUS = {
  HARVESTED: 'harvested',
  PROCESSED: 'processed',
  STORED: 'stored',
  LISTED: 'listed',
  SOLD: 'sold',
};

// Offer Status Values
export const OFFER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COUNTERED: 'countered',
  EXPIRED: 'expired',
};

// Listing Status Values
export const LISTING_STATUS = {
  ACTIVE: 'active',
  SOLD: 'sold',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

// Payment Status Values
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Processing Methods
export const PROCESSING_METHODS = {
  WASHED: 'washed',
  NATURAL: 'natural',
  HONEY: 'honey',
  SEMI_WASHED: 'semi-washed',
};

// Coffee Varieties (Common)
export const COFFEE_VARIETIES = [
  'Arabica',
  'Robusta',
  'Bourbon',
  'Typica',
  'Geisha',
  'Caturra',
  'Catuai',
  'SL28',
  'SL34',
];

// Certifications
export const CERTIFICATIONS = {
  ORGANIC: 'organic',
  FAIR_TRADE: 'fair-trade',
  RAINFOREST: 'rainforest-alliance',
  UTZ: 'utz',
  BIRD_FRIENDLY: 'bird-friendly',
  DIRECT_TRADE: 'direct-trade',
};

// Currency Codes
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  UGX: 'UGX', // Ugandan Shilling
  KES: 'KES', // Kenyan Shilling
  RWF: 'RWF', // Rwandan Franc
};

// Status Badge Colors - Tailwind classes
export const STATUS_COLORS = {
  // Lot Status
  [LOT_STATUS.HARVESTED]: 'bg-yellow-100 text-yellow-800',
  [LOT_STATUS.PROCESSED]: 'bg-blue-100 text-blue-800',
  [LOT_STATUS.STORED]: 'bg-purple-100 text-purple-800',
  [LOT_STATUS.LISTED]: 'bg-green-100 text-green-800',
  [LOT_STATUS.SOLD]: 'bg-gray-100 text-gray-800',
  
  // Offer Status
  [OFFER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OFFER_STATUS.ACCEPTED]: 'bg-green-100 text-green-800',
  [OFFER_STATUS.REJECTED]: 'bg-red-100 text-red-800',
  [OFFER_STATUS.COUNTERED]: 'bg-blue-100 text-blue-800',
  [OFFER_STATUS.EXPIRED]: 'bg-gray-100 text-gray-800',
  
  // Payment Status
  [PAYMENT_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PAYMENT_STATUS.PROCESSING]: 'bg-blue-100 text-blue-800',
  [PAYMENT_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [PAYMENT_STATUS.FAILED]: 'bg-red-100 text-red-800',
  [PAYMENT_STATUS.REFUNDED]: 'bg-orange-100 text-orange-800',
};

// Text Colors for Payment Status
export const PAYMENT_STATUS_TEXT_COLORS = {
  [PAYMENT_STATUS.PENDING]: 'text-yellow-600',
  [PAYMENT_STATUS.PROCESSING]: 'text-blue-600',
  [PAYMENT_STATUS.COMPLETED]: 'text-green-600',
  [PAYMENT_STATUS.FAILED]: 'text-red-600',
  [PAYMENT_STATUS.REFUNDED]: 'text-orange-600',
};

// Stat Card Colors
export const STAT_CARD_COLORS = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  purple: 'bg-purple-50 text-purple-600',
  red: 'bg-red-50 text-red-600',
  orange: 'bg-orange-50 text-orange-600',
};

// Helper function to get status color
export function getStatusColor(status, type = 'lot') {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
}

// Helper function to get payment text color
export function getPaymentStatusColor(status) {
  return PAYMENT_STATUS_TEXT_COLORS[status] || 'text-gray-600';
}
