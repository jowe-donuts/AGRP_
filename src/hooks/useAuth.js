/**
 * useAuth Hook
 * Manages user authentication state and provides auth methods
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('authToken');
        
        if (savedToken) {
          setToken(savedToken);
          // Verify token by fetching user profile
          const profile = await api.auth.getProfile(savedToken);
          setUser(profile);
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        // Clear invalid token
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Register new user
  const register = useCallback(async (email, password, fullName) => {
    try {
      setError(null);
      setLoading(true);

      const response = await api.auth.register(email, password, fullName);

      if (response.access_token) {
        // Save token
        localStorage.setItem('authToken', response.access_token);
        setToken(response.access_token);

        // Fetch user profile
        const profile = await api.auth.getProfile(response.access_token);
        setUser(profile);

        return { success: true, user: profile };
      }

      throw new Error(response.message || 'Registration failed');
    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
      console.error('Registration error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Login user
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await api.auth.login(email, password);

      if (response.access_token) {
        // Save token
        localStorage.setItem('authToken', response.access_token);
        setToken(response.access_token);

        // Fetch user profile
        const profile = await api.auth.getProfile(response.access_token);
        setUser(profile);

        return { success: true, user: profile };
      }

      throw new Error(response.message || 'Login failed');
    } catch (err) {
      const errorMsg = err.message || 'Invalid email or password';
      setError(errorMsg);
      console.error('Login error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (data) => {
    try {
      setError(null);

      if (!token) throw new Error('Not authenticated');

      const updatedProfile = await api.auth.updateProfile(token, data);
      setUser(updatedProfile);

      return { success: true, user: updatedProfile };
    } catch (err) {
      const errorMsg = err.message || 'Failed to update profile';
      setError(errorMsg);
      console.error('Profile update error:', err);
      return { success: false, error: errorMsg };
    }
  }, [token]);

  // Logout user
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  return {
    // State
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,

    // Methods
    register,
    login,
    logout,
    updateProfile
  };
}
