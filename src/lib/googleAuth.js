import axios from 'axios';
import { ENV_CONFIG } from '@/config/environment';

/**
 * Generate a device ID for web client
 */
function generateWebDeviceId() {
  if (typeof window === 'undefined') {
    return `web-server-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }
  return `web-client-${Date.now()}-${Math.random().toString(36).substring(2)}`;
}

/**
 * Authenticate with Google using NextAuth user data
 * @param {Object} googleUser - Google user object from NextAuth
 * @returns {Promise<Object>} Authentication result
 */
export async function authenticateWithGoogle(googleUser) {
  try {
    const profileData = {
      name: googleUser.name,
      email: googleUser.email,
      photo: googleUser.picture,
      googleId: googleUser.id || googleUser.sub,
      device_id: generateWebDeviceId(),
    };
    
    const response = await axios.post(`${ENV_CONFIG.BACKEND_URL}/auth/login`, profileData, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.data && response.data.token) {
      return {
        success: true,
        token: response.data.token,
        user: response.data.user || { 
          email: googleUser.email, 
          name: googleUser.name, 
          googleId: googleUser.id 
        },
        isNewUser: response.data.isNewUser || false,
      };
    }
    
    return {
      success: false,
      error: response.data.message || 'Google authentication failed',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Google authentication failed',
    };
  }
}