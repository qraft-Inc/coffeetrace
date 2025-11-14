import { getServerSession } from 'next-auth/next';
import { getSession } from 'next-auth/react';
import { authOptions } from './authOptions';
import { USER_ROLES, DASHBOARD_PATHS } from './constants';

/**
 * Get current user session on server side
 * Use this in Server Components and API routes
 */
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get current user session on client side
 * Use this in Client Components
 */
export async function getCurrentUserClient() {
  try {
    const session = await getSession();
    return session?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if user has required role(s)
 * @param {Object} session - NextAuth session object
 * @param {string|string[]} allowedRoles - Single role or array of roles
 * @returns {boolean}
 */
export function checkRole(session, allowedRoles) {
  if (!session?.user?.role) return false;
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(session.user.role);
}

/**
 * Check if user is a farmer
 */
export function isFarmer(session) {
  return session?.user?.role === USER_ROLES.FARMER;
}

/**
 * Check if user is a buyer
 */
export function isBuyer(session) {
  return session?.user?.role === USER_ROLES.BUYER;
}

/**
 * Check if user is a coop admin
 */
export function isCoopAdmin(session) {
  return session?.user?.role === USER_ROLES.COOP_ADMIN;
}

/**
 * Check if user is an investor
 */
export function isInvestor(session) {
  return session?.user?.role === USER_ROLES.INVESTOR;
}

/**
 * Check if user is a system admin
 */
export function isAdmin(session) {
  return session?.user?.role === USER_ROLES.ADMIN;
}

/**
 * Get dashboard path for a given role
 * @param {string} role - User role
 * @returns {string} Dashboard path
 */
export function getDashboardPath(role) {
  return DASHBOARD_PATHS[role] || '/dashboard';
}

/**
 * Redirect to appropriate dashboard based on role
 * @param {string} role - User role
 * @returns {string} Redirect URL
 */
export function redirectByRole(role) {
  return getDashboardPath(role);
}

/**
 * Check if user owns a resource
 * @param {Object} session - NextAuth session
 * @param {string} resourceUserId - User ID of resource owner
 * @returns {boolean}
 */
export function isOwner(session, resourceUserId) {
  return session?.user?.id === resourceUserId?.toString();
}

/**
 * Check if user can access farmer data
 * Farmers can access their own data, admins can access all
 */
export function canAccessFarmerData(session, farmerId) {
  if (!session?.user) return false;
  
  const { role, farmerProfile, id } = session.user;
  
  // Admin can access all
  if (role === USER_ROLES.ADMIN || role === USER_ROLES.COOP_ADMIN) {
    return true;
  }
  
  // Farmer can access their own profile
  if (role === USER_ROLES.FARMER) {
    return farmerProfile?.toString() === farmerId?.toString() || id === farmerId?.toString();
  }
  
  return false;
}

/**
 * Check if user can access buyer data
 */
export function canAccessBuyerData(session, buyerId) {
  if (!session?.user) return false;
  
  const { role, buyerProfile, id } = session.user;
  
  // Admin can access all
  if (role === USER_ROLES.ADMIN) {
    return true;
  }
  
  // Buyer can access their own profile
  if (role === USER_ROLES.BUYER) {
    return buyerProfile?.toString() === buyerId?.toString() || id === buyerId?.toString();
  }
  
  return false;
}

/**
 * Get user's role display name
 */
export function getRoleDisplayName(role) {
  const roleNames = {
    [USER_ROLES.FARMER]: 'Farmer',
    [USER_ROLES.COOP_ADMIN]: 'Cooperative Admin',
    [USER_ROLES.BUYER]: 'Buyer',
    [USER_ROLES.INVESTOR]: 'Investor',
    [USER_ROLES.ADMIN]: 'System Admin',
  };
  
  return roleNames[role] || 'User';
}
