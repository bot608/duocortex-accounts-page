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
 * Authenticate with Apple using NextAuth session data
 * @param {Object} session - NextAuth session object containing Apple user data
 * @returns {Promise<Object>} Authentication result
 */
export async function authenticateWithApple(session) {
  try {
    const email = session.user?.email || session.token?.email;
    const name = session.user?.name || session.token?.name || 'Apple User';
    const appleId = session.token?.providerId || session.token?.sub;
    
    const profileData = {
      name,
      email,
      appleId,
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
        user: response.data.user || { email, name, appleId },
        isNewUser: response.data.isNewUser || false,
      };
    }
    
    return {
      success: false,
      error: response.data.message || 'Apple authentication failed',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Apple authentication failed',
    };
  }
}

