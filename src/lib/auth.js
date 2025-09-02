import api, { endpoints } from './axios';

/**
 * Authenticate user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Authentication result
 */
export async function authenticateUser(email, password) {
  try {
    const response = await api.post(endpoints.login, {
      email,
      password,
      // Add device_id if needed - for now using a placeholder
      device_id: 'web-client-' + Date.now()
    });

    if (response.data && response.data.token) {
      return {
        success: true,
        token: response.data.token,
        user: response.data.user || { email }
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Login failed'
      };
    }
  } catch (error) {
    console.error('Authentication failed:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Login failed'
    };
  }
}

/**
 * Validate access token by calling the backend
 * @param {string} token - Access token
 * @returns {Promise<Object>} User info if valid
 */
export async function validateToken(token) {
  try {
    // Don't validate if no token provided
    if (!token || token.trim() === '') {
      return { valid: false, error: 'No token provided' };
    }

    // Call the backend to validate token
    const response = await api.get(endpoints.getProfile, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data) {
      // Update last validation timestamp on successful validation
      updateLastValidation();
      
      return { valid: true, user: response.data };
    } else {
      return { valid: false, error: 'Invalid token' };
    }
  } catch (error) {
    console.error('Token validation failed:', error);
    
    // If token is invalid (401), clear stored auth data to prevent retry loops
    if (error.response?.status === 401) {
      clearAuthData();
    }
    
    return { valid: false, error: error.response?.data?.message || error.message };
  }
}

/**
 * Extract user info from stored token/data
 * @returns {Object|null} User info if available
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  try {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Store user authentication data
 * @param {string} token - Access token
 * @param {Object} userInfo - User information
 */
export function setAuthData(token, userInfo) {
  if (typeof window === 'undefined') return;
  
  // Store token with timestamp for expiration check
  const authData = {
    token,
    timestamp: Date.now(),
    userInfo
  };
  
  localStorage.setItem('accessToken', token);
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
  localStorage.setItem('authData', JSON.stringify(authData));
  localStorage.setItem('lastValidation', Date.now().toString());
}

/**
 * Clear authentication data
 */
export function clearAuthData() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('authData');
  localStorage.removeItem('lastValidation');
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('accessToken');
  return !!token;
}

/**
 * Check if token needs revalidation (avoid continuous calls)
 * @returns {boolean} True if token needs revalidation
 */
export function needsRevalidation() {
  if (typeof window === 'undefined') return true;
  
  const lastValidation = localStorage.getItem('lastValidation');
  if (!lastValidation) return true;
  
  // Only revalidate after 10 minutes (600000ms) to prevent continuous calls
  const tenMinutes = 10 * 60 * 1000;
  const timeSinceLastValidation = Date.now() - parseInt(lastValidation);
  
  return timeSinceLastValidation > tenMinutes;
}

/**
 * Update last validation timestamp
 */
export function updateLastValidation() {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('lastValidation', Date.now().toString());
}