import { ENV_CONFIG } from '@/config/environment';

/**
 * Initiate Google Sign-In (redirect to backend OAuth endpoint)
 * This matches the frontend implementation
 */
export function initiateGoogleSignIn() {
  try {
    window.location.href = `${ENV_CONFIG.BACKEND_URL}/auth/google`;
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw error;
  }
}

/**
 * Handle Google OAuth callback from URL parameters
 * This matches the frontend GoogleLogin component logic
 * @returns {Promise<Object>} Authentication result
 */
export async function handleGoogleCallback() {
  try {
    const url = window.location.href;
    let accessToken = null;
    let error = null;

    if (url.includes('?')) {
      const queryString = url.split('?')[1];
      const queryParams = queryString.split('&');

      for (let param of queryParams) {
        const [key, value] = param.split('=');
        if (key === 'accessToken') {
          accessToken = decodeURIComponent(value);
        }
        if (key === 'error') {
          error = decodeURIComponent(value);
        }
      }
    }

    if (error) {
      return {
        success: false,
        error: error,
        isAccountSuspended: error === 'Account suspended by admin'
      };
    }
    
    if (accessToken) {
      return {
        success: true,
        token: accessToken,
        user: null // User data will be fetched by AuthContext
      };
    }
    
    return {
      success: false,
      error: 'No access token found in the URL!'
    };
  } catch (err) {
    console.error('Google callback error:', err);
    return {
      success: false,
      error: 'An error occurred while processing Google authentication!'
    };
  }
}

/**
 * Show account suspended dialog (matches frontend implementation)
 * @param {Function} onContactAdmin - Callback when user clicks contact admin
 * @returns {Promise<boolean>} Whether user chose to contact admin
 */
export async function showAccountSuspendedDialog(onContactAdmin) {
  // This would typically use a modal library like SweetAlert2
  // For now, we'll use a simple confirm dialog
  const shouldContact = confirm(
    'Account Suspended By Admin\n\nIf this is a mistake, please contact the admin with the registered email.\n\nClick OK to contact admin via email.'
  );
  
  if (shouldContact) {
    const subject = encodeURIComponent('Account Suspension Appeal');
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=noreplyduocortex@gmail.com&su=${subject}`,
      '_blank'
    );
    if (onContactAdmin) onContactAdmin();
  }
  
  return shouldContact;
}