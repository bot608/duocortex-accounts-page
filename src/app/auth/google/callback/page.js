"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { handleGoogleCallback, showAccountSuspendedDialog } from '@/lib/googleAuth';

export default function GoogleCallback() {
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);
  const router = useRouter();
  const { socialLogin } = useAuth();

  useEffect(() => {
    const processGoogleCallback = async () => {
      try {
        // Handle the Google OAuth callback using the same logic as frontend
        const result = await handleGoogleCallback();

        if (result.success && result.token) {
          // Store token in localStorage (matching frontend behavior)
          localStorage.setItem('accessToken', result.token);
          
          // Use socialLogin to complete the authentication
          const socialLoginResult = await socialLogin(result.user, result.token);
          
          if (socialLoginResult.success) {
            // Redirect to dashboard (matching frontend behavior)
            router.push('/dashboard');
          } else {
            setError(socialLoginResult.error || 'Failed to complete login');
            setIsProcessing(false);
          }
        } else if (result.error) {
          if (result.isAccountSuspended) {
            // Show account suspended dialog (matching frontend behavior)
            await showAccountSuspendedDialog();
            router.push('/login');
          } else {
            setError(result.error);
            setIsProcessing(false);
          }
        } else {
          setError('Google authentication failed');
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Google callback error:', err);
        setError('An error occurred during Google authentication');
        setIsProcessing(false);
      }
    };

    processGoogleCallback();
  }, [router, socialLogin]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing Google authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Authentication Failed
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}