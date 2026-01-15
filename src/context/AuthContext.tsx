/**
 * Auth Context Provider
 * Global authentication state management using React Context API
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, AuthContextType } from '@/shared/types/auth.types';
import { AuthContext } from './AuthContextStore';
import { tokenManager } from '@utils/tokenManager';
import * as authService from '@services/authService';
import { ROUTES } from '@/shared';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  /**
   * Initialize auth state from localStorage on mount
   * Check for refresh token to determine if user is authenticated
   * Access token is stored in httpOnly cookie by the backend
   */
  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = tokenManager.getRefreshToken();
      const storedUser = tokenManager.getUser();

      console.log('🔐 [AuthContext] Initializing auth:', {
        hasRefreshToken: !!refreshToken,
        hasStoredUser: !!storedUser,
      });

      if (refreshToken && storedUser) {
        setUser(storedUser);
        console.log('🔐 [AuthContext] User restored from localStorage:', storedUser);
      } else {
        console.log('🔐 [AuthContext] No valid tokens or user in localStorage');
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔐 [AuthContext] Starting login for:', email);
      const response = await authService.signIn({ email, password });

      console.log('🔐 [AuthContext] Login successful, response:', {
        user: response.user,
        hasRefreshToken: !!response.refreshToken,
      });

      // Backend automatically sets access_token in httpOnly cookie
      tokenManager.setRefreshToken(response.refreshToken);
      tokenManager.setUser(response.user);

      console.log('🔐 [AuthContext] Refresh token and user saved to localStorage');

      setUser(response.user);
      console.log('🔐 [AuthContext] User state updated, navigating to home');

      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('❌ [AuthContext] Login error:', error);
      throw error;
    }
  }, [navigate]);

  /**
   * Login with OAuth provider (Google, Facebook, etc.)
   */
  const loginWithOAuth = useCallback(async (provider: 'google' | 'facebook') => {
    try {
      console.log('🔐 [AuthContext] loginWithOAuth called with provider:', provider);
      const response = await authService.initOAuthFlow(provider);
      console.log('🔐 [AuthContext] OAuth flow initiated, response URL:', response.url);

      // Parse and log the redirect URL components
      try {
        const url = new URL(response.url);
        console.log('🔐 [AuthContext] OAuth redirect URL components:', {
          protocol: url.protocol,
          host: url.host,
          pathname: url.pathname,
          searchParams: {
            redirect_to: url.searchParams.get('redirect_to'),
            client_id: url.searchParams.get('client_id'),
            provider: url.searchParams.get('provider'),
          },
        });
      } catch (urlError) {
        console.warn('⚠️ [AuthContext] Could not parse OAuth URL:', urlError);
      }

      // Redirect to OAuth provider - this takes user away from the app
      console.log('🔐 [AuthContext] About to redirect to:', response.url);
      window.location.href = response.url;
    } catch (error) {
      console.error('❌ [AuthContext] OAuth initiation error:', error);
      throw error;
    }
  }, []);

  /**
   * Logout current user
   */
  const logout = useCallback(() => {
    authService.signOut().catch(console.error);
    tokenManager.clearAll();
    setUser(null);
    navigate(ROUTES.LOGIN);
  }, [navigate]);

  /**
   * Update user data in context and localStorage
   */
  const updateUser = useCallback((newUser: User) => {
    setUser(newUser);
    tokenManager.setUser(newUser);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithOAuth,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
