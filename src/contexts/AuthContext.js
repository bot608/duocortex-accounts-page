'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { validateToken, getCurrentUser, setAuthData, clearAuthData, isAuthenticated, needsRevalidation, authenticateUser, updateLastValidation } from '@/lib/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [validating, setValidating] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      // Prevent multiple simultaneous validations or re-initialization
      if (validating || initialized) return;
      
      try {
        setValidating(true);
        
        if (isAuthenticated()) {
          const userData = getCurrentUser();
          const token = localStorage.getItem('accessToken');
          
          if (userData && token) {
            // Check if we need to revalidate (rate limiting)
            if (needsRevalidation()) {
              // Validate the stored token
              const validation = await validateToken(token);
              
              if (validation.valid && validation.user) {
                setUser(validation.user);
                setAuthenticated(true);
                // Update validation timestamp to prevent immediate re-validation
                updateLastValidation();
              } else {
                // Token is invalid, clear auth data
                clearAuthData();
                setUser(null);
                setAuthenticated(false);
              }
            } else {
              // Use stored user data, no need to revalidate yet
              setUser(userData);
              setAuthenticated(true);
            }
          } else {
            // No user data or token, ensure clean state
            clearAuthData();
            setUser(null);
            setAuthenticated(false);
          }
        } else {
          // Not authenticated, ensure clean state
          setUser(null);
          setAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthData();
        setUser(null);
        setAuthenticated(false);
      } finally {
        setValidating(false);
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, [validating, initialized]);

  // Handle login with email and password
  const login = async (email, password) => {
    // Prevent multiple simultaneous logins
    if (validating) return { success: false, error: 'Authentication in progress' };
    
    try {
      setLoading(true);
      setValidating(true);
      
      const loginResult = await authenticateUser(email, password);
      
      if (loginResult.success && loginResult.token && loginResult.user) {
        setAuthData(loginResult.token, loginResult.user);
        setUser(loginResult.user);
        setAuthenticated(true);
        setInitialized(true);
        return { success: true };
      } else {
        throw new Error(loginResult.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      clearAuthData();
      setUser(null);
      setAuthenticated(false);
      return { success: false, error: error.message };
    } finally {
      setValidating(false);
      setLoading(false);
    }
  };

  // Handle logout
  const logout = () => {
    clearAuthData();
    setUser(null);
    setAuthenticated(false);
    setInitialized(false);
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    setAuthData(localStorage.getItem('accessToken'), userData);
  };

  // Refresh user data from backend - memoized to prevent infinite loops
  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const validation = await validateToken(token);
        if (validation.valid && validation.user) {
          setUser(validation.user);
          setAuthData(token, validation.user);
          // Update validation timestamp to prevent immediate re-validation
          updateLastValidation();
          return validation.user;
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
    return null;
  }, []); // Empty dependency array since it only depends on localStorage and API calls

  const value = {
    user,
    loading,
    authenticated,
    login,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};